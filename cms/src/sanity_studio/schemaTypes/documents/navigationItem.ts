export default {
  name: 'navigationItem',
  title: 'Navigation Item',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'url', title: 'URL', type: 'string' },
    { name: 'order', title: 'Order', type: 'number' },
    { name: 'parent', title: 'Parent', type: 'reference', to: [{ type: 'navigationItem' }] },
  ],
}