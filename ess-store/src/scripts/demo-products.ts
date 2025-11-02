import { ExecArgs } from "@medusajs/framework/types";

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
import { sanitySyncCategoriesWorkflow } from "../workflows/sanity-sync-categories";
import { sanitySyncVariantsWorkflow } from "../workflows/sanity-sync-variants";
function rnd(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export default async function seedDummyProducts({ container }: ExecArgs) {
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
    if (newProductTypes.length > 0) {
        const { result: newTypesResult } = await createProductTypesWorkflow(container).run({
            input: {
                product_types: newProductTypes.map((type) => ({
                    name: type,
                    value: type,
                })),
            },
        });
        productTypesResult.push(...newTypesResult);
    }

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

        // Sync new categories to Sanity
        logger.info("Syncing new categories to Sanity...");
        await sanitySyncCategoriesWorkflow(container).run({
            input: {
                category_ids: newCategoriesResult.map(c => c.id),
            },
        });
        logger.info("Finished syncing categories to Sanity.");
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
    const productsNum = 5;
    const variantsNum = 3;

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
    const productsData = await Promise.all(new Array(productsNum).fill(0).map(async (_, index) => await generateProduct(index)));


    const { result: products } = await createProductsWorkflow(container).run({
        input: {
            products: productsData,
        },
    });

    logger.info(`Seeded ${products.length} products.`);

    // Sync products and variants to Sanity
    logger.info("Syncing products to Sanity...");
    await sanitySyncProductsWorkflow(container).run({
        input: {
            product_ids: products.map(p => p.id),
        },
    });
    logger.info("Finished syncing products to Sanity.");

    // Sync variants to Sanity (extract variant IDs from created products)
    logger.info("Syncing variants to Sanity...");
    const variantIds = products.flatMap(p => p.variants?.map(v => v.id) || []);
    if (variantIds.length > 0) {
        await sanitySyncVariantsWorkflow(container).run({
            input: {
                variant_ids: variantIds,
            },
        });
        logger.info("Finished syncing variants to Sanity.");
    }

    logger.info("Seeding inventory levels.");

    const { data: stockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id"],
    });

    const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id"],
    });

    const inventoryLevels = inventoryItems.map((inventoryItem) => ({
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
