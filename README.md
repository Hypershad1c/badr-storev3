# Apex Store — Full-Stack Ecommerce Platform

A production-ready ecommerce platform built with Next.js 15, TypeScript, Prisma, PostgreSQL, Stripe, and more.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Animations | Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 (Auth.js) |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend |
| Storage | Cloudinary |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Deploy | Vercel |

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/           # Login, Register, Forgot Password
│   ├── (shop)/           # Public storefront
│   ├── (dashboard)/      # Admin + Business Manager
│   ├── (customer)/       # Profile, Orders
│   └── api/              # REST API routes
├── actions/              # Next.js Server Actions
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── layout/           # Navbar, Footer
│   ├── shop/             # Product cards, cart, hero
│   └── dashboard/        # Sidebar, header, charts
├── lib/                  # Prisma, Stripe, Cloudinary, email
├── store/                # Zustand stores (cart, wishlist)
├── types/                # TypeScript types
├── prisma/               # Schema + seed
└── middleware.ts         # Route protection
```

---

## ⚡ Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd ecommerce-platform
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Run: `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com) |
| `STRIPE_WEBHOOK_SECRET` | After setting up webhook (step 5) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com) |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Dashboard](https://cloudinary.com) |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |

### 3. Set up database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Set up Stripe Webhook (local)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/payments/webhook

# Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET in .env
```

---

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@store.com | password123 |
| Business Manager | manager@store.com | password123 |
| Customer | customer@store.com | password123 |

---

## 🔐 User Roles & Permissions

### ADMIN
- Full system access
- Manage users, roles, bans
- Access all dashboard sections
- Manage system settings

### BUSINESS_MANAGER
- Manage products & categories
- View and update orders
- Manage virtual service requests
- View analytics
- Send emails

### CUSTOMER
- Browse and purchase products
- Submit service requests
- Manage profile & addresses
- View order history
- Wishlist & reviews

---

## 💳 Stripe Integration

The app uses Stripe Checkout for payments:

1. Customer adds items to cart
2. Fills shipping address at checkout
3. Redirected to Stripe Checkout
4. On success → webhook fires → order confirmed, stock decremented, email sent

**Test card:** `4242 4242 4242 4242` · Any future date · Any CVC

---

## 📧 Email System (Resend)

Automatic emails sent for:
- ✅ Welcome (on registration)
- ✅ Order confirmation (on payment)
- ✅ Service request received (customer + admin)
- ✅ Contact form submission

---

## ☁️ Cloudinary

Used for product image uploads in the admin dashboard. Images are automatically optimized and delivered via CDN.

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then add production webhook in Stripe dashboard pointing to:
# https://your-domain.vercel.app/api/payments/webhook
```

**Post-deployment:**

```bash
# Run migrations on production DB
npx prisma migrate deploy

# Seed production data (optional)
npm run db:seed
```

---

## 🧪 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema (no migration)
npm run db:migrate   # Create migration
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset DB + reseed
```

---

## 📱 Pages

### Public
- `/` — Homepage with hero, featured products, categories
- `/shop` — Full product catalog with filters
- `/product/[slug]` — Product detail with gallery, reviews
- `/categories` — All categories with products
- `/search` — Search with results
- `/cart` — Cart page
- `/checkout` — Checkout with Stripe
- `/wishlist` — Saved products
- `/contact` — Contact form

### Auth
- `/login` — Sign in
- `/register` — Create account
- `/forgot-password` — Password reset

### Customer
- `/profile` — Edit profile & password
- `/orders` — Order history

### Dashboard (Admin/Manager)
- `/dashboard` — Overview with stats & charts
- `/dashboard/products` — CRUD products
- `/dashboard/categories` — CRUD categories
- `/dashboard/orders` — Manage orders & statuses
- `/dashboard/virtual-requests` — Service request management
- `/dashboard/users` — User management (Admin only)
- `/dashboard/analytics` — Revenue & sales charts
- `/dashboard/emails` — Send emails
- `/dashboard/settings` — Coupon management (Admin only)
- `/dashboard/activity-logs` — Audit log (Admin only)

---

## 🎨 Design System

- **Colors:** CSS variables with dark/light mode
- **Typography:** Inter (system fallback)
- **Radius:** 0.75rem (rounded-lg)
- **Animations:** Framer Motion page transitions + hover effects
- **Glassmorphism:** `.glass` utility class

---

## 🔒 Security

- ✅ RBAC with middleware route guards
- ✅ JWT sessions (NextAuth)
- ✅ Bcrypt password hashing (rounds: 12)
- ✅ Zod input validation on all forms + API routes
- ✅ Stripe webhook signature verification
- ✅ Server Actions with session checks
- ✅ Admin-only route enforcement

---

Built with ❤️ using Next.js 15
