export default {
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    { name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }] },
    { name: 'author', title: 'Author', type: 'string' },
    { name: 'rating', title: 'Rating', type: 'number' },
    { name: 'content', title: 'Content', type: 'text' },
    { name: 'date', title: 'Date', type: 'datetime' },
  ],
}