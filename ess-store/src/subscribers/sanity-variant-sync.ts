import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sanitySyncVariantsWorkflow } from "../workflows/sanity-sync-variants";

export default async function upsertSanityVariant({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve("logger");

    try {
        await sanitySyncVariantsWorkflow(container).run({
            input: {
                variant_ids: [data.id],
            },
        });
        logger.info(`Synced variant ${data.id} to Sanity`);
    } catch (error) {
        logger.error(`Error syncing variant ${data.id} to Sanity:`, error);
    }
}

export const config: SubscriberConfig = {
    event: ["product_variant.created", "product_variant.updated"],
};
