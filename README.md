# DIGITAL CASH

International digital-products marketplace — web-first foundation with a responsive customer experience and a protected administration area.

## Stack

- Next.js App Router + TypeScript
- Supabase Auth, Postgres and Row Level Security
- Responsive web interface
- Provider-neutral payment, digital-goods and notification integration contracts

## Local development

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Fill in the Supabase project URL and publishable/anon key.
4. Run `npm install`.
5. Run `npm run dev` and open `http://localhost:3000`.

Never commit `.env.local`, service-role keys, payment credentials, webhook secrets or supplier API keys.

## Main routes

- `/` — public home page
- `/products` — active product catalogue
- `/register` and `/login` — Supabase email authentication
- `/dashboard` — signed-in customer dashboard and order history
- `/support` — customer support tickets
- `/admin` — protected admin overview
- `/admin/products` — product creation and publication controls
- `/api/health` — application liveness endpoint

## Supabase

The separate Supabase project contains profiles, categories, products, orders, order items, payment transactions, deliveries and support tickets. Row Level Security is enabled. Admin access relies on the trusted `app_metadata.role` JWT claim, not user-editable metadata.

To grant the first administrator, set the `role: "admin"` claim in that user's Supabase Auth app metadata using a trusted administrative process. Do not let a public client update this claim.

## Integrations

Payment gateways, mobile money, digital-goods suppliers and notifications are deliberately not activated yet. Configuration placeholders are documented in `.env.example`; provider adapters, webhook verification and live end-to-end tests are a final integration phase.

A browser redirect is never proof of payment. Orders must only be marked paid after a verified provider response or signed webhook. No live payments or automatic fulfilment are enabled in this build.

## Deployment

Connect this repository to your hosting provider and configure the required environment variables there. Set the Supabase Auth Site URL and allowed redirect URL to the deployed application URL before testing email confirmation.

<!-- CI recheck after workflow cache correction -->
