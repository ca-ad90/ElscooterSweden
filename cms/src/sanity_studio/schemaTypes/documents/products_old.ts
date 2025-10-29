import { ComposeIcon } from "@sanity/icons"
import { DocumentDefinition } from "sanity"

const productSchema: DocumentDefinition = {
  title: "Product Page",
  type: "document",
  name: "product",
  fields: [
    {
      name: "title",
      type: "string",
    },
    {
      group: "content",
      name: "specs",
      of: [
        {
          name: "spec",
          type: "object",
          fields: [
            { name: "lang", title: "Language", type: "string" },
            { name: "title", title: "Title", type: "string" },
            {
              name: "content",
              rows: 3,
              title: "Content",
              type: "text",
            },
          ],
        },
      ],
      type: "array",
    },
    {
      fields: [
        { name: "title", title: "Title", type: "string" },
        {
          name: "products",
          of: [{ to: [{ type: "product" }], type: "reference" }],
          title: "Addons",
          type: "array",
          validation: (Rule) => Rule.max(3),
        },
      ],
      name: "addons",
      type: "object",
    },
  ],

  groups: [
    {
      default: true,
      // @ts-ignore
      icon: ComposeIcon,
      name: "content",
      title: "Content",
    },
  ],
}

export default productSchema
