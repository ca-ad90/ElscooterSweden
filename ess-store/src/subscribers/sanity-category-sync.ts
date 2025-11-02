import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sanitySyncCategoriesWorkflow } from "../workflows/sanity-sync-categories";

export default async function upsertSanityCategory({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve("logger");

    try {
        await sanitySyncCategoriesWorkflow(container).run({
            input: {
                category_ids: [data.id],
            },
        });
        logger.info(`Synced category ${data.id} to Sanity`);
    } catch (error) {
        logger.error(`Error syncing category ${data.id} to Sanity:`, error);
    }
}

export const config: SubscriberConfig = {
    event: ["product_category.created", "product_category.updated"],
};
