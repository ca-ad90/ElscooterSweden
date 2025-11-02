import React from "react"
import { HttpTypes } from "@medusajs/types"
import Section, {
  SectionActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@modules/common/components/section"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CTA = {
  href: string
  label: string
}

export default async function ProductCtaCarousel({
  title,
  description,
  cta,
  products,
  region,
  background = "default",
}: {
  title: string
  description?: string
  cta?: CTA
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  background?: "default" | "muted" | "contrast"
}) {
  if (!products?.length) {
    return null
  }

  return (
    <Section background={background} padding="lg">
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        {description && <SectionDescription>{description}</SectionDescription>}
        {cta && (
          <SectionActions>
            <LocalizedClientLink
              href={cta.href}
              className="inline-flex items-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {cta.label}
            </LocalizedClientLink>
          </SectionActions>
        )}
      </SectionHeader>

      <div className="-mx-4 overflow-x-auto px-4">
        <ul className="flex snap-x snap-mandatory gap-4 overflow-y-hidden pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <li key={product.id} className="snap-start shrink-0 w-60 sm:w-64">
              {/* ProductPreview is a server component */}
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
