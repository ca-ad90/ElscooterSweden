export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }, { type: 'imageGallery' }] },
    { name: 'seo', title: 'SEO', type: 'seo' },
    { name: 'relatedProducts', title: 'Related Products', type: 'array', of: [{ type: 'reference', to: [{ type: 'product' }] }] },
    { name: 'publishedAt', title: 'Published At', type: 'datetime' },
  ],
}