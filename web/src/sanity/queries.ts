import { groq } from "next-sanity"

export const PRODUCT_FIELDS = `
  _id,
  _createdAt,
  "id": _id,
  title,
  "slug": slug.current,
  description,
  sku,
  tags[]-> { _id, title, slug },
  category-> { _id, title, slug },
  images[]{..., asset->},
  mainImage{..., asset->},
  price,
  compareAtPrice,
  variants[]{
    _key,
    title,
    sku,
    price,
    options
  }
`

export const queryAllProducts = groq`
  *[_type == "product"] | order(_createdAt desc) {
    ${PRODUCT_FIELDS}
  }
`

export const queryProductsPaginated = (
  offset: number,
  limit: number,
  search?: string,
  categorySlug?: string,
  tagSlug?: string
) => groq`
  {
    "products": *[
      _type == "product"
      ${search ? `&& (title match ${JSON.stringify(search + "*")} || slug.current match ${JSON.stringify(search + "*")})` : ""}
      ${categorySlug ? `&& category->slug.current == ${JSON.stringify(categorySlug)}` : ""}
      ${tagSlug ? `&& count(tags[slug.current == ${JSON.stringify(tagSlug)}]) > 0` : ""}
    ] | order(_createdAt desc) [${offset}...${offset + limit}] {
      ${PRODUCT_FIELDS}
    },
    "count": count(*[
      _type == "product"
      ${search ? `&& (title match ${JSON.stringify(search + "*")} || slug.current match ${JSON.stringify(search + "*")})` : ""}
      ${categorySlug ? `&& category->slug.current == ${JSON.stringify(categorySlug)}` : ""}
      ${tagSlug ? `&& count(tags[slug.current == ${JSON.stringify(tagSlug)}]) > 0` : ""}
    ])
  }
`

export const queryProductBySlug = (slug: string) => groq`
  *[_type == "product" && slug.current == ${JSON.stringify(slug)}][0] {
    ${PRODUCT_FIELDS}
  }
`

export const queryProductById = (id: string) => groq`
  *[_type == "product" && _id == ${JSON.stringify(id)}][0] {
    ${PRODUCT_FIELDS}
  }
`

export const queryAllCategories = groq`
  *[_type == "category"]{ _id, title, description, "slug": slug.current }
`

export const queryCategoryBySlug = (slug: string) => groq`
  *[_type == "category" && slug.current == ${JSON.stringify(slug)}][0]{ _id, title, description, "slug": slug.current }
`

export const queryAllTags = groq`
  *[_type == "tags"]{ _id, title, "slug": slug.current }
`

export const queryTagBySlug = (slug: string) => groq`
  *[_type == "tags" && slug.current == ${JSON.stringify(slug)}][0]{ _id, title, "slug": slug.current }
`
