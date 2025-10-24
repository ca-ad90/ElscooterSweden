import { SchemaPluginOptions } from "sanity"
import productSchema from "./documents/products"
import PersonSchema from "./documents/Product2"

export const schema: SchemaPluginOptions = {
  types: [productSchema, PersonSchema],
  //  templates: (templates) =>
  //   templates.filter((template) => template.schemaType !== "product"),
}
