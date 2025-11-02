//@ts-nocheck
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ProductVariantDTO } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    promiseAll,
} from "@medusajs/framework/utils";
import SanityModuleService from "../../../modules/sanity/service";
import { SANITY_MODULE } from "../../../modules/sanity";

export type SyncVariantStepInput = {
    variant_ids?: string[];
};

export const syncVariantStep = createStep(
    { name: "sync-variant-step", async: true },
    async (input: SyncVariantStepInput, { container }) => {
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
        const filters = input.variant_ids
            ? {
                  id: input.variant_ids,
              }
            : {};

        while (hasMore) {
            const { data: variants, metadata: { count } = {} } =
                await query.graph({
                    entity: "product_variant",
                    fields: [
                        "id",
                        "title",
                        "sku",
                        "metadata",
                    ],
                    filters,
                    pagination: {
                        skip: offset,
                        take: batchSize,
                        order: {
                            id: "ASC",
                        },
                    },
                });
            try {
                await promiseAll(
                    variants.map(async (variant) => {
                        const after = await sanityModule.upsertSyncDocument(
                            "variant",
                            variant as ProductVariantDTO,
                        );

                        upsertMap.push({
                            before: null, // Variants don't have sanity links
                            after,
                        });
                        return after;
                    }),
                );
            } catch (e) {
                return StepResponse.permanentFailure(
                    `An error occurred while syncing variants: ${e}`,
                    upsertMap,
                );
            }

            offset += batchSize;
            hasMore = offset < (count ?? 0);
            total += variants.length;
        }
        return new StepResponse({ total }, upsertMap);
    },
    async (upsertMap, { container }) => {
        if (!upsertMap) {
            return;
        }

        const sanityModule: SanityModuleService =
            container.resolve(SANITY_MODULE);

        await promiseAll(
            upsertMap.map(({ after }) => {
                if (!after) {
                    return;
                }
                return sanityModule.delete(after._id);
            }),
        );
    },
);
