export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'title', title: 'Site Title', type: 'string' },
    { name: 'logo', title: 'Logo', type: 'image' },
    { name: 'defaultSeo', title: 'Default SEO', type: 'seo' },
  ],
}