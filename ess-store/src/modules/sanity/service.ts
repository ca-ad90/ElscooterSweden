import { Logger, ProductDTO, ProductCategoryDTO, ProductVariantDTO } from "@medusajs/framework/types";
import {
    SanityClient,
    createClient,
    FirstDocumentMutationOptions,
} from "@sanity/client";

// ============================================================================
// Type Definitions
// ============================================================================

const SyncDocumentTypes = {
    PRODUCT: "product",
    CATEGORY: "category",
    VARIANT: "variant",
} as const;

type SyncDocumentTypes =
    (typeof SyncDocumentTypes)[keyof typeof SyncDocumentTypes];

type ModuleOptions = {
    api_token: string;
    project_id: string;
    api_version: string;
    dataset: "production" | "development";
    type_map?: Record<SyncDocumentTypes, string>;
    studio_url?: string;
};

type InjectedDependencies = {
    logger: Logger;
};

type SyncDocumentInputMap = {
    product: ProductDTO;
    category: ProductCategoryDTO;
    variant: ProductVariantDTO;
};

type SyncDocumentInputs<T extends keyof SyncDocumentInputMap> = SyncDocumentInputMap[T];

// ============================================================================
// Strategy Pattern: Sync Transformers
// ============================================================================

interface SyncTransformer<T> {
    transformForCreate: (data: T) => any;
    transformForUpdate: (data: T) => any;
}

type TransformerRegistry = {
    [K in keyof SyncDocumentInputMap]: SyncTransformer<SyncDocumentInputMap[K]>;
};

// ============================================================================
// Individual Schema Transformers
// ============================================================================

class ProductTransformer implements SyncTransformer<ProductDTO> {
    constructor(private typeMap: Record<SyncDocumentTypes, string>) {}

    transformForCreate = (product: ProductDTO) => {
        // Transform specs from metadata to Sanity format
        const specs = this.transformSpecs(product.metadata);

        // Get the cheapest variant price if available
        const cheapestPrice = this.getCheapestPrice(product.variants);

        // Transform images to reference format - SKIPPED for now as images need to be uploaded to Sanity first
        // const images = this.transformImages(product.images);

        // Transform categories to reference format - SKIPPED until categories are synced to Sanity
        // const categories = product.categories?.map((cat) => ({
        //     _type: "reference",
        //     _ref: cat.id,
        // }));

        // Transform tags to reference format - SKIPPED until tags are synced to Sanity
        // const tags = product.tags?.map((tag) => ({
        //     _type: "reference",
        //     _ref: tag.id,
        // }));

        // Transform variants to reference format - SKIPPED until variants are synced to Sanity
        // const variants = product.variants?.map((variant) => ({
        //     _type: "reference",
        //     _ref: variant.id,
        // }));

        return {
            _type: this.typeMap[SyncDocumentTypes.PRODUCT],
            _id: product.id,
            medusaId: product.id,
            title: product.title,
            slug: {
                _type: "slug",
                current: product.handle,
            },
            description: product.description || undefined,
            price: cheapestPrice || undefined,
            inStock: this.checkStockStatus(product.variants),
            specs: specs.length > 0 ? specs : undefined,
            // mainImage: images.length > 0 ? images[0] : undefined,
            // imageGallery: images.length > 1 ? { _type: "imageGallery", images: images.slice(1) } : undefined,
            // categories: categories && categories.length > 0 ? categories : undefined,
            // tags: tags && tags.length > 0 ? tags : undefined,
            // variants: variants && variants.length > 0 ? variants : undefined,
        };
    };

    transformForUpdate = (product: ProductDTO) => {
        // Transform specs from metadata to Sanity format
        const specs = this.transformSpecs(product.metadata);

        // Get the cheapest variant price if available
        const cheapestPrice = this.getCheapestPrice(product.variants);

        // Transform images to reference format - SKIPPED for now as images need to be uploaded to Sanity first
        // const images = this.transformImages(product.images);

        // Transform categories to reference format - SKIPPED until categories are synced to Sanity
        // const categories = product.categories?.map((cat) => ({
        //     _type: "reference",
        //     _ref: cat.id,
        // }));

        // Transform tags to reference format - SKIPPED until tags are synced to Sanity
        // const tags = product.tags?.map((tag) => ({
        //     _type: "reference",
        //     _ref: tag.id,
        // }));

        // Transform variants to reference format - SKIPPED until variants are synced to Sanity
        // const variants = product.variants?.map((variant) => ({
        //     _type: "reference",
        //     _ref: variant.id,
        // }));

        return {
            set: {
                title: product.title,
                slug: {
                    _type: "slug",
                    current: product.handle,
                },
                description: product.description || undefined,
                price: cheapestPrice || undefined,
                inStock: this.checkStockStatus(product.variants),
                specs: specs.length > 0 ? specs : undefined,
                // mainImage: images.length > 0 ? images[0] : undefined,
                // imageGallery: images.length > 1 ? { _type: "imageGallery", images: images.slice(1) } : undefined,
                // categories: categories && categories.length > 0 ? categories : undefined,
                // tags: tags && tags.length > 0 ? tags : undefined,
                // variants: variants && variants.length > 0 ? variants : undefined,
            },
        };
    };

    private transformSpecs(metadata: any): Array<{ title: string; value: string }> {
        if (!metadata || typeof metadata !== "object") {
            return [];
        }

        const specs: Array<{ title: string; value: string }> = [];

        // Handle specs object
        const specsObj = metadata.specs;
        if (specsObj && typeof specsObj === "object") {
            Object.entries(specsObj).forEach(([key, value]) => {
                specs.push({
                    title: key,
                    value: String(value),
                });
            });
        }

        return specs;
    }

    private getCheapestPrice(variants?: ProductDTO["variants"]): number | undefined {
        if (!variants || variants.length === 0) {
            return undefined;
        }

        // Calculate the cheapest price from variants
        // Note: In a real scenario, you'd need price data with region/currency
        // For now, we'll just return undefined as price comes from calculated_price
        return undefined;
    }

    private checkStockStatus(variants?: ProductDTO["variants"]): boolean {
        if (!variants || variants.length === 0) {
            return false;
        }

        // Check if any variant has inventory
        // This is a simplified check - you might want to integrate with inventory module
        return variants.some((v) => v.manage_inventory === false || v.allow_backorder === true);
    }

    private transformImages(images?: ProductDTO["images"]): any[] {
        if (!images || images.length === 0) {
            return [];
        }

        return images
            .sort((a, b) => a.rank - b.rank)
            .map((img) => ({
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: img.url, // In production, you'd upload and get an asset reference
                },
            }));
    }
}

class CategoryTransformer implements SyncTransformer<ProductCategoryDTO> {
    constructor(private typeMap: Record<SyncDocumentTypes, string>) {}

    transformForCreate = (category: ProductCategoryDTO) => {
        // Generate slug from name if handle is not available
        const slugValue = category.handle || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        return {
            _type: this.typeMap[SyncDocumentTypes.CATEGORY],
            _id: category.id,
            title: category.name,
            slug: {
                _type: "slug",
                current: slugValue,
            },
            description: category.description || undefined,
            // image: category.metadata?.image ? {
            //     _type: "image",
            //     asset: {
            //         _type: "reference",
            //         _ref: category.metadata.image,
            //     },
            // } : undefined,
        };
    };

    transformForUpdate = (category: ProductCategoryDTO) => {
        // Generate slug from name if handle is not available
        const slugValue = category.handle || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        return {
            set: {
                title: category.name,
                slug: {
                    _type: "slug",
                    current: slugValue,
                },
                description: category.description || undefined,
                // image: category.metadata?.image ? {
                //     _type: "image",
                //     asset: {
                //         _type: "reference",
                //         _ref: category.metadata.image,
                //     },
                // } : undefined,
            },
        };
    };
}

class VariantTransformer implements SyncTransformer<ProductVariantDTO> {
    constructor(private typeMap: Record<SyncDocumentTypes, string>) {}

    transformForCreate = (variant: ProductVariantDTO) => {
        // Transform image if available in metadata - SKIPPED as images need to be uploaded to Sanity first
        // const image = variant.metadata?.image ? {
        //     _type: "image",
        //     asset: {
        //         _type: "reference",
        //         _ref: variant.metadata.image,
        //     },
        // } : undefined;

        return {
            _type: this.typeMap[SyncDocumentTypes.VARIANT],
            _id: variant.id,
            medusaId: variant.id,
            title: variant.title,
            sku: variant.sku || undefined,
            price: undefined, // Will be set from calculated_price if available
            stock: undefined, // Will be set from inventory if available
            // image: image,
        };
    };

    transformForUpdate = (variant: ProductVariantDTO) => {
        // Transform image if available in metadata - SKIPPED as images need to be uploaded to Sanity first
        // const image = variant.metadata?.image ? {
        //     _type: "image",
        //     asset: {
        //         _type: "reference",
        //         _ref: variant.metadata.image,
        //     },
        // } : undefined;

        return {
            set: {
                title: variant.title,
                sku: variant.sku || undefined,
                price: undefined, // Will be set from calculated_price if available
                stock: undefined, // Will be set from inventory if available
                // image: image,
            },
        };
    };
}

// ============================================================================
// Main Service
// ============================================================================

class SanityModuleService {
    public client: SanityClient;
    public studioUrl?: string;
    public logger: Logger;
    public typeMap: Record<SyncDocumentTypes, string>;
    public transformers: TransformerRegistry;

    constructor({ logger }: InjectedDependencies, options: ModuleOptions) {
        this.client = createClient({
            projectId: options.project_id,
            apiVersion: options.api_version,
            dataset: options.dataset,
            token: options.api_token,
        });
        this.logger = logger;

        this.logger.info("Connected to Sanity");

        this.studioUrl = options.studio_url;

        this.typeMap = Object.assign(
            {},
            {
                [SyncDocumentTypes.PRODUCT]: "product",
                [SyncDocumentTypes.CATEGORY]: "category",
                [SyncDocumentTypes.VARIANT]: "variants",
            },
            options.type_map ?? {},
        );

        // Register transformers for each schema type
        this.transformers = {
            [SyncDocumentTypes.PRODUCT]: new ProductTransformer(this.typeMap),
            [SyncDocumentTypes.CATEGORY]: new CategoryTransformer(this.typeMap),
            [SyncDocumentTypes.VARIANT]: new VariantTransformer(this.typeMap),
        } as TransformerRegistry;
    }

    async upsertSyncDocument<T extends SyncDocumentTypes>(
        type: T,
        data: SyncDocumentInputs<T>,
    ) {
        console.log("---BREAK??---");
        const existing = await this.client.getDocument(data.id);
        if (existing) {
            return await this.updateSyncDocument(type, data);
        } else {
            return await this.createSyncDocument(type, data);
        }
    }

    async createSyncDocument<T extends SyncDocumentTypes>(
        type: T,
        data: SyncDocumentInputs<T>,
        options?: FirstDocumentMutationOptions,
    ) {
        console.log("CREATE SYNC DOCUMENT");
        console.log("data", data);
        console.log("options", options);
        const doc = this.transformers[type].transformForCreate(data);
        return await this.client.create(doc, options);
    }

    async updateSyncDocument<T extends SyncDocumentTypes>(
        type: T,
        data: SyncDocumentInputs<T>,
    ) {
        const operations = this.transformers[type].transformForUpdate(data);
        console.log("UPDATE SYNC DOCUMENT");
        console.log("data", data);
        console.log("operations", operations);
        return await this.client.patch(data.id, operations).commit();
    }

    async retrieve(id: string) {
        return this.client.getDocument(id);
    }

    async delete(id: string) {
        return this.client.delete(id);
    }

    async update(id: string, data: any) {
        return this.client.patch(id, { set: data }).commit();
    }

    async list(filter: { id: string | string[] }) {
        const data = await this.client.getDocuments(
            Array.isArray(filter.id) ? filter.id : [filter.id],
        );
        return data.map((doc) => ({ id: doc?._id, ...doc }));
    }
}

export default SanityModuleService;
export { ProductTransformer, CategoryTransformer, VariantTransformer, type SyncTransformer };
