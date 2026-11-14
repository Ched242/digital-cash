# DIGITAL CASH

International digital-products marketplace with a responsive web app and a shared Android/iOS app foundation.

## Stack
- Web: Next.js App Router + TypeScript
- Database/Auth: Supabase Postgres, Auth and Row Level Security
- Mobile: Expo SDK 58 + React Native 0.88
- CI: web production build and mobile Android/iOS bundle export

## Web routes
- `/` — public home page
- `/products` — public catalogue and shopping cart
- `/register`, `/login` — Supabase email authentication
- `/dashboard` — customer dashboard and order history
- `/orders/[id]` — order details and delivered digital codes
- `/support` — customer support
- `/admin` — protected admin overview
- `/admin/products` — product management
- `/admin/orders` — order processing and manual fulfilment
- `/admin/support` — support ticket management
- `/api/health` — app liveness only

## Mobile app
The Expo app is in `mobile/`. It supports Android and iOS, uses Supabase Auth with device secure storage, displays active products, a cart, customer orders and account sign-in.
- Copy `mobile/.env.example` to `mobile/.env`.
- Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Run `cd mobile && npm install && npx expo start`.
- Build native binaries with an Expo account and EAS Build after replacing the placeholder EAS project ID.

## Secure order creation
The database function `public.create_order_from_cart(jsonb)` derives product prices from the database, checks active stock and currency consistency, enforces quantity limits, and atomically creates an order with item price snapshots. Direct customer INSERT on orders is revoked. Orders start as `awaiting_payment`.

An order is never marked paid by a client redirect or by the shopping cart. A verified payment provider webhook must set the paid state before an admin can fulfil the order. The current build deliberately does not accept or collect real payments until merchant provider APIs and webhook verification are configured.

## Supabase security
The separate Supabase project contains profiles, categories, products, orders, order items, payment transactions, deliveries and support tickets. RLS is enabled. Admin authorization relies on trusted `app_metadata.role`, never user-editable metadata. The order-creation RPC checks `auth.uid()`, uses a fixed search path and is executable only by authenticated users.

The first admin must be granted `app_metadata.role = "admin"` through a trusted Supabase Auth administrative process. Do not allow public clients to edit this claim.

## Integrations
Payment gateways, MTN/Airtel/Orange Money, digital-goods suppliers and notifications remain unconfigured. Add provider keys only as server-side secrets after selecting and testing the official provider adapters for the target countries. Never commit secrets or put them in `EXPO_PUBLIC_` variables.

## Deployment
Follow [the deployment checklist](docs/DEPLOYMENT.md) to connect Vercel, configure Supabase redirects, provision the first admin safely, and prepare Android/iOS builds.
