# DIGITAL CASH — deployment checklist

## Web app on Vercel

1. Connect the GitHub repository `Ched242/digital-cash` to Vercel.
2. Keep the project root directory at `.`; Vercel should detect Next.js automatically.
3. Add these environment variables for Production, Preview and Development:
   - `NEXT_PUBLIC_SUPABASE_URL` = the DIGITAL CASH Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the Supabase publishable key
   - `NEXT_PUBLIC_APP_URL` = the deployed HTTPS site URL
4. Deploy the `main` branch.
5. In Supabase Authentication URL Configuration, set the Site URL to the deployed site and add the exact confirmation callback URL `https://YOUR_DOMAIN/auth/confirm` to the redirect allowlist.
6. Test registration, email confirmation, sign-in, catalogue access and support ticket creation.

Do not add payment credentials yet. Do not put Supabase secret keys, service-role keys, payment secrets, supplier keys or webhook secrets in any `NEXT_PUBLIC_*` variable.

## First administrator

After the first user account has been created and confirmed, grant that account the trusted Supabase Auth `app_metadata.role = "admin"` claim using a secure server-side administrative method. Never grant admin through a browser form or user-editable metadata. Refresh the user's session after the claim is changed.

## Android and iOS builds

1. Create or sign in to an Expo account.
2. From the `mobile/` directory, copy `.env.example` to `.env` and set:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Run `npx eas-cli@latest login`, then `npx eas-cli@latest init` to attach this app to your Expo project.
4. Build Android with `npx eas-cli@latest build --platform android --profile preview`.
5. Build iOS with `npx eas-cli@latest build --platform ios --profile preview`.

A store release still requires the appropriate Google Play and Apple Developer accounts, signing, store metadata, privacy disclosures and real-device testing.

## Payments and digital-goods fulfilment

Payments and automatic fulfilment are intentionally disabled until official merchant/supplier accounts, country support, credentials, webhook signatures, refunds and end-to-end sandbox tests are configured. Orders remain `awaiting_payment`; no customer is asked to send money manually. Never enable production payments until provider callbacks are verified server-side and idempotently.
