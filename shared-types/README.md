# Shared Types Package

This package contains shared TypeScript types (DTOs) used across the ElscooterSweden project:

- **web**: Next.js frontend
- **cms**: Sanity CMS
- **ess-store**: Medusa backend

## Installation

This is a local package. To use it in other parts of the project, add it as a dependency:

```json
{
  "dependencies": {
    "@elscootersweden/shared-types": "file:../shared-types"
  }
}
```

## Building

```bash
npm run build
```

This will compile TypeScript and generate type definitions in the `dist` folder.

## Usage

### Base DTOs

Base DTOs are platform-agnostic and can be used anywhere:

```typescript
import { ProductDTO, CategoryDTO, TagDTO, VariantDTO, TypeDTO } from '@elscootersweden/shared-types'
```

### Sanity DTOs

For Sanity CMS-specific types:

```typescript
import { SanityProductDTO, SanityCategoryDTO } from '@elscootersweden/shared-types'
```

### Medusa DTOs

For Medusa backend-specific types:

```typescript
import { MedusaProductDTO, MedusaProductCategoryDTO } from '@elscootersweden/shared-types'
```

### Convenience Aliases

Pluralized aliases are also available:

```typescript
import {
  ProductsDTO,
  ProductCategoriesDTO,
  ProductTagsDTO,
  ProductTypesDTO,
  ProductVariantsDTO
} from '@elscootersweden/shared-types'
```

## Structure

- `base.dto.ts`: Base DTOs that are platform-agnostic
- `sanity.dto.ts`: Sanity CMS-specific DTOs
- `medusa.dto.ts`: Medusa backend-specific DTOs
- `index.ts`: Main export file
