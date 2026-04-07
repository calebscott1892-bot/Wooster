# Wooster Core

Wooster Core is a Next.js 16 storefront for the Wooster Core performance big air handle line. The app is ready for Vercel deployment and uses a server-side Stripe Checkout route for purchases.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in the values you need:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Validate the production build locally:

```bash
npm run build
```

## Environment variables

The project uses these variables:

- `SITE_URL`: Optional but recommended. Set this to your canonical production domain, for example `https://woostercore.com`.
- `STRIPE_SECRET_KEY`: Required to enable checkout in any deployed environment.

On Vercel, `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL` are used automatically as fallbacks for metadata when `SITE_URL` is not set.

## Vercel deployment

1. Import the repository into Vercel.
2. In Project Settings, add `STRIPE_SECRET_KEY` for Preview and Production.
3. Add `SITE_URL` for Production if you want canonical metadata to point at your custom domain.
4. Deploy. No custom Vercel build configuration is required; Vercel will detect the Next.js app automatically.

## Checkout behavior

- The checkout session is created on the server in `app/api/checkout/route.ts`.
- Prices are resolved from the local product catalog on the server rather than trusting the browser payload.
- If Stripe is not configured, the checkout button returns a clear runtime error instead of pretending an order succeeded.

## Notes

- `npm run build` currently succeeds.
- `npm run lint` still reports pre-existing issues in `components/PrintAnimation3D.tsx` that are unrelated to Vercel deployment.
