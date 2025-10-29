export default {
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'seo', title: 'SEO', type: 'seo' },
    { name: 'sections', title: 'Sections', type: 'array', of: [
      { type: 'heroSection' },
      { type: 'richTextBlock' },
      { type: 'productCarousel' },
      { type: 'ctaSection' },
      { type: 'faqSection' },
      { type: 'banner' },
      { type: 'featuredCollection' },
    ] },
  ],
}