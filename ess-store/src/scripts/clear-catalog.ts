import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const BATCH_SIZE = 200;

export default async function clearCatalog({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const productModuleService = container.resolve("product");
    const inventoryModuleService = container.resolve("inventory");

    logger.info("Starting catalog wipe: inventory items → variants → products → categories");

    async function listIds(entity: keyof import("@medusajs/framework/types").RemoteQueryEntryPoints, fields: string[] = ["id"]) {
        const ids: string[] = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            // @ts-ignore entity is validated via generated types
            const { data, metadata } = await query.graph({
                entity,
                fields,
                pagination: { skip: offset, take: BATCH_SIZE },
            });

            for (const row of data ?? []) {
                if (row?.id) ids.push(row.id);
            }

            const count = metadata?.count ?? 0;
            offset += BATCH_SIZE;
            hasMore = offset < count;
        }

        return ids;
    }

    // 1) Inventory Items
    const inventoryItemIds = await listIds("inventory_items", ["id"]);
    if (inventoryItemIds.length) {
        logger.info(`Deleting ${inventoryItemIds.length} inventory items...`);
        // @ts-ignore method provided by inventory module service
        await inventoryModuleService.softDeleteInventoryItems(inventoryItemIds);
        logger.info("Inventory items deleted.");
    } else {
        logger.info("No inventory items to delete.");
    }

    // 2) Variants
    const variantIds = await listIds("product_variants", ["id"]);
    if (variantIds.length) {
        logger.info(`Deleting ${variantIds.length} variants...`);
        // @ts-ignore method provided by product module service
        await productModuleService.softDeleteProductVariants(variantIds);
        logger.info("Variants deleted.");
    } else {
        logger.info("No variants to delete.");
    }

    // 3) Products
    const productIds = await listIds("products", ["id"]);
    if (productIds.length) {
        logger.info(`Deleting ${productIds.length} products...`);
        // @ts-ignore method provided by product module service
        await productModuleService.softDeleteProducts(productIds);
        logger.info("Products deleted.");
    } else {
        logger.info("No products to delete.");
    }

    // 4) Categories
    const categoryIds = await listIds("product_categories", ["id"]);
    if (categoryIds.length) {
        logger.info(`Deleting ${categoryIds.length} categories...`);
        // @ts-ignore method provided by product module service
        await productModuleService.softDeleteProductCategories(categoryIds);
        logger.info("Categories deleted.");
    } else {
        logger.info("No categories to delete.");
    }

    logger.info("Catalog wipe completed.");
}
