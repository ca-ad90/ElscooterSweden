export default {
  name: 'imageGallery',
  title: 'Image Gallery',
  type: 'object',
  fields: [
    { name: 'images', title: 'Images', type: 'array', of: [{ type: 'image' }] },
  ],
}