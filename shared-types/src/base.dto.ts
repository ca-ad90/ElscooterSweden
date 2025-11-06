/**
 * Base DTOs (Data Transfer Objects) for shared types across web, cms, and ess-store
 */

/**
 * Base image DTO
 */
export interface ImageDTO {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Base slug DTO
 */
export interface SlugDTO {
  current: string;
}

/**
 * Base SEO DTO
 */
export interface SEODTO {
  title?: string;
  description?: string;
  image?: ImageDTO;
  keywords?: string[];
}

/**
 * Base spec DTO
 */
export interface SpecDTO {
  title: string;
  value: string;
}

/**
 * Base option value DTO
 */
export interface OptionValueDTO {
  title: string;
  value: string;
}

/**
 * Base product option DTO
 */
export interface ProductOptionDTO {
  title: string;
  values: string[];
}

/**
 * Base variant option DTO
 */
export interface VariantOptionDTO {
  title: string;
  value: string;
}

/**
 * Base category DTO
 */
export interface CategoryDTO {
  id: string;
  title: string;
  slug?: SlugDTO | string;
  description?: string;
  image?: ImageDTO;
}

/**
 * Base tag DTO
 */
export interface TagDTO {
  id: string;
  title: string;
  slug?: SlugDTO | string;
}

/**
 * Base type DTO
 */
export interface TypeDTO {
  id: string;
  title: string;
  slug?: SlugDTO | string;
  description?: string;
}

/**
 * Base variant DTO
 */
export interface VariantDTO {
  id: string;
  title: string;
  sku?: string;
  price?: number;
  inStock?: boolean;
  options?: VariantOptionDTO[];
  productId?: string;
}

/**
 * Base product DTO
 */
export interface ProductDTO {
  id: string;
  title: string;
  slug?: SlugDTO | string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  inStock?: boolean;
  mainImage?: ImageDTO;
  images?: ImageDTO[];
  categories?: CategoryDTO[];
  tags?: TagDTO[];
  types?: TypeDTO[];
  variants?: VariantDTO[];
  specs?: SpecDTO[];
  options?: ProductOptionDTO[];
  seo?: SEODTO;
  createdAt?: string;
  updatedAt?: string;
}
