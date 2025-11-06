import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { urlFor } from "sanity/image"
import type { SanityProduct } from "sanity/types"

export default function SanityProductPreview({
  product,
  countryCode,
}: {
  product: SanityProduct
  countryCode: string
}) {
  const href = `/products/${product.slug ?? product.id}`
  const image = product.mainImage || product.images?.[0]
  const imgUrl = image?.asset ? urlFor(image).width(600).height(600).fit("crop").url() : undefined

  return (
    <LocalizedClientLink href={href} className="group">
      <div data-testid="product-wrapper">
        <div className="relative w-full aspect-[4/5] bg-ui-bg-subtle overflow-hidden">
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt={image?.alt || product.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex txt-compact-medium mt-4 justify-between">
          <span className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </span>
          {typeof product.price === "number" && (
            <span className="text-ui-fg-base">{product.price}</span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
