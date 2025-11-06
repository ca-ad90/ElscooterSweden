import { ExecArgs } from "@medusajs/framework/types";
import readline from "readline";
import {
    ContainerRegistrationKeys,
    Modules,
    ProductStatus,
} from "@medusajs/framework/utils";
import {
    createInventoryLevelsWorkflow,
    createProductsWorkflow,
    createProductCategoriesWorkflow,
    createProductTypesWorkflow,
} from "@medusajs/medusa/core-flows";
import { sanitySyncProductsWorkflow } from "../workflows/sanity-sync-products";

interface ProductOptionsConfig {
    variantsCount: number;
    currencyCode?: string;
}

interface ProductGenerationContext {
    faker: any;
    index: number;
    salesChannelId: string;
    shippingProfileId?: string;
    categoryIds: string[];
    typeId?: string;
    config: ProductOptionsConfig;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PRODUCT_TYPES = ["Electric Bikes", "Electric Scooters"];
const DEFAULT_CATEGORY_NAMES = ["Main", "Tillbehör", "Kläder", "Saker"];
const DEFAULT_SIZE_OPTIONS = ["S", "M", "L", "XL"];
const DEFAULT_COLOR_OPTION_VALUES = [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Orange",
    "Purple",
    "Pink",
    "Brown",
    "Gray",
    "Silver",
    "Gold",
];
const DEFAULT_TASTE_OPTIONS = ["Sweet", "Salty", "Sour", "Bitter", "Umami"];
const DEFAULT_LOCKED_OPTIONS = ["true", "false"];
const DEFAULT_CURRENCY_CODE = "sek";
const DEFAULT_STOCKED_QUANTITY = 11;
const SYNC_DELAY_MS = 10000;
function rnd(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        }),
    );
}

function getRandomColors(count: number = 5): string[] {
    const shuffled = [...DEFAULT_COLOR_OPTION_VALUES].sort(
        () => Math.random() - 0.5,
    );
    return shuffled.slice(0, count);
}
export default async function seedDummyStore({ container }: ExecArgs) {
    const productModuleService = container.resolve(Modules.PRODUCT);
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const stockLocationModuleService = container.resolve(
        Modules.STOCK_LOCATION,
    );
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    let [productTypesResult, productCategoriesResult, [, productCount]] =
        await Promise.all([
            productModuleService.listProductTypes(),
            productModuleService.listProductCategories(),
            productModuleService.listAndCountProducts(),
        ]);

    let UploadedProductTypes = await productModuleService.createProductTypes(
        DEFAULT_PRODUCT_TYPES.filter(
            (type) => !productTypesResult.some((t) => t.value === type),
        ).map((type) => ({ value: type })),
    );
    let UploadedProductCategories =
        await productModuleService.createProductCategories(
            DEFAULT_CATEGORY_NAMES.filter(
                (category) =>
                    !productCategoriesResult.some((c) => c.name === category),
            ).map((category) => ({ name: category })),
        );

    let productCategories = [
        ...productCategoriesResult.map((category) => ({
            id: category.id,
            name: category.name,
        })),
        ...UploadedProductCategories.map((category) => ({
            id: category.id,
            name: category.name,
        })),
    ];
    let productTypes = [
        ...productTypesResult.map((type) => ({
            id: type.id,
            value: type.value,
        })),
        ...UploadedProductTypes.map((type) => ({
            id: type.id,
            value: type.value,
        })),
    ];

    async function setupStockLocations() {
        let stockLocations;
        const stockLocationsResult =
            await stockLocationModuleService.listStockLocations({
                name: "Default Stock Location",
            });
        if (!stockLocationsResult.length) {
            stockLocations =
                await stockLocationModuleService.createStockLocations([
                    { name: "Default Stock Location" },
                ]);
        } else {
            stockLocations = stockLocationsResult[0];
        }
        return { id: stockLocations.id };
    }
    async function setupShippingProfiles() {
        let shippingProfiles;
        const shippingProfilesResult =
            await fulfillmentModuleService.listShippingProfiles({
                name: "Default Shipping Profile",
            });
        if (!shippingProfilesResult.length) {
            shippingProfiles =
                await fulfillmentModuleService.createShippingProfiles([
                    { name: "Default Shipping Profile", type: "default" },
                ]);
        } else {
            shippingProfiles = shippingProfilesResult[0];
        }
        return { id: shippingProfiles.id };
    }
  async function setupSalesChannel(container: any): Promise<{ id: string }> {
        let salesChannel;
        const salesChannelResult =
            await salesChannelModuleService.listSalesChannels({
                name: "Default Sales Channel",
            });

        if (!salesChannelResult?.[0]) {
            salesChannel = await salesChannelModuleService.createSalesChannels([
                { name: "Default Sales Channel" },
            ]);
        } else {
            salesChannel = salesChannelResult;
        }
        return { id: salesChannel[0].id };
    }
    function generateProductOptions(): Array<{
        title: string;
        values: string[];
    }> {
        const allOptionsPool = [
            { title: "Size", values: DEFAULT_SIZE_OPTIONS },
            { title: "Color", values: getRandomColors() },
            { title: "Taste", values: DEFAULT_TASTE_OPTIONS },
            { title: "Locked", values: DEFAULT_LOCKED_OPTIONS },
        ];

        const optionCount = Math.max(
            1,
            Math.min(3, Math.floor(Math.random() * 3) + 1),
        );
        const productOptions = [...allOptionsPool];

        while (productOptions.length > optionCount) {
            productOptions.splice(
                Math.floor(Math.random() * productOptions.length),
                1,
            );
        }

        return productOptions;
    }
    function generateProductMetadata(faker: any): Record<string, any> {
        return {
            specs: {
                Batterikapacitet: rnd(100, 1000) + "mAh",
                Motorstyrka: rnd(500, 1000) + "W",
                Hjulstorlek: rnd(16, 22) + "inch",
                Rammaterial: faker.commerce.productMaterial(),
                Fjädringstyp: ["Hardtail", "Softtail", "Full Suspension"][
                    rnd(0, 2)
                ],
                Bromstyp: ["Disk", "Våd", "Tråd"][rnd(0, 2)],
                Räckvidd: rnd(100, 1000) + "km",
                Toppfart: rnd(20, 25) + "km/h",
                Maxvikt: rnd(100, 1000) + "kg",
                Hopfällbar: ["true", "false"][rnd(0, 1)],
                Antal_växlar: rnd(1, 10),
                Displaytyp: ["LED", "LCD", "OLED"][rnd(0, 2)],
                Däcktyp: ["Kardan", "Kardan", "Kardan"][rnd(0, 2)],
            },
        };
    }
    function generateProductVariants(
        title: string,
        index: number,
        productOptions: Array<{ title: string; values: string[] }>,
        variantsCount: number,
        currencyCode: string = DEFAULT_CURRENCY_CODE,
    ) {
        const pickVariantOptions = () => {
            const selected: Record<string, string> = {};
            productOptions.forEach((opt) => {
                selected[opt.title] =
                    opt.values[Math.floor(Math.random() * opt.values.length)];
            });
            return selected;
        };

        return new Array(variantsCount).fill(0).map((_, variantIndex) => {
            const variantOptions = pickVariantOptions();
            return {
                title: `${title} ${variantIndex}`,
                sku: `variant-${variantIndex}${index}`,
                prices: [
                    { currency_code: currencyCode, amount: rnd(1000, 50000) },
                ],
                options: variantOptions,
            };
        });
    }
    async function generateProduct(context: ProductGenerationContext) {
        const {
            faker,
            index,
            salesChannelId,
            shippingProfileId,
            categoryIds,
            typeId,
            config,
        } = context;
        const { variantsCount, currencyCode = DEFAULT_CURRENCY_CODE } = config;

        const title = faker.commerce.product() + "_" + index;
        const description = faker.commerce.productDescription();
        const productOptions = generateProductOptions();
        const variants = generateProductVariants(
            title,
            index,
            productOptions,
            variantsCount,
            currencyCode,
        );
        const metadata = generateProductMetadata(faker);

        return {
            title,
            description,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfileId,
            sales_channels: [{ id: salesChannelId }],
            images: [
                { url: faker.image.url({}) },
                { url: faker.image.url({}) },
            ],
            options: productOptions,
            variants,
            category_ids: categoryIds,
            type_id: typeId,
            metadata,
        };
    }
    async function generateProducts(
        faker: any,
        count: number,
        startIndex: number,
        salesChannelId: string,
        shippingProfileId: string | undefined,
        categoryIds: string[],
        typeId: string | undefined,
        config: ProductOptionsConfig,
    ): Promise<any[]> {
        const contexts = new Array(count).fill(0).map((_, i) => ({
            faker,
            index: startIndex + i,
            salesChannelId,
            shippingProfileId,
            categoryIds,
            typeId,
            config,
        }));

        return Promise.all(contexts.map((ctx) => generateProduct(ctx)));
    }

    // ============================================================================
    // Workflow Functions
    // ============================================================================

    async function createProducts(
        productsData
    ): Promise<any[]> {
        const products = await productModuleService.createProducts(productsData);
        return products;
    }

    async function syncProductsToSanity(
        container: any,
        productIds: string[],
        delayMs: number = SYNC_DELAY_MS,
    ): Promise<number> {
        // Wait to ensure all database transactions are committed
        await new Promise((resolve) =>
            setTimeout(() => resolve(true), delayMs),
        );

        const { result } = await sanitySyncProductsWorkflow(container).run({
            input: { product_ids: productIds },
        });

        return result?.total || 0;
    }

    async function seedInventoryLevels(
        container: any,
        query: any,
        products: any[],
        stockedQuantity: number = DEFAULT_STOCKED_QUANTITY,
    ): Promise<void> {
        const variantSkus = products.flatMap(
            (p) => p.variants?.map((v: any) => v.sku) || [],
        );
        const variantInventoryItems = await getInventoryItemsBySku(
            query,
            variantSkus,
        );
        const stockLocations = await getStockLocations(query);

        if (!stockLocations.length) {
            throw new Error("No stock locations found");
        }

        const inventoryLevels = variantInventoryItems.map((inventoryItem) => ({
            location_id: stockLocations[0].id,
            stocked_quantity: stockedQuantity,
            inventory_item_id: inventoryItem.id,
        }));

        await createInventoryLevelsWorkflow(container).run({
            input: { inventory_levels: inventoryLevels },
        });
    }

    // ============================================================================
    // Main Function
    // ============================================================================

    async function MainFunction({ container }: ExecArgs) {
        const { faker } = await import("@faker-js/faker");
        const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
        const query = container.resolve(ContainerRegistrationKeys.QUERY);

        // Setup
        logger.info("Setting up sales channel...");
        const salesChannel = await setupSalesChannel(container);

        logger.info("Ensuring product types exist...");
        const productTypesResult = await ensureProductTypes(container, query);

        logger.info("Ensuring product categories exist...");
        const categoryResults = await ensureProductCategories(container, query);

        // Get user input
        const productsNum =
            Number(
                await prompt(
                    "How many demo products do you want to create? (default: 1): ",
                ),
            ) || 1;
        const variantsNum =
            Number(
                await prompt("How many variants per product? (default: 3): "),
            ) || 3;

        // Get existing products count
        const existingProductsCount = await getExistingProductsCount(query);
        logger.info(
            `There are currently ${existingProductsCount} products in the database.`,
        );

        // Get additional context
        const shippingProfileId = await getShippingProfileId(query);
        const categoryIds = categoryResults.map((category) => category.id);
        const typeId =
            productTypesResult.length > 0
                ? productTypesResult[
                      Math.floor(Math.random() * productTypesResult.length)
                  ].id
                : undefined;

        // Generate products
        logger.info(`Generating ${productsNum} products...`);
        const productsData = await generateProducts(
            faker,
            productsNum,
            existingProductsCount + 1,
            salesChannel.id,
            shippingProfileId,
            categoryIds,
            typeId,
            { variantsCount: variantsNum },
        );

        // Create products
        logger.info("Creating products...");
        const products = await createProducts(container, productsData);
        logger.info(`Seeded ${products.length} products.`);

        // Sync to Sanity
        logger.info("Syncing products to Sanity...");
        try {
            const productIds = products.map((p) => p.id);
            const syncedCount = await syncProductsToSanity(
                container,
                productIds,
            );
            logger.info(
                `Successfully synced ${syncedCount} products to Sanity.`,
            );
        } catch (error) {
            logger.error(`Error syncing products to Sanity:`, error);
            throw error;
        }

        // Seed inventory
        logger.info("Seeding inventory levels...");
        await seedInventoryLevels(container, query, products);
        logger.info("Finished seeding inventory levels data.");
    }
}
