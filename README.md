# DoorStop — Door Company Management Software

**This is a neutered version, full version avaliable on request**

Internal management dashboard for a door company. Manage jobs, quotes, customers, invoices, purchase orders, and a full hardware/product catalogue from a single dashboard, with Xero invoicing built in.

<div style="display: flex; gap: 16px; flex-wrap: wrap; align-items:flex-start;">
  <img width="1911" height="853" alt="image" src="https://github.com/user-attachments/assets/1feb2103-f0bb-4129-8905-1fad123dde2b" />
  <img width="1898" height="914" alt="image" src="https://github.com/user-attachments/assets/e4d05152-a06a-4506-b57e-e241d600d396" />
  <img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/acc13bb5-5b6b-444a-8e5c-4fb8e3c9432e" />
</div>

## What it does

- **Jobs** — track installation jobs through their lifecycle (Scheduled → In Progress → On Hold → Completed → Cancelled)
- **Quotes** — build customer quotes from a catalogue of doors, hardware, and custom line items, from draft through to accepted/declined
- **Invoices** — generate invoices from quotes with automatic 15% GST, and push them straight to **Xero** as ACCREC invoices via OAuth2
- **Purchase Orders** — raise and track supplier orders, with per-item dispatch tracking
- **Customers** — maintain customer records and contact details
- **Product Catalogue** — doors (with a full pricing matrix by configuration/jamb/height/width/thickness), jamb types (metre-based pricing), hinges, handles, cavity sliders, tracks, and bundled products
- **Auth** — gated behind Supabase auth on both frontend (route guard) and backend (JWT validated via JWKS)

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 4.9 (strict), React Router 7, SCSS, Vite 6 |
| Backend | .NET 8 Web API, EF Core + Npgsql |
| Database | Postgres (Neon in deployed environments) |
| Auth | Supabase (JWT, validated via JWKS) |
| Accounting | Xero (OAuth2) |
| HTTP Client | Axios |

## Project Structure

```
DoorStop.sln
server/                        .NET 8 Web API
  Controllers/                 one per resource, + XeroController
  Data/                        AppDbContext.cs (EF Core, Postgres/Npgsql)
  Factories/                   IXxxFactory + XxxFactory, inject AppDbContext
  Models/                      Customer, Job, Invoice, Quote, Order, Hardware, Product
  Services/                    XeroService (IXeroService)
  Program.cs
src/                            React frontend
  root/                         app entry, routes.tsx (ProtectedRoute gate), layout/
  auth/                         AuthContext.tsx — Supabase session state
  lib/                          supabase.ts — Supabase client init
  pages/
    login/                      public route, outside ProtectedRoute
    home/
    main-pages/                 customers, invoices, jobs, orders, quotes
    side-pages/
      doors/, cavity-sliders/, hardware/    routed catalogue pages
      door-types/, hinge-types/, ...        api.ts/model.ts only, no routes
  components/                   button, table, status, modal, form-field, filter-bar, ...
  hooks/                        useCatalogCrud, useFetch
  api/                          client.ts (axios + Supabase bearer token), crud.ts, xero.ts
```

Each routed frontend feature follows `index.tsx` (logic) / `model.ts` (types) / `styles.scss` (styles). See `CLAUDE.md` for the full architecture writeup.

## Getting Started

### Backend
```bash
cd server
dotnet run
```
API runs at `https://localhost:64868` (HTTP: `http://localhost:64869`) · Swagger UI at `https://localhost:64868/swagger` (Development only)

Everything below is optional for local dev — sensible fallbacks live in `server/Program.cs` / `appsettings.json`:

| Variable | Purpose | Local fallback |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `ConnectionStrings:DefaultConnection` (`localhost:5432`, db `doorstop`) |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,https://localhost:5173` |
| `SUPABASE_URL` (or `Supabase:Url`) | Enables JWT auth enforcement | unset → auth is effectively disabled locally |
| `Xero:ClientId` / `Xero:ClientSecret` / `Xero:RedirectUri` / `Xero:FrontendUrl` | Xero OAuth2 app credentials | blank → Xero endpoints won't complete the OAuth flow |

The database schema is created via EF Core's `EnsureCreated()` on startup — there are no migrations, so schema changes to an already-provisioned database need to be applied out-of-band (e.g. via the Neon SQL editor).

### Frontend
```bash
npm run setup   # prompts for the API URL, writes .env, installs dependencies
npm start       # dev server at http://localhost:5173
```
Reads `VITE_API_URL` (falls back to `https://localhost:64868`).

## API

Full CRUD REST API for every resource (`GET /resource`, `GET /resource/{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`). All endpoints require a valid Supabase JWT except `Xero`'s `connect`/`callback`.

| Resource | Route | Notes |
|----------|-------|-------|
| Customer | `/customer` | |
| Job | `/job` | |
| Invoice | `/invoice` | |
| Quote | `/quote` | |
| Order | `/order` | `PUT /order/{id}/items/{itemId}/dispatched` toggles dispatch; `POST /invoice` 400s if the source quote has undispatched items |
| DoorType | `/door-type` | `?leafType=`, `?material=` filters; nested `.../prices` sub-resource (incl. bulk import) |
| HandleType | `/handle-type` | `?finish=`, `?mechanism=` filters |
| HingeType | `/hinge-type` | |
| JambType | `/jamb-type` | |
| JambRequirement | `/jamb-requirement` | metres-of-jamb lookup (unit type × height) |
| CavitySliderType | `/cavity-slider` | `?supplier=`, `?heightMm=`, `?category=`, `?isPOA=` filters |
| TrackType | `/track-type` | `?supplier=`, `?trackTypeName=` filters |
| Product | `/product` | bundles catalogue items + custom lines into a sellable unit |
| Xero | `/xero` | `connect`/`callback` (OAuth2 redirect, anonymous), `status`/`disconnect`/`push-invoice/{quoteId}` |

## Deployment

Backend ships via the root `Dockerfile` (targets Render); frontend is a static Vite build (`vercel.json` handles SPA routing) deployed to Vercel, backed by Neon Postgres.

## Status

v0.1.0 — actively developed. Real Postgres (Neon), real Supabase auth, real Xero OAuth2 integration. No automated tests yet.
