import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
    ProductDTO,
    ProductVariantDTO,
    InventoryItemDTO,
} from "@medusajs/framework/types";
import type {
    Product,
    ProductVariant as PV,
} from "../../../../.medusa/types/query-entry-points";
import {
    ContainerRegistrationKeys,
    promiseAll,
} from "@medusajs/framework/utils";
import SanityModuleService from "../../../modules/sanity/service";
import { SANITY_MODULE } from "../../../modules/sanity";

export type SyncStepInput = {
    product_ids?: string[];
};

type VariantOption = {
    title: string;
    value: string;
};

type VariantPrice = {
    amount: number;
    currency_code: string;
};

type ProductVariant = {
    id: string;
    title: string;
    sku: string;
    product_id: string;
    options: VariantOption[];
    prices: VariantPrice[];
};

export type ProductWithVariants = ProductDTO & {
    variants: ProductVariant[];
    specs: { title: string; value: string }[];
};

export const syncStep = createStep(
    { name: "sync-step", async: true },
    async (input: SyncStepInput, { container }) => {
        console.debug("syncStep started");
        function escapeString(str: string | undefined | number): string {
            // Replace any character not matching ^\$?[a-zA-Z0-9_-]+ with an escaped value
            if (typeof str === "number") {
                return String(str);
            }
            if (typeof str === "string" && str.match(/^\$?[a-zA-Z0-9_-]+$/)) {
                return str;
            }
            if (typeof str === "string") {
                return str.replace(/([^a-zA-Z0-9_-\s])/g, "X");
            }
            return "";
        }
        //breakpoint
        const sanityModule: SanityModuleService =
            container.resolve(SANITY_MODULE);
        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        let total = 0;
        let upsertMap: {
            before: any;
            after: any;
        }[] = [];

        let batchSize = 200;
        let hasMore = true;
        let offset = 0;
        const filters = input.product_ids
            ? {
                  id: input.product_ids,
              }
            : {};
        console.debug("filters", filters);
        console.debug("batchSize", batchSize);
        console.debug("hasMore", hasMore);
        console.debug("offset", offset);
        do {
            console.debug("HasMore");
            let productsData: ProductDTO[] = [];

            const { data: product, metadata: { count } = {} } =
                await query.graph({
                    entity: "product",
                    fields: [
                        "id",
                        "title",
                        "subtitle",
                        "status",
                        "description",
                        "thumbnail",
                        "metadata.specs",
                        "categories.name",
                        "categories.description",
                        "tags.name",
                        "type.id",
                        "type.value",
                        "options.title",
                        "options.values.value",
                        "images.url",
                        "sanity_product.*",
                    ],
                    filters,
                }).then((res) => {
                    console.debug("res", res);
                    return res;
                });

            productsData = (product as ProductDTO[]) || [];
            console.debug("products fetched successfully", productsData.length, productsData);

            // Only fetch variants if we have products
            const { data: variantsData = [] }: { data: PV[] } =
                productsData.length > 0
                    ? await query.graph({
                          entity: "product_variant",
                          fields: [
                              "product_id",
                              "id",
                              "title",
                              "sku",
                              "options.value",
                              "options.option.title",
                              "prices.amount",
                              "prices.currency_code",
                          ],
                          filters: {
                              product_id: productsData.map((p) => p.id),
                          },
                      })
                    : { data: [] };
            console.debug("variants fetched successfully");
            const variants: ProductVariant[] = variantsData.map((v: PV) => ({
                ...v,
                options: (v.options || []).map((o: any) => ({
                    title: o.option?.title || "",
                    value: o.value || "",
                })),
                prices: (v.prices || []).map((p: VariantPrice) => ({
                    amount: p.amount,
                    currency_code: p.currency_code,
                })),
            }));
            console.debug("variants transformed successfully");

            const productsWithVariants: ProductWithVariants[] =
                productsData.map((p: ProductDTO) => {
                    // Safely extract specs from metadata
                    const specsArray =
                        p.metadata?.specs &&
                        typeof p.metadata.specs === "object" &&
                        !Array.isArray(p.metadata.specs)
                            ? Object.entries(p.metadata.specs).map(
                                  ([key, value]) => ({
                                      title: escapeString(key),
                                      value: escapeString(
                                          value as string | number | undefined,
                                      ),
                                  }),
                              )
                            : [];

                    return {
                        ...p,
                        specs: specsArray,
                        variants: variants.filter((v) => v.product_id === p.id),
                    };
                });
            console.debug("productsWithVariants transformed successfully");
            // Remove metadata since we've extracted specs from it
            for (const product of productsWithVariants) {
                if (Object.prototype.hasOwnProperty.call(product, "metadata")) {
                    delete product.metadata;
                }
            }
            try {
                await promiseAll(
                    productsWithVariants.map(async (prod) => {
                        const after = await sanityModule.upsertSyncDocument(
                            "product",
                            prod as ProductWithVariants,
                        );
                        upsertMap.push({
                            // @ts-ignore
                            before: prod.sanity_product,
                            after,
                        });
                        return after;
                    }),
                );
            } catch (e) {
                return StepResponse.permanentFailure(
                    `An error occurred while syncing documents: ${e}`,
                );
            }

            offset += batchSize;
            hasMore = offset < (count ?? 0);
            total += productsData.length;
        } while(hasMore)
        return new StepResponse({ total }, upsertMap);
    },
    async (upsertMap, { container }) => {
        if (!upsertMap) {
            return;
        }

        const sanityModule: SanityModuleService =
            container.resolve(SANITY_MODULE);

        await promiseAll(
            upsertMap.map(({ before, after }) => {
                if (!before) {
                    // delete the document
                    return sanityModule.delete(after._id);
                }

                const { _id: id, ...oldData } = before;

                return sanityModule.update(id, oldData);
            }),
        );
    },
);
