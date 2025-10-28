export default {
  name: 'richTextBlock',
  title: 'Rich Text Block',
  type: 'object',
  fields: [
    { name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] },
  ],
}