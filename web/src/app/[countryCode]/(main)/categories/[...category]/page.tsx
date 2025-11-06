import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listRegions } from "@lib/data/regions"
import CategoryTemplate from "@modules/categories/templates"
import { sanityClient } from "sanity/client"
import { queryAllCategories, queryCategoryBySlug } from "sanity/queries"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  const product_categories = await sanityClient.fetch<{ slug?: string }[]>(queryAllCategories)

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: any[]) =>
    regions?.map((r) => r.countries?.map((c: any) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map((category: { slug?: string }) => category.slug).filter(Boolean)

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const slug = params.category?.[0]
    const productCategory = await sanityClient.fetch<any>(queryCategoryBySlug(slug))

    const title = (productCategory?.title || slug) + " | Store"

    const description = productCategory?.description ?? `${title} category.`

    return {
      title: `${title} | Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const slug = params.category?.[0]
  const productCategory = await sanityClient.fetch<any>(queryCategoryBySlug(slug))

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
