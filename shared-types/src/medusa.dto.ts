/**
 * Medusa-specific DTOs that extend base DTOs
 * These types align with Medusa's ProductDTO, ProductCategoryDTO, etc.
 */

import {
  CategoryDTO,
  TagDTO,
  TypeDTO,
  VariantDTO,
  ProductDTO,
  ImageDTO,
} from "./base.dto";

/**
 * Medusa money amount DTO
 */
export interface MoneyAmountDTO {
  amount: number;
  currency_code: string;
  region_id?: string;
}

/**
 * Medusa product category DTO
 */
export interface MedusaProductCategoryDTO extends Omit<CategoryDTO, "title"> {
  name: string; // Medusa uses 'name' instead of 'title'
  handle?: string;
  parent_category_id?: string;
  parent_category?: MedusaProductCategoryDTO;
  category_children?: MedusaProductCategoryDTO[];
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Medusa product tag DTO
 */
export interface MedusaProductTagDTO extends Omit<TagDTO, "title"> {
  value: string; // Medusa uses 'value' instead of 'title'
  created_at?: string;
  updated_at?: string;
}

/**
 * Medusa product type DTO
 */
export interface MedusaProductTypeDTO extends Omit<TypeDTO, "title"> {
  value: string; // Medusa uses 'value' instead of 'title'
  created_at?: string;
  updated_at?: string;
}

/**
 * Medusa product option value DTO
 */
export interface MedusaProductOptionValueDTO {
  id: string;
  value: string;
  option_id: string;
  variant_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Medusa product option DTO
 */
export interface MedusaProductOptionDTO {
  id: string;
  title: string;
  product_id: string;
  values?: MedusaProductOptionValueDTO[];
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Medusa product variant DTO
 */
export interface MedusaProductVariantDTO extends Omit<VariantDTO, "options"> {
  product_id: string;
  title: string;
  sku?: string;
  barcode?: string;
  ean?: string;
  upc?: string;
  inventory_quantity?: number;
  allow_backorder?: boolean;
  manage_inventory?: boolean;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  origin_country?: string;
  mid_code?: string;
  hs_code?: string;
  material?: string;
  prices?: MoneyAmountDTO[];
  options?: Array<{
    id: string;
    value: string;
    option: {
      id: string;
      title: string;
    };
  }>;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Medusa product image DTO
 */
export interface MedusaProductImageDTO extends ImageDTO {
  id: string;
  product_id: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Medusa product DTO
 */
export interface MedusaProductDTO extends Omit<ProductDTO, "categories" | "tags" | "types" | "variants" | "images" | "options"> {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle?: string;
  is_giftcard?: boolean;
  status?: "draft" | "proposed" | "published" | "rejected";
  thumbnail?: string;
  categories?: MedusaProductCategoryDTO[];
  tags?: MedusaProductTagDTO[];
  type?: MedusaProductTypeDTO;
  type_id?: string;
  options?: MedusaProductOptionDTO[];
  variants?: MedusaProductVariantDTO[];
  images?: MedusaProductImageDTO[];
  collection_id?: string;
  collection?: {
    id: string;
    title: string;
    handle: string;
  };
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  // Sanity sync reference
  sanity_product?: {
    _id: string;
    _type: "reference";
  };
}
