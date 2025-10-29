export default {
  name: 'featuredCollection',
  title: 'Featured Collection',
  type: 'object',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'reference', to: [{ type: 'category' }] }] },
    { name: 'products', title: 'Products', type: 'array', of: [{ type: 'reference', to: [{ type: 'product' }] }] },
  ],
}