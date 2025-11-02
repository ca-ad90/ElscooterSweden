import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import { SANITY_MODULE } from "../modules/sanity";

/**
 * This link connects Medusa products to their Sanity equivalents.
 *
 * What it does:
 * - Allows querying Sanity data via `product.sanity_product.*` in workflows
 * - Used for rollback functionality in sanity-sync-products workflow
 * - Read-only (one-way from Medusa to Sanity)
 *
 * Why no links for categories/variants:
 * - The Sanity module doesn't have models (it's an external API service)
 * - Links require models to be defined in the module
 * - Categories/variants don't need rollback, so they work fine without links
 * - Syncing happens via subscribers/events, not through links
 */
defineLink(
    {
        linkable: ProductModule.linkable.product.id,
        field: "id",
    },
    {
        linkable: {
            serviceName: SANITY_MODULE,
            alias: "sanity_product",
            primaryKey: "id",
        },
    },
    {
        readOnly: true,
    },
);
