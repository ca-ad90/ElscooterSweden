# Web Frontend

Next.js frontend for El Scooter Sweden e-commerce storefront.

## Development

```bash
npm run dev
```

Runs on http://localhost:8000

## Environment Variables

Required environment variables:
- `MEDUSA_BACKEND_URL` - Medusa backend URL (default: http://localhost:9000)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - Medusa publishable key
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID (for content queries)
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset name
- `NEXT_PUBLIC_SANITY_API_VERSION` - Sanity API version

## Building

```bash
npm run build
npm start
```
