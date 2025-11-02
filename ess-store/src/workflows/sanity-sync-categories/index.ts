import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { syncCategoryStep } from "./steps/sync";

export type SanitySyncCategoriesWorkflowInput = {
    category_ids?: string[];
};

export const sanitySyncCategoriesWorkflow = createWorkflow(
    { name: "sanity-sync-categories", retentionTime: 10000 },
    function (input: SanitySyncCategoriesWorkflowInput) {
        const result = syncCategoryStep(input);
        return new WorkflowResponse(result);
    },
);
