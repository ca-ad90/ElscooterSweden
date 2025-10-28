export default {
  name: 'banner',
  title: 'Banner',
  type: 'object',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'subtitle', title: 'Subtitle', type: 'string' },
    { name: 'image', title: 'Image', type: 'image' },
    { name: 'cta', title: 'CTA', type: 'ctaSection' },
    { name: 'active', title: 'Active', type: 'boolean' },
  ],
}