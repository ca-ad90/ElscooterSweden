"use server"

import { sanityClient } from "../client"
import { queryProductById, queryProductBySlug, queryProductsPaginated } from "../queries"
import type { Paginated, SanityProduct } from "../types"

export async function fetchProducts({
  page = 1,
  limit = 12,
  search,
  categorySlug,
  tagSlug,
}: {
  page?: number
  limit?: number
  search?: string
  categorySlug?: string
  tagSlug?: string
}): Promise<Paginated<SanityProduct>> {
  const offset = Math.max(page, 1) === 1 ? 0 : (page - 1) * limit

  const data = await sanityClient.fetch<{ products: SanityProduct[]; count: number }>(
    queryProductsPaginated(offset, limit, search, categorySlug, tagSlug)
  )

  const nextPage = data.count > offset + limit ? page + 1 : null

  return {
    items: data.products,
    count: data.count,
    nextPage,
  }
}

export async function fetchProductBySlug(slug: string): Promise<SanityProduct | null> {
  const product = await sanityClient.fetch<SanityProduct | null>(queryProductBySlug(slug))
  return product ?? null
}

export async function fetchProductById(id: string): Promise<SanityProduct | null> {
  const product = await sanityClient.fetch<SanityProduct | null>(queryProductById(id))
  return product ?? null
}
