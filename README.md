# AI-Chart

Personal data intelligence dashboard for converting unstructured data into structured charts using AI.

## Project Structure

```
AI-Chart/
├── apps/
│   ├── server/          # Hono backend for Cloudflare Workers
│   └── web/             # React + Vite frontend
├── packages/
│   ├── shared/          # Shared Zod schemas and TypeScript types
│   └── ai-core/         # AI logic with Vercel AI SDK and Gemini
├── package.json         # Root workspace configuration
├── pnpm-workspace.yaml  # pnpm workspace definition
└── turbo.json          # Turborepo pipeline configuration
```

## Tech Stack

- **Package Manager**: pnpm
- **Monorepo Tool**: Turborepo
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Hono + Cloudflare Workers
- **Deployment**: Cloudflare Ecosystem (Pages for frontend, Workers for backend)

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Or run individual apps:

```bash
# Frontend (http://localhost:5173)
cd apps/web
pnpm dev

# Backend (http://localhost:8787)
cd apps/server
pnpm dev
```

### Build

Build all packages and apps:

```bash
pnpm build
```

### Deployment

**Frontend (Cloudflare Pages)**:
```bash
cd apps/web
pnpm build
# Deploy dist/ to Cloudflare Pages
```

**Backend (Cloudflare Workers)**:
```bash
cd apps/server
pnpm deploy
```

## Workspace Packages

### @ai-chart/shared

Shared TypeScript types and Zod schemas used across frontend and backend.

### @ai-chart/ai-core

AI logic layer for interacting with Vercel AI SDK and Gemini.

### @ai-chart/web

React frontend application for data upload and chart visualization.

### @ai-chart/server

Hono API server running on Cloudflare Workers.

## Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Run TypeScript type checking
- `pnpm clean` - Clean build outputs

## License

Private
