export default {
  name: 'variants',
  title: 'Variants',
  type: 'document',
  fields: [
    { name: 'medusaId', title: 'Medusa Variant ID', type: 'string' },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'sku', title: 'SKU', type: 'string' },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'stock', title: 'Stock', type: 'number' },
    { name: 'image', title: 'Image', type: 'image' },
  ],
}