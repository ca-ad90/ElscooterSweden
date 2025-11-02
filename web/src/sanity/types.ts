export type SanityImage = {
  _type: string
  asset?: { _ref?: string; _id?: string; url?: string }
  alt?: string
}

export type SanityTag = { _id: string; title: string; slug?: { current: string } }
export type SanityCategory = { _id: string; title: string; slug?: { current: string } }

export type SanityVariant = {
  _key: string
  title?: string
  sku?: string
  price?: number
  options?: Record<string, string>
}

export type SanityProduct = {
  _id: string
  id: string
  _createdAt: string
  title: string
  slug?: string
  description?: string
  sku?: string
  tags?: SanityTag[]
  category?: SanityCategory
  images?: SanityImage[]
  mainImage?: SanityImage
  price?: number
  compareAtPrice?: number
  variants?: SanityVariant[]
}

export type Paginated<T> = {
  items: T[]
  count: number
  nextPage: number | null
}
