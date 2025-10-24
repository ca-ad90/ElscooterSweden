import { Logger, ProductDTO } from "@medusajs/framework/types";
import {
    SanityClient,
    createClient,
    FirstDocumentMutationOptions,
} from "@sanity/client";
// other imports...

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

    private transformProductForCreate = (product: ProductDTO) => {
        return {
            _type: this.typeMap[SyncDocumentTypes.PRODUCT],
            _id: product.id,
            title: product.title,
            specs: [
                {
                    _key: product.id,
                    _type: "spec",
                    title: product.title,
                    content: product.description,
                    lang: "en",
                },
            ],
        };
    };
    private transformProductForUpdate = (product: ProductDTO) => {
        //console.log("transformProductForUpdate", product.sanity_product.specs);

        return {
            set: {
                title: product.title,
                specs: [
                    {
                        _key: product.id,
                        _type: "spec",
                        title: product.title,
                        content: product.description,
                    },
                ],
            },
        };
    };
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
        const doc = this.createTransformationMap[type](data);
        return await this.client.create(doc, options);
    }
    async updateSyncDocument<T extends SyncDocumentTypes>(
        type: T,
        data: SyncDocumentInputs<T>,
    ) {
        const operations = this.updateTransformationMap[type](data);
        console.log("UPSERT SYNC DOCUMENT");
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
