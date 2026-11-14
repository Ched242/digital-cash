# DIGITAL CASH — API integrations

This repository contains a provider-neutral integration layer. Credentials are added by the project owner in the hosting provider's server-side environment settings. Never commit real keys or place secret keys in NEXT_PUBLIC variables.

## Environment variables

Copy `.env.example` to your local `.env.local` for development, then fill only the providers you have activated.

- Supabase: project URL + publishable key for the browser; service-role key only on the server.
- Payments: generic payment gateway configuration.
- Mobile money: MTN MoMo, Airtel Money and Orange Money configuration slots.
- International payments: Stripe and PayPal configuration slots.
- Digital goods: one aggregator/provider for gift cards, airtime, bundles, gaming credits and subscriptions.
- Notifications: OneSignal and Termii.

## Important

These are configuration slots and typed contracts, not live provider integrations yet. Each provider has different API URLs, authentication, request/response formats, transaction states, idempotency requirements and webhook signature rules. A live adapter must be implemented and tested against the official documentation and merchant sandbox for the exact country/account before accepting real money.

No payment is considered successful from a browser redirect. The backend must verify provider status or a signed webhook before changing an order to paid. Fulfilment must be idempotent and must not expose provider credentials.

## Current API

- `GET /api/health` — application liveness check only. It does not confirm payment-provider connectivity.
