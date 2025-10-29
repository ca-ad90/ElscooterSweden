# El Scooter Sweden

E-commerce project using Medusa.js for backend logic and Sanity for content management.

## Project Structure

```
ElscooterSweden/
├── ess-store/      # Medusa backend (e-commerce logic)
├── cms/            # Sanity Studio (content management)
└── web/            # Next.js frontend (storefront)
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or yarn

### Installation

Install dependencies for all projects:

```bash
npm run install:all
```

### Development

Run all services concurrently:

```bash
npm run dev
```

Or run individually:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:web

# CMS only
npm run dev:cms
```

### Services

- **Backend (Medusa)**: http://localhost:9000
- **Frontend (Next.js)**: http://localhost:8000
- **CMS (Sanity Studio)**: http://localhost:3333

## Environment Variables

Each project may have its own `.env` files. Check individual project READMEs for required variables.

## License

ISC
