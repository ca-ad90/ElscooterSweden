"use server"

// Adapter helpers to consume Sanity in the app without breaking existing code
// Prefer importing from `@/sanity/services/products` directly for new code

import type { Paginated, SanityProduct } from "sanity/types"
import { fetchProductById, fetchProductBySlug, fetchProducts } from "sanity/services/products"

export async function listSanityProducts(params: {
  page?: number
  limit?: number
  search?: string
}): Promise<Paginated<SanityProduct>> {
  return fetchProducts(params)
}

export async function retrieveSanityProductBySlug(slug: string) {
  return fetchProductBySlug(slug)
}

export async function retrieveSanityProductById(id: string) {
  return fetchProductById(id)
}
