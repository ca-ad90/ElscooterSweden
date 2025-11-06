import { Metadata } from "next"
import { sanityClient } from "sanity/client"
import { queryAllCategories, queryAllTags } from "sanity/queries"
import type { SanityCategory, SanityTag } from "sanity/types"
import ProductsTemplate from "@modules/products/templates/products-template"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    search?: string
    category?: string
    tag?: string
    page?: string
    sortBy?: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Products | Store",
    description: "Browse all our products",
  }
}

export default async function ProductsPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { search, category, tag, page, sortBy } = searchParams

  // Fetch categories and tags for filters
  const [categories, tags] = await Promise.all([
    sanityClient.fetch<SanityCategory[]>(queryAllCategories),
    sanityClient.fetch<SanityTag[]>(queryAllTags),
  ])

  const pageNumber = page ? parseInt(page) : 1

  return (
    <ProductsTemplate
      categories={categories || []}
      tags={tags || []}
      search={search}
      categorySlug={category}
      tagSlug={tag}
      page={pageNumber}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  )
}
