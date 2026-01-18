# E-Commerce Phase 1 (Foundations)

Next.js App Router + TypeScript + Tailwind CSS + Supabase Auth/Postgres.

## Folder structure (proposed)

```
.
|-- app
|   |-- admin
|   |   `-- page.tsx
|   |-- auth
|   |   `-- page.tsx
|   |-- dashboard
|   |   `-- page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components
|   |-- auth-form.tsx
|   `-- sign-out-button.tsx
|-- lib
|   `-- supabase
|       |-- client.ts
|       `-- server.ts
|-- middleware.ts
|-- supabase.sql
|-- next.config.mjs
|-- next-env.d.ts
|-- package.json
|-- postcss.config.js
|-- tailwind.config.ts
`-- tsconfig.json
```

## Setup steps

1) Create a Supabase project
- Go to https://supabase.com and create a new project.
- In Authentication > Providers, ensure Email is enabled.
- For immediate sign-in after sign-up, turn off "Confirm email" in Auth settings.

2) Set environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Notes:
- The service role key is server-only. It is never used in client code.

3) Run the Supabase SQL

Open the Supabase SQL Editor and run the contents of `supabase.sql`.

4) Install dependencies and run the app

```
npm install
npm run dev
```

App will be available at http://localhost:3000

## Make someone an admin

Find the user's UUID in `auth.users` or `public.profiles`, then run:

```
update public.profiles
set role = 'admin'
where id = 'USER_UUID_HERE';
```

## Security model (high level)

- RLS is enabled on `public.profiles`.
- Users can select/update their own profile.
- Admins can select/update all profiles.
- A database trigger blocks role changes unless the requester is an admin.
- No service role key is exposed to the browser.

## Acceptance checks

- New user can sign up and is redirected to `/dashboard` (with email confirmations disabled).
- A `profiles` row is created automatically by the `handle_new_user` trigger.
- `/dashboard` redirects unauthenticated users to `/auth` via middleware.
- `/admin` redirects unauthenticated users and shows 403 for non-admins.
- Non-admin users cannot update the `role` field (enforced by trigger).

## Phase 2 Setup

- Run the SQL files in this order using the Supabase SQL Editor:
  - `001_phase2_schema.sql`
  - `002_phase2_rls.sql`
  - `003_phase2_storage.sql`
- Confirm the storage bucket `product-images` exists and is set to public read.
- Ensure you have an admin user (see the Phase 1 admin step).
- Visit `/admin/db-check` while signed in as an admin to verify access.

## Phase 2 Acceptance Tests (Manual)

- As anonymous:
  - Reading active products and categories should succeed.
  - Writing to products or categories should be blocked.
- As a normal user:
  - Creating, updating, or deleting products/categories should be blocked.
  - Creating an order for the signed-in user should succeed.
  - Reading another user's orders should be blocked.
  - Updating order status or payment status should be blocked.
- As admin:
  - Creating, updating, deleting products and categories should succeed.
  - Reading and updating any order status should succeed.
- Storage:
  - Non-admin uploads to `product-images` should be blocked.
  - Admin uploads and deletes should succeed.
  - Public read of images should succeed.

## Phase 3 Setup

- Run `004_phase3_rpc.sql` in Supabase SQL Editor to add the order creation RPC.
- Add at least one category and product in Supabase Table Editor:
  - Ensure `products.is_active = true` and `stock > 0`.
  - Add image URLs if you uploaded product images to the `product-images` bucket.
- Restart the Next.js dev server after SQL changes.

## Phase 3 Acceptance Tests (Manual)

- Logged out:
  - Browse catalog and product detail pages.
  - Clicking Checkout redirects to `/auth?next=/checkout`.
- Logged in:
  - Add products to cart, change quantities, remove items.
  - Checkout with a valid shipping address.
  - After placing order, you are redirected to `/orders/[id]?success=1`.
  - Order appears in `/orders` with correct total.
  - Product stock decreases in `products` table.
- Out-of-stock:
  - Set product stock below desired qty and attempt checkout.
  - Order fails with an error and no order is created.

## Phase 4 Admin Panel

- Promote an admin user in Supabase:
  - Update `profiles.role` to `admin` for your user.
- Admin panel routes:
  - `/admin` for dashboard.
  - `/admin/products` to manage products and images.
  - `/admin/orders` to update order status.
  - `/admin/categories` for category CRUD.
- Product images:
  - Upload images in `/admin/products/[id]`.
  - Images are stored in `product-images` bucket under `products/{productId}/...`.
- Known limitations:
  - Admin email lookup is not displayed; order list shows user IDs.
  - PayU and Stripe are selectable but not integrated yet.

## Phase 4 Acceptance Tests (Manual)

- Non-admin:
  - Visiting `/admin/*` redirects to `/dashboard` or `/auth`.
  - Admin actions (create/update/delete) fail.
- Admin:
  - Create a product with images and see it on the storefront.
  - Update price/stock/is_active and verify changes on `/`.
  - Delete a product.
  - Update order status and confirm user sees the updated status in `/orders`.

## Phase 5 Payments + Production

### Supabase SQL (run in order)

- `005_phase5_payments_schema.sql`
- `006_phase5_payments_rls.sql`
- `007_phase5_payment_methods.sql`

### Razorpay setup

1) Create Razorpay API keys (Test mode is fine for dev).
2) Add webhook in Razorpay Dashboard:
   - URL: `https://<your-domain>/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed` (and `order.paid` if enabled)
3) Add environment variables:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`

Note: PayU and Stripe are selectable in checkout, but online confirmation is not live yet. Orders will remain unpaid for those methods until you add their integrations. Only Razorpay and COD are active.

### Vercel env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

### Production checklist

- RLS enabled and tested on all tables, including payments.
- Admin user seeded.
- Webhook signature verification working.
- `payment_events` logging enabled (verify a test webhook).
- No secrets in client bundles (only `RAZORPAY_KEY_ID` is public).

### Phase 5 Acceptance Tests (Manual)

- Place an order (unpaid) and verify a "Pay Now" CTA appears.
- Complete payment in Razorpay checkout.
- Webhook arrives and creates a `payment_events` row.
- `orders.payment_status` becomes `paid` (and status becomes `confirmed`).
- Attempt to pay a paid order returns HTTP 409 from `/api/payments/create`.
- Invalid webhook signature returns HTTP 401 and does not mark the event processed.
- Cash on delivery orders show COD as the payment method without a Pay Now CTA.

### Admin notes

- `/admin/webhooks` shows failed webhook events for quick inspection.

## Phase 6 Premium Storefront UI

### UI checklist

- Sticky header with announcement bar, mega menu, search, and mini cart drawer.
- Search overlay (Ctrl+K or /) with suggestions and recent searches.
- PLP filters, chips, sorting, pagination, and skeleton loading states.
- PDP gallery, trust block, sticky mobile CTA, tabs/accordion, and related products.
- Cart and checkout polish with stepper, trust copy, and improved empty states.
- Toasts for add-to-cart and quick feedback.

### Customize text and thresholds

- Announcement bar copy: `components/layout/announcement-bar.tsx`
- Header brand name and CTAs: `components/layout/header.tsx`
- Footer copy and support contact: `components/layout/footer.tsx`
- Homepage hero copy: `app/(store)/page.tsx`
- Trust block and delivery estimate text: `components/store/trust-block.tsx`
- Search overlay suggestions: `components/layout/search-overlay.tsx`

### Style guide

- Fonts: Space Grotesk (display) and Plus Jakarta Sans (body) in `app/layout.tsx`
- Design tokens: CSS variables in `app/globals.css` and theme extensions in `tailwind.config.ts`
- UI primitives: `components/ui/*` for Button, Input, Card, Badge, Tabs, Accordion, Drawer, Modal, Skeleton

## Phase 7 Clothing Store Demo Content

### Supabase SQL (run in order)

- `008_phase7_schema.sql`
- `009_phase7_rls.sql`

### Seed the clothing catalog (Unsplash)

1) Add environment variables:
   - `UNSPLASH_ACCESS_KEY`
   - `SUPABASE_URL` (or reuse `NEXT_PUBLIC_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optional: `SEED_COUNT` (80-150, default 90)
2) Run the seed script:
   - `npm run seed:clothing`
3) Verify in Supabase:
   - 9 categories exist.
   - 80+ products exist with images and attribution.

Note: Unsplash has rate limits. If you hit a limit, wait and rerun. The script is idempotent via product slugs.

### Phase 7 Acceptance Tests (Manual)

- Home page shows hero, featured categories, new arrivals, collections, and best sellers.
- Navbar shows: Home, Products, Gallery, Help.
- Gallery shows a masonry grid of clothing images that link to products.
- Help page shows FAQ and contact info from site settings.
- PDP shows photo credits for Unsplash images.




