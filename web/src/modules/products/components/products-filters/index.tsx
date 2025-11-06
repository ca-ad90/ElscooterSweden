"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Text } from "@medusajs/ui"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import type { SanityCategory, SanityTag } from "sanity/types"

type ProductsFiltersProps = {
  categories: SanityCategory[]
  tags: SanityTag[]
  search?: string
  categorySlug?: string
  tagSlug?: string
  sortBy: string
}

export default function ProductsFilters({
  categories,
  tags,
  search,
  categorySlug,
  tagSlug,
  sortBy,
}: ProductsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset to page 1 when filters change
      if (name !== "page") {
        params.delete("page")
      }
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  const handleSearchChange = (value: string) => {
    setQueryParams("search", value)
  }

  // Prepare filter options
  // Note: The query extracts slug.current as just "slug" (string)
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories
      .filter((cat) => {
        const slug = typeof cat.slug === "string" ? cat.slug : cat.slug?.current
        return slug && slug.trim() !== ""
      })
      .map((cat) => {
        const slug = typeof cat.slug === "string" ? cat.slug : cat.slug?.current || ""
        return {
          value: slug,
          label: cat.title,
        }
      }),
  ]

  const tagOptions = [
    { value: "", label: "All Tags" },
    ...tags
      .filter((tag) => {
        const slug = typeof tag.slug === "string" ? tag.slug : tag.slug?.current
        return slug && slug.trim() !== ""
      })
      .map((tag) => {
        const slug = typeof tag.slug === "string" ? tag.slug : tag.slug?.current || ""
        return {
          value: slug,
          label: tag.title,
        }
      }),
  ]

  const sortOptions = [
    { value: "created_at", label: "Latest Arrivals" },
    { value: "price_asc", label: "Price: Low -> High" },
    { value: "price_desc", label: "Price: High -> Low" },
  ]

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      {/* Search */}
      <div className="flex flex-col gap-y-3">
        <Text className="txt-compact-small-plus text-ui-fg-muted">Search</Text>
        <input
          type="text"
          placeholder="Search products..."
          defaultValue={search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="px-3 py-2 border border-ui-border-base rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <FilterRadioGroup
          title="Category"
          items={categoryOptions}
          value={categorySlug || ""}
          handleChange={(value) => setQueryParams("category", value)}
          data-testid="category-filter"
        />
      )}

      {/* Tag Filter */}
      {tags.length > 0 && (
        <FilterRadioGroup
          title="Tags"
          items={tagOptions}
          value={tagSlug || ""}
          handleChange={(value) => setQueryParams("tag", value)}
          data-testid="tag-filter"
        />
      )}

      {/* Sort */}
      <FilterRadioGroup
        title="Sort by"
        items={sortOptions}
        value={sortBy}
        handleChange={(value) => setQueryParams("sortBy", value)}
        data-testid="sort-filter"
      />
    </div>
  )
}
