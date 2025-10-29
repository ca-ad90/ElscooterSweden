export default {
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'subtitle', title: 'Subtitle', type: 'string' },
    { name: 'backgroundImage', title: 'Background Image', type: 'image' },
    { name: 'cta', title: 'CTA', type: 'ctaSection' },
  ],
}