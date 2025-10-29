# Sanity Studio CMS

This is the standalone Sanity Studio for content management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (use `.env.local`):
```
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=your_dataset
SANITY_STUDIO_API_VERSION=2025-10-22
```

Or use `NEXT_PUBLIC_` prefixed versions if sharing env vars with frontend.

## Running

```bash
npm run dev
```

The studio will be available at `http://localhost:3333`

## Deployment

```bash
npm run deploy
```

This deploys the studio to `sanity.studio` URL.
