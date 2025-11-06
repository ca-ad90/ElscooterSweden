import { Suspense } from "react"
import { Text } from "@medusajs/ui"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SanityProductPreview from "@modules/products/components/sanity-product-preview"
import { Pagination } from "@modules/store/components/pagination"
import ProductsFilters from "@modules/products/components/products-filters"
import { fetchProducts } from "sanity/services/products"
import type { SanityCategory, SanityTag } from "sanity/types"

type ProductsTemplateProps = {
  categories: SanityCategory[]
  tags: SanityTag[]
  search?: string
  categorySlug?: string
  tagSlug?: string
  page: number
  sortBy?: string
  countryCode: string
}

export default async function ProductsTemplate({
  categories,
  tags,
  search,
  categorySlug,
  tagSlug,
  page,
  sortBy,
  countryCode,
}: ProductsTemplateProps) {
  // Fetch products on the server
  const { items: products, count } = await fetchProducts({
    page,
    limit: 12,
    search,
    categorySlug,
    tagSlug,
  })

  const totalPages = Math.ceil(count / 12)
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="products-container"
    >
      {/* Filters Sidebar */}
      <ProductsFilters
        categories={categories}
        tags={tags}
        search={search}
        categorySlug={categorySlug}
        tagSlug={tagSlug}
        sortBy={sort}
      />

      {/* Products Grid */}
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="products-page-title">All Products</h1>
          {count > 0 && (
            <Text className="txt-compact-medium text-ui-fg-subtle mt-2">
              {count} {count === 1 ? "product" : "products"} found
            </Text>
          )}
        </div>

        <Suspense fallback={<SkeletonProductGrid />}>
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <Text className="txt-compact-large text-ui-fg-subtle">
                No products found
              </Text>
            </div>
          ) : (
            <>
              <ul
                className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
                data-testid="products-list"
              >
                {products.map((product) => (
                  <li key={product.id}>
                    <SanityProductPreview
                      product={product}
                      countryCode={countryCode}
                    />
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <Pagination
                  data-testid="product-pagination"
                  page={page}
                  totalPages={totalPages}
                />
              )}
            </>
          )}
        </Suspense>
      </div>
    </div>
  )
}
