import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import SanityModuleService from "../modules/sanity/service";
import { SANITY_MODULE } from "../modules/sanity";

export default async function deleteSanityProduct({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve("logger");

    try {
        const sanityModule: SanityModuleService = container.resolve(SANITY_MODULE);
        await sanityModule.delete(data.id);
        logger.info(`Deleted product ${data.id} from Sanity`);
    } catch (error) {
        logger.error(`Error deleting product ${data.id} from Sanity:`, error);
    }
}

export const config: SubscriberConfig = {
    event: "product.deleted",
};
