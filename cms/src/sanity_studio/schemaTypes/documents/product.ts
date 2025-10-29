export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    { name: 'medusaId', title: 'Medusa ID', type: 'string' },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'seo', title: 'SEO', type: 'seo' },
    { name: 'categories', title: 'Categories', type: 'array', of: [{ type: 'reference', to: [{ type: 'category' }] }] },
    { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tags' }] }] },
    { name: 'variants', title: 'Variants', type: 'array', of: [{ type: 'reference', to: [{ type: 'variants' }] }] },
    { name: 'mainImage', title: 'Main Image', type: 'image' },
    { name: 'imageGallery', title: 'Image Gallery', type: 'imageGallery' },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'inStock', title: 'In Stock', type: 'boolean' },
  ],
}