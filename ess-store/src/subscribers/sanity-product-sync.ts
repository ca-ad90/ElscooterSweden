import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sanitySyncProductsWorkflow } from "../workflows/sanity-sync-products";

export default async function upsertSanityProduct({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve("logger");

    try {
        await sanitySyncProductsWorkflow(container).run({
            input: {
                product_ids: [data.id],
            },
        });
        logger.info(`Synced product ${data.id} to Sanity`);
    } catch (error) {
        logger.error(`Error syncing product ${data.id} to Sanity:`, error);
    }
}

export const config: SubscriberConfig = {
    event: ["product.created", "product.updated",],
};
