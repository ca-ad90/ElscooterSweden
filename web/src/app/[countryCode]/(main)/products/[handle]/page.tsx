import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion, listRegions } from "@lib/data/regions"
import SanityProductTemplate from "@modules/products/templates/sanity-product-template"
import { sanityClient } from "sanity/client"
import { queryAllProducts, queryProductBySlug } from "sanity/queries"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const all = await sanityClient.fetch<{ slug: { current: string } }[]>(queryAllProducts)
    return countryCodes
      .flatMap((country) =>
        all
          .map((p: { slug: { current: string } }) => ({ countryCode: country, handle: p.slug?.current }))
          .filter((p: { handle: string }) => !!p.handle)
      )
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await sanityClient.fetch<any>(queryProductBySlug(handle))

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Store`,
      description: `${product.title}`,
      images: product?.mainImage?.asset?.url ? [product.mainImage.asset.url] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await sanityClient.fetch<any>(queryProductBySlug(params.handle))

  if (!pricedProduct) {
    notFound()
  }

  return <SanityProductTemplate product={pricedProduct} countryCode={params.countryCode} />
}
