import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { syncVariantStep } from "./steps/sync";

export type SanitySyncVariantsWorkflowInput = {
    variant_ids?: string[];
};

export const sanitySyncVariantsWorkflow = createWorkflow(
    { name: "sanity-sync-variants", retentionTime: 10000 },
    function (input: SanitySyncVariantsWorkflowInput) {
        const result = syncVariantStep(input);
        return new WorkflowResponse(result);
    },
);
