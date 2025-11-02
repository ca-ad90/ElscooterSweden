import { getRegion } from "@lib/data/regions"
import SanityProductPreview from "@modules/products/components/sanity-product-preview"
import { fetchProducts } from "sanity/services/products"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionSlug,
  categorySlug,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionSlug?: string
  categorySlug?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  const region = await getRegion(countryCode)

  const { items: products, count } = await fetchProducts({
    page,
    limit: PRODUCT_LIMIT,
    categorySlug,
    tagSlug: collectionSlug,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <SanityProductPreview product={p as any} countryCode={countryCode} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
