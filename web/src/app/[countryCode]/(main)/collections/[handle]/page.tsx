import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import CollectionTemplate from "@modules/collections/templates"
import { sanityClient } from "sanity/client"
import { queryAllTags, queryTagBySlug } from "sanity/queries"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const tags = await sanityClient.fetch<{ slug?: string }[]>(queryAllTags)

  if (!tags) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: any[]) =>
      regions
        ?.map((r) => r.countries?.map((c: any) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const handles = tags.map((t: { slug?: string }) => t.slug).filter(Boolean) as string[]

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      handles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const tag = await sanityClient.fetch<any>(queryTagBySlug(params.handle))

  if (!tag) {
    notFound()
  }

  return {
    title: `${tag.title} | Store`,
    description: `${tag.title} collection`,
  }
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const collection = await sanityClient.fetch<any>(queryTagBySlug(params.handle))

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  )
}
