export default {
    name: "product",
    title: "Product",
    type: "document",
    groups: [
        { name: "content", title: "Content" },
        { name: "settings", title: "Settings" },
        { name: "specs", title: "Specs" },
    ],
    fields: [
        {
            name: "title",
            title: "Title",
            type: "string",
            group: "content",
        },
        {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: "title" },
            group: "content",
        },
        { name: "description", title: "Description", type: "text", group: "content" },

        { name: "seo", title: "SEO", type: "seo", group: "settings" },
        {
            name: "categories",
            title: "Categories",
            type: "array",
            of: [{ type: "reference", to: [{ type: "category" }] }],
            group: "settings",
        },
        {
            name: "tags",
            title: "Tags",
            type: "array",
            of: [{ type: "reference", to: [{ type: "tags" }] }],
            group: "settings",
        },
        {
            name: "types",
            title: "Types",
            type: "array",
            of: [{ type: "reference", to: [{ type: "typeSchema" }] }],
            group: "settings",
        },
        { name: "mainImage", title: "Main Image", type: "image", group: "content" },
        { name: "product_images", title: "Product Images", type: "array", of: [{ type: "image" }], group: "content" },
        {
            name: "specs",
            title: "Specs",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "title", title: "Title", type: "string" },
                        { name: "value", title: "Value", type: "string" },
                    ],
                },
            ],
            group: "specs",
        },
        {
            name: "options",
            title: "Options",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "title", title: "Title", type: "string" },
                        {
                            name: "values",
                            title: "Values",
                            type: "array",
                            of: [{ type: "string" }],
                        },
                    ],
                },
            ],
            group: "settings",
        },
/*         {
            name: "variants",
            title: "Variants",
            type: "array",
            of: [{ type: "reference", to: [{ type: "variant" }] }],
            group: "settings",
        }, */
        { name: "variants", title: "Variants", type: "reference", to: [{ type: "variant" }], group: "settings" },
    ],
};
