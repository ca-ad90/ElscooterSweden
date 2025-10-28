export default {
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'seo', title: 'SEO', type: 'seo' },
    { name: 'content', title: 'Content', type: 'array', of: [
      { type: 'heroSection' },
      { type: 'richTextBlock' },
      { type: 'imageGallery' },
      { type: 'productCarousel' },
      { type: 'ctaSection' },
      { type: 'faqSection' },
      { type: 'banner' },
      { type: 'featuredCollection' },
    ]},
  ],
}