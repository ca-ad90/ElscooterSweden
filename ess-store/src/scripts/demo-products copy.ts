import { ExecArgs } from "@medusajs/framework/types";
import readline from "readline";
import { createStep } from "@medusajs/framework/workflows-sdk";
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
function rnd(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



export default async function seedDummyStore({ container }: ExecArgs) {
    const { faker } = await import("@faker-js/faker");
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const defaultSalesChannel =
        await salesChannelModuleService.listSalesChannels({
            name: "Default Sales Channel",
        });

    const productTypes = ["Electric Bikes", "Electric Scooters"];

    async function listProductTypes() {
        try {
            const { data: types } = await query.graph({
                entity: "product_type",
                fields: ["id", "value"],
            });
            return types || [];
        } catch {
            return [];
        }
    }

    const currentProductTypes = await listProductTypes();
    let productTypesResult = currentProductTypes;
    const newProductTypes = productTypes.filter(
        (type) => !currentProductTypes.some((t) => t.value === type)
    );


    async function listCategories() {
        const { data: categories } = await query.graph({
            entity: "product_categories",
            fields: ["id", "name"],
        });
        return categories;
    }

    const categoryNames = ["Main", "Tillbehör", "Kläder", "Saker"];
    const currentCategories = await listCategories();
    let categoryResults = currentCategories;
        const newCategories = categoryNames.filter((category) => !currentCategories.some((c) => c.name === category));
       if(newCategories.length > 0) {
        const { result: newCategoriesResult } = await createProductCategoriesWorkflow(container).run({
            input: {
                product_categories: newCategories.map((category) => ({
                    name: category,
                })),
            },
        });
        categoryResults.push(...newCategoriesResult);
    }

    const sizeOptions = ["S", "M", "L", "XL"];
    const colorOptionValues = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown", "Gray", "Silver", "Gold"];
    const tasteOptions = ["Sweet", "Salty", "Sour", "Bitter", "Umami"];
    const lockedOptions = ["true", "false"];
    const colorOptions = () => {
        // Pick 5 different random colors
        const shuffled = [...colorOptionValues].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 5);
    };
    const currency_code = "sek";


    function prompt(question: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) =>
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer);
            })
        );
    }

    // Prompts for number of products and variants
    const productsNum = Number(
        await prompt("How many demo products do you want to create? (default: 1): ")
    ) || 1;
    const variantsNum = Number(
        await prompt("How many variants per product? (default: 3): ")
    ) || 3;

    async function generateProduct(index: number) {
        const title = faker.commerce.product() + "_" + index;
        const description = faker.commerce.productDescription();
        const status = ProductStatus.PUBLISHED;
        // Try to use an existing shipping profile if available
        let shipping_profile_id: string | undefined = undefined;
        // safe best-effort fetch; ignore errors if entity not present
        try {
            // @ts-ignore - entity name used by Medusa query engine
            const { data: shippingProfiles } = await query.graph({
                entity: "shipping_profile",
                fields: ["id"],
            });
            if (shippingProfiles?.length) {
                shipping_profile_id = shippingProfiles[0].id;
            }
        } catch {
            // ignore and proceed without shipping_profile_id
        }
        const sales_channels = [
            {
                id: defaultSalesChannel[0].id,
            },
        ]
        const images = [
            {
                url: faker.image.url({}),
            },
            {
                url: faker.image.url({}),
            },
        ]

        const allOptionsPool = [
            { title: "Size", values: sizeOptions },
            { title: "Color", values: colorOptions() },
            { title: "Taste", values: tasteOptions },
            { title: "Locked", values: lockedOptions },
        ];
        const optionCount = Math.max(1, Math.min(3, Math.floor(Math.random() * 3) + 1));
        const productOptions = [...allOptionsPool];
        while (productOptions.length > optionCount) {
            productOptions.splice(Math.floor(Math.random() * productOptions.length), 1);
        }
        const pickVariantOptions = () => {
            const selected: Record<string, string> = {};
            productOptions.forEach((opt) => {
                selected[opt.title] = opt.values[Math.floor(Math.random() * opt.values.length)];
            });
            return selected;
        };
            const variants = new Array(variantsNum).fill(0).map((_, variantIndex) => {
            const variantOptions = pickVariantOptions();
            return {
                title: `${title} ${variantIndex}`,
                sku: `variant-${variantIndex}${index}`,
                prices: [
                    { currency_code, amount: rnd(1000, 50000) },
                ],
                options: variantOptions,
            };
        });

        const category_ids = categoryResults.map((category) => category.id);
        const type_id =
            productTypesResult.length > 0
                ? productTypesResult[Math.floor(Math.random() * productTypesResult.length)].id
                : undefined;

        return {
            title,
            description,
            status,
            shipping_profile_id,
            sales_channels,
            images,
            options: productOptions,
            variants,
            category_ids,
            type_id,
            metadata: {
                specs: {
                    Batterikapacitet: rnd(100, 1000) + "mAh",
                    Motorstyrka: rnd(500, 1000) + "W",
                    Hjulstorlek: rnd(16, 22) + "inch",
                    Rammaterial: faker.commerce.productMaterial(),
                    Fjädringstyp: ["Hardtail", "Softtail", "Full Suspension"][rnd(0, 2)],
                    Bromstyp: ["Disk", "Våd", "Tråd"][rnd(0, 2)],
                    Räckvidd: rnd(100, 1000) + "km",
                    Toppfart: rnd(20, 25) + "km/h",
                    Maxvikt: rnd(100, 1000) + "kg",
                    Hopfällbar: ["true", "false"][rnd(0, 1)],
                    Antal_växlar: rnd(1, 10),
                    Displaytyp: ["LED", "LCD", "OLED"][rnd(0, 2)],
                    Däcktyp: ["Kardan", "Kardan", "Kardan"][rnd(0, 2)],
                },
            },
        }
}

// Get existing number of products
const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
});
const existingProductsCount = existingProducts.length;

logger.info(`There are currently ${existingProductsCount} products in the database.`);

const productsData = await Promise.all(new Array(productsNum).fill(0).map(async (_, index) => await generateProduct(existingProductsCount+1+index)));


    const { result: products } = await createProductsWorkflow(container).run({
        input: {
            products: productsData,
        },
    });

    logger.info(`Seeded ${products.length} products.`);
    // Sync products and variants to Sanity
    logger.info("Syncing products to Sanity...");

    // Wait a moment to ensure all database transactions are committed
   let x =  await new Promise((res) => setTimeout(()=>{{res(true)}}, 10000));
   console.debug("x", x);
    // Batch sync all products at once
    const productIds = products.map(p => p.id);
    try {
        const { result } = await sanitySyncProductsWorkflow(container).run({
            input: {
                product_ids: productIds,
            },
        });
        logger.info(`Successfully synced ${result} products to Sanity.`);
    } catch (error) {
        logger.error(`Error syncing products to Sanity:`, error);
        throw error;
    }
let variantsSku = products.flatMap(p => p.variants?.map(v => v.sku) || []);
const { data: variantInventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: {
        sku: variantsSku,
    },
});


    logger.info("Seeding inventory levels.");

    const { data: stockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id"],
    });


    const inventoryLevels = variantInventoryItems.map((inventoryItem) => ({
        location_id: stockLocations[0].id,
        stocked_quantity: 11,
        inventory_item_id: inventoryItem.id,
    }));

    await createInventoryLevelsWorkflow(container).run({
        input: {
            inventory_levels: inventoryLevels,
        },
    });

    logger.info("Finished seeding inventory levels data.");
}
