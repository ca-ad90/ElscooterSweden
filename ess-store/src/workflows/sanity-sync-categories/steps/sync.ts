import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ProductCategoryDTO } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    promiseAll,
} from "@medusajs/framework/utils";
import SanityModuleService from "../../../modules/sanity/service";
import { SANITY_MODULE } from "../../../modules/sanity";

export type SyncCategoryStepInput = {
    category_ids?: string[];
};

export const syncCategoryStep = createStep(
    { name: "sync-category-step", async: true },
    async (input: SyncCategoryStepInput, { container }) => {
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
        const filters = input.category_ids
            ? {
                  id: input.category_ids,
              }
            : {};

        while (hasMore) {
            // @ts-ignore
            const { data: categories, metadata: { count } = {} } =
                await query.graph({
                    entity: "product_categories",
                    fields: [
                        "id",
                        "name",
                        "handle",
                        "description",
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
                    categories.map(async (cat) => {
                        const after = await sanityModule.upsertSyncDocument(
                            "category",
                            cat as ProductCategoryDTO,
                        );

                        upsertMap.push({
                            before: null, // Categories don't have sanity links
                            after,
                        });
                        return after;
                    }),
                );
            } catch (e) {
                return StepResponse.permanentFailure(
                    `An error occurred while syncing categories: ${e}`,
                    upsertMap,
                );
            }

            offset += batchSize;
            hasMore = offset < (count ?? 0);
            total += categories.length;
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
