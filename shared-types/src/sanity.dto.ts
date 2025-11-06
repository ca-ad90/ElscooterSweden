/**
 * Sanity-specific DTOs that extend base DTOs
 */

import {
  CategoryDTO,
  TagDTO,
  TypeDTO,
  VariantDTO,
  ProductDTO,
  ImageDTO,
  SlugDTO,
} from "./base.dto";

/**
 * Sanity image asset reference
 */
export interface SanityImageAsset {
  _ref?: string;
  _id?: string;
  url?: string;
}

/**
 * Sanity image DTO
 */
export interface SanityImageDTO extends ImageDTO {
  _type: string;
  asset?: SanityImageAsset;
}

/**
 * Sanity reference (for references between documents)
 */
export interface SanityReference {
  _type: "reference";
  _ref: string;
  _weak?: boolean;
}

/**
 * Sanity category DTO (from Sanity CMS)
 */
export interface SanityCategoryDTO extends Omit<CategoryDTO, "id"> {
  _id: string;
  _type: "category";
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  slug?: SlugDTO;
  image?: SanityImageDTO;
}

/**
 * Sanity tag DTO (from Sanity CMS)
 */
export interface SanityTagDTO extends Omit<TagDTO, "id"> {
  _id: string;
  _type: "tags";
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  slug?: SlugDTO;
}

/**
 * Sanity type DTO (from Sanity CMS)
 */
export interface SanityTypeDTO extends Omit<TypeDTO, "id"> {
  _id: string;
  _type: "type";
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  slug?: SlugDTO;
}

/**
 * Sanity variant DTO (from Sanity CMS)
 */
export interface SanityVariantDTO extends Omit<VariantDTO, "id"> {
  _id: string;
  _type: "variant";
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  _key?: string;
  product?: SanityReference | SanityProductDTO;
}

/**
 * Sanity product DTO (from Sanity CMS)
 */
export interface SanityProductDTO extends Omit<ProductDTO, "id" | "categories" | "tags" | "types" | "variants"> {
  _id: string;
  _type: "product";
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  id?: string; // Medusa product ID if synced
  slug?: SlugDTO | string;
  categories?: (SanityReference | SanityCategoryDTO)[];
  tags?: (SanityReference | SanityTagDTO)[];
  types?: (SanityReference | SanityTypeDTO)[];
  variants?: (SanityReference | SanityVariantDTO)[];
  mainImage?: SanityImageDTO;
  product_images?: SanityImageDTO[];
  sanity_product?: {
    _id: string;
    _type: "reference";
  };
}
