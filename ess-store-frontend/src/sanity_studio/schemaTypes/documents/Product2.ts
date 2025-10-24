import { group } from "console"
import { DocumentDefinition } from "sanity"
const PersonSchema: DocumentDefinition = {
  name: "Product2",
  title: "Test Product",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Full name",
      type: "string",
    },
    {
      readOnly: false,
      group: "content",
      name: "options",
      of: [
        {
          name: "options",
          type: "object",
          fields: [{ name: "opt1", title: "opt1", type: "string" }],
        },
      ],
      type: "array",
    },
  ],

  groups: [{ default: true, name: "content", title: "Options" }],
}
export default PersonSchema
