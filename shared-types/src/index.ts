/**
 * Shared Types Package
 *
 * This package provides shared TypeScript types (DTOs) that can be used across:
 * - web: Next.js frontend
 * - cms: Sanity CMS
 * - ess-store: Medusa backend
 *
 * Usage:
 *   import { ProductDTO, SanityProductDTO, MedusaProductDTO } from '@elscootersweden/shared-types'
 */

// Base DTOs
export * from "./base.dto";

// Sanity-specific DTOs
export * from "./sanity.dto";

// Medusa-specific DTOs
export * from "./medusa.dto";

// Type aliases for convenience
export type {
  ProductDTO as ProductsDTO,
  CategoryDTO as ProductCategoriesDTO,
  TagDTO as ProductTagsDTO,
  TypeDTO as ProductTypesDTO,
  VariantDTO as ProductVariantsDTO,
} from "./base.dto";

export type {
  SanityProductDTO as SanityProductsDTO,
  SanityCategoryDTO as SanityProductCategoriesDTO,
  SanityTagDTO as SanityProductTagsDTO,
  SanityTypeDTO as SanityProductTypesDTO,
  SanityVariantDTO as SanityProductVariantsDTO,
} from "./sanity.dto";

export type {
  MedusaProductDTO as MedusaProductsDTO,
  MedusaProductCategoryDTO as MedusaProductCategoriesDTO,
  MedusaProductTagDTO as MedusaProductTagsDTO,
  MedusaProductTypeDTO as MedusaProductTypesDTO,
  MedusaProductVariantDTO as MedusaProductVariantsDTO,
} from "./medusa.dto";
