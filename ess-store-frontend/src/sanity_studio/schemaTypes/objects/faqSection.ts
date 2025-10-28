export default {
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'faqs', title: 'FAQs', type: 'array', of: [
      { type: 'object', fields: [
        { name: 'question', title: 'Question', type: 'string' },
        { name: 'answer', title: 'Answer', type: 'text' },
      ] },
    ]},
  ],
}