import { urlFor } from "sanity/image"
import type { SanityProduct } from "sanity/types"

export default function SanityProductTemplate({
  product,
  countryCode,
}: {
  product: SanityProduct
  countryCode: string
}) {
  const image = product.mainImage || product.images?.[0]
  const imgUrl = image?.asset ? urlFor(image).width(1000).height(1000).fit("crop").url() : undefined

  return (
    <div className="content-container py-6">
      <div className="grid grid-cols-1 medium:grid-cols-2 gap-8">
        <div>
          <div className="relative w-full aspect-square bg-ui-bg-subtle overflow-hidden">
            {imgUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgUrl} alt={image?.alt || product.title} className="h-full w-full object-cover" />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl-semi">{product.title}</h1>
          {typeof product.price === "number" && (
            <div className="text-xl">{product.price}</div>
          )}
          {product.description && (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}
        </div>
      </div>
    </div>
  )
}
