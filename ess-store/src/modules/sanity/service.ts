import { Logger, ProductDTO, ProductImageDTO } from "@medusajs/framework/types";
import {
    SanityClient,
    createClient,
    FirstDocumentMutationOptions,
} from "@sanity/client";
import fs from "fs";
import https from "https";
import http from "http";
import { Readable } from "stream";

// other imports...

import { ProductWithVariants } from "../../workflows/sanity-sync-products/steps/sync";
import { ConsoleSpanExporter } from "@medusajs/framework/opentelemetry/sdk-trace-node";

// Helper to generate a unique _key for Sanity array items
function generateKey(): string {
    return Math.random().toString(36).substring(2, 15);
}

// Helper to create Sanity slug object
function createSlug(title: string): { _type: "slug"; current: string } {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return {
        _type: "slug",
        current: slug,
    };
}

const SyncDocumentTypes = {
    PRODUCT: "product",
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
type PriceDTO = {
    amount: number;
    currency_code: string;
};
type OptionDTO = {
    title: string;
    values: string[];
};
type SyncDocumentInputs<T> = T extends "product" ? ProductDTO : never;

type TransformationMap<T> = Record<
    SyncDocumentTypes,
    (data: SyncDocumentInputs<T>) => any
>;

class SanityModuleService {
    private client: SanityClient;
    private studioUrl?: string;
    private logger: Logger;
    private typeMap: Record<SyncDocumentTypes, string>;
    private createTransformationMap: TransformationMap<SyncDocumentTypes>;
    private updateTransformationMap: TransformationMap<SyncDocumentTypes>;

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
        // TODO initialize more properties
        this.typeMap = Object.assign(
            {},
            {
                [SyncDocumentTypes.PRODUCT]: "product",
            },
            options.type_map ?? {},
        );

        this.createTransformationMap = {
            [SyncDocumentTypes.PRODUCT]: this.transformProductForCreate,
        };

        this.updateTransformationMap = {
            [SyncDocumentTypes.PRODUCT]: this.transformProductForUpdate,
        };
    }


    // --- Utility functions for product transformation ---

    private getCategoryNames(categories: any[]): string[] {
        return Array.isArray(categories)
            ? categories.map((cat) =>
                  typeof cat === "object" && cat?.name ? cat.name : String(cat),
              )
            : [];
    }

    private getTagNames(tags: any[]): string[] {
        return Array.isArray(tags)
            ? tags.map((tag: any) => {
                  if (typeof tag === "string") return tag;
                  if (typeof tag === "object") {
                      return tag.name || tag.title || tag.value || String(tag);
                  }
                  return String(tag);
              })
            : [];
    }

    private getSpecs(specs: any[]): Array<{ _key: string; title: string; value: string }> {
        return Array.isArray(specs)
            ? specs.map((spec) => ({
                  _key: generateKey(),
                  title: spec.title || "",
                  value: spec.value || "",
              }))
            : [];
    }

    private getOptions(options: any[]): Array<{ _key: string; title: string; values: string[] }> {
        return Array.isArray(options)
            ? options.map((opt) => ({
                  _key: generateKey(),
                  title: opt.title || "",
                  values: Array.isArray(opt.values)
                      ? opt.values.map((value: any) => value.value)
                      : [],
              }))
            : [];
    }

    private getVariantOptions(variantOptions: any[]): Array<{ _key: string; title: string; value: string }> {
        return Array.isArray(variantOptions)
            ? variantOptions.map((opt: any) => ({
                  _key: generateKey(),
                  title: opt.title || "",
                  value: opt.value || "",
              }))
            : [];
    }

    private getVariants(variants: any[]): Array<any> {
        return Array.isArray(variants)
            ? variants.map((variant: any) => ({
                  _key: generateKey(),
                  title: variant.title || "",
                  sku: variant.sku || "",
                  price:
                      (variant.prices &&
                          Array.isArray(variant.prices) &&
                          variant.prices[0]?.amount) ||
                      variant.price ||
                      0,
                  options: this.getVariantOptions(variant.options),
              }))
            : [];
    }

    private getMainImage(thumbnail: ProductDTO["thumbnail"]): { url: string } {
        return { url: thumbnail || "" };
    }

    private getProductImages(images: ProductImageDTO[]): {url: string, _key: string}[] {
        return images.map((image) => ({ url: image.url || "",_key: generateKey() }));
    }

    private getFirstVariantPrice(variants: any[]): number {
        if (Array.isArray(variants) && variants[0]?.prices?.[0]?.amount != null)
            return variants[0].prices[0].amount;
        return 0;
    }

    // --- Product transformations ---

    private transformProductForCreate = (
        product: ProductWithVariants,
    ) => {
        const categories = this.getCategoryNames(product.categories?product.categories:[]);
        const tags = this.getTagNames(product.tags);
        const specs = this.getSpecs(product.specs);
        const options = this.getOptions(product.options);
        const variants = this.getVariants(product.variants);
        const mainImage = this.getMainImage(product.thumbnail);
        const product_images = this.getProductImages(product.images);
        const price = this.getFirstVariantPrice(product.variants);

        return {
            _id: product.id,
            _type: this.typeMap[SyncDocumentTypes.PRODUCT],
            title: product.title || "",
            slug: product.title ? createSlug(product.title) : undefined,
            description: product.description || "",
            categories,
            tags,
            mainImage,
            product_images,
            price,
            inStock: true, // You may want to calculate this from variant stock
            specs,
            options,
            variants,
        };
    };

    private transformProductForUpdate = (product: ProductWithVariants) => {
        const categories = this.getCategoryNames(product.categories?product.categories:[]);
        const tags = this.getTagNames(product.tags);
        const specs = this.getSpecs(product.specs);
        const options = this.getOptions(product.options);
        const variants = this.getVariants(product.variants);
        const mainImage = this.getMainImage(product.thumbnail);
        const product_images = this.getProductImages(product.images);
        const price = this.getFirstVariantPrice(product.variants);

        return {
            set: {
                title: product.title || "",
                description: product.description || "",
                categories,
                tags,
                mainImage,
                product_images,
                price,
                inStock: true,
                specs,
                options,
                variants,
            },
        };
    };

    async upsertSyncDocument<T extends SyncDocumentTypes>(
        type: T,
        data: SyncDocumentInputs<T>,
    ) {

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
        const doc = this.createTransformationMap[type](data);
        console.debug("Transformation is OK...");
        if (doc.mainImage && doc.mainImage.url) {
            console.debug("Main Image exists");
            doc.mainImage = await this.uploadImage(doc.mainImage.url);
        } else {
            console.debug("Main Image does not exist",doc.mainImage);
        }
        if (doc.product_images && doc.product_images.length > 0 ) {
            console.debug("Product Images exist");
            let productImages = [];
            for(const image of doc.product_images){
                if(image.url){
                    let uploadedImage = await this.uploadImage(image.url);
                    if(uploadedImage instanceof Error){
                        console.debug("Error uploading image:", uploadedImage.message);
                        continue;
                    }else {
                        console.debug("Uploaded image:", uploadedImage);
                        productImages.push({_key: image._key, ...uploadedImage} as never);
                    }
                } else {
                    console.debug("url is not present");
                }
            }
            doc.product_images = productImages;
            console.debug("prepare to create");
        }
        return await this.client.create(doc, options);
    }
    async updateSyncDocument<T extends SyncDocumentTypes>(
        type: T,
        data: SyncDocumentInputs<T>,
    ) {
        const operations = this.updateTransformationMap[type](data);
        if (operations.set.mainImage && operations.set.mainImage.url) {
            console.debug("Main Image exists");
            operations.set.mainImage = await this.uploadImage(operations.set.mainImage.url);
        } else {
            console.debug("Main Image does not exist",operations.set.mainImage);
        }
        if (operations.set.product_images && operations.set.product_images.length > 0 ) {
            console.debug("Product Images exist");
            let productImages = [];
            for(const image of operations.set.product_images){
                if(image.url){
                    let uploadedImage = await this.uploadImage(image.url);
                    if(uploadedImage instanceof Error){
                        console.debug("Error uploading image:", uploadedImage.message);
                        continue;
                    }else {
                        console.debug("Uploaded image:", uploadedImage);
                        productImages.push({_key: image._key, ...uploadedImage} as never);
                    }
                } else {
                    console.debug("url is not present");
                }
            }
            operations.set.product_images = productImages;
            console.debug("prepare to create");
        }
        console.debug("UPSERT SYNC DOCUMENT");
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
    async getImageStream(image: string) {
        console.debug("Getting image stream for:", image);
        return new Promise((resolve, reject) => {
            if(image.startsWith("https")){
            https.get(image, (response) => {
                if (response.statusCode !== 200) {
                    if (response.statusCode === 302) {
                        console.debug(
                            "Redirecting to:",
                            response.headers.location as string,
                        );
                        resolve(
                            this.getImageStream(
                                response.headers.location as string,
                            ),
                        );
                    } else {
                        reject(
                            new Error(
                                `Failed to get '${image}' (${response.statusCode})`,
                            ),
                        );
                    }
                } else {
                    resolve(response);
                }
            });
        } else {
            http.get(image, (response) => {
                if (response.statusCode !== 200) {
                    if (response.statusCode === 302) {
                        console.debug(
                            "Redirecting to:",
                            response.headers.location as string,
                        );
                        resolve(
                            this.getImageStream(
                                response.headers.location as string,
                            ),
                        );
                    } else {
                        reject(
                            new Error(
                                `Failed to get '${image}' (${response.statusCode})`,
                            ),
                        );
                    }
                } else {
                    resolve(response);
                }
            });
        }
        });
    }
    async uploadImage(image: string) {
        console.debug("start uploading image:", image);
        const stream = await this.getImageStream(image);
        console.debug("stream is ready");
        if (stream instanceof Readable) {
            let uploadedImage = await this.client.assets.upload("image", stream);
            console.debug("uploadedImage is ready");
            return this.createImageReference(uploadedImage);
        } else {
            return new Error("Failed to get image stream");
        }
    }
    async createImageReference(image: any) {
        if(image._id){
            return {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: image._id,
                },
            };
        } else {
            return new Error("Image ID is not present");
        }
    }
}
export default SanityModuleService;
