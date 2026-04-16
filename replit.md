# ERP-to-Canonical Field Mapping Agent

## Overview

A full-stack AI-powered application that maps ERP system JSON export fields to OpenText BNStandard Canonical XPaths. Uses a 3-layer matching strategy: rule-based adapter lookups, AI semantic matching via OpenAI GPT, and fuzzy string similarity fallback.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS v4 + shadcn/ui
- **AI**: OpenAI via Replit AI Integrations (gpt-5-mini)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Routing**: Wouter

## Application Structure

### Frontend (`artifacts/erp-mapper/`)
- `/` — Dashboard: stats overview, recent sessions, ERP chart
- `/mapper` — 3-step mapping wizard: select ERP + doc type → upload JSON → view results
- `/sessions` — Session history table
- `/sessions/:id` — Detailed session view with export

### Backend (`artifacts/api-server/`)
Key routes at `/api/mapping/*`:
- `GET /erp-systems` — List supported ERP systems
- `GET /canonical-schemas` — List canonical document types
- `POST /run` — Execute AI mapping pipeline
- `POST /export` — Generate CSV export
- `GET /sessions` — List past sessions
- `GET /sessions/:id` — Session detail
- `GET /stats` — Aggregate statistics

### AI Mapping Engine (`artifacts/api-server/src/lib/ai/`)
3-layer matching:
1. Rule-based adapter (known ERP field → canonical XPath lookup, confidence 0.95-1.0)
2. AI semantic matching via GPT-5-mini (confidence 0.6-0.94)
3. Fuzzy string similarity fallback (confidence 0.3-0.59)

### Canonical Schemas (`artifacts/api-server/src/lib/canonical/`)
Four fixed OpenText BNStandard schemas:
- Sales Order (V2.0)
- Invoice (V2.0)
- Purchase Order (V2.0)
- Shipment/ASN (V2.0)

### ERP Adapters (`artifacts/api-server/src/lib/erp/`)
- `parser.ts` — Flattens nested ERP JSON to flat field list with dot-notation paths
- `registry.ts` — ERP system list + known field mapping tables (MS Dynamics BC implemented)

### Excel/CSV Export (`artifacts/api-server/src/lib/excel/`)
Generates the 5-column SMR format: SMR Construct | Composite Mapping Reference | Dialect Term | Canonical XPath | ERP Json Path

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `mapping_sessions` — stores each mapping run with ERP fields, mapping results, and stats as JSONB

## Environment Variables Required

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI Integrations proxy URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations API key

## ERP Systems Supported

- Microsoft Dynamics Business Central (with pre-built known field mappings)
- SAP S/4HANA
- Oracle ERP Cloud
- NetSuite
- Epicor ERP
- Infor CloudSuite
- Generic / Other

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
