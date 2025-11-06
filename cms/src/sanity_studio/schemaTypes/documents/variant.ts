export default {
  name: 'variant',
  title: 'Variant',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'sku', title: 'SKU', type: 'string' },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }], default: (draft: any) => draft.document.product.id },
    { name: 'inStock', title: 'In Stock', type: 'boolean', default: true },
    {
      name: 'options',
      title: 'Options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
}
