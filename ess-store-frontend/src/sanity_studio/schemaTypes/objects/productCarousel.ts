export default {
  name: 'productCarousel',
  title: 'Product Carousel',
  type: 'object',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'products', title: 'Products', type: 'array', of: [{ type: 'reference', to: [{ type: 'product' }] }] },
  ],
}