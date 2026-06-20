# Khanemadary Cafe Menu

A multilingual digital menu and admin panel for cafes, built with Next.js. It provides a mobile-friendly public menu for customers and a full back office for managing categories, items, discounts, settings, and backups.

## Features

### Public menu
- Multilingual UI: Persian (default), English, Arabic, Chinese, Russian, Turkish
- Category tabs with scroll spy navigation
- Menu items with images, gallery, prices, and availability status
- Working hours bar and detailed schedule sheet
- Announcement banners and hero events (image/video)
- World Cup match widget (optional)
- Map links (Neshan, Balad, Google Maps, Waze)
- Contact section, share menu, QR code, and PWA install prompt

### Admin panel
- Dashboard overview
- Category and menu item management with drag-and-drop reorder
- Discount rules (percentage/fixed, date range, weekdays)
- Cafe settings (branding, colors, working hours, contact info, maps, announcements, events)
- Full backup export and restore (SQLite database + uploaded media)
- Admin user management (superadmin only)
- Bilingual admin UI (Persian / English)

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Auth:** NextAuth.js
- **i18n:** next-intl
- **UI:** Tailwind CSS, Radix UI, Framer Motion

## Requirements

- Node.js 18+
- npm

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env file and update values for your environment:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `SITE_URL` | Public site URL |
| `NEXTAUTH_SECRET` | Random secret for session encryption |

### 3. Database setup

```bash
npm run db:push
npm run db:seed
```

This creates `prisma/cafe.db` and loads initial menu data from `reference-content.json`.

### 4. Create an admin user

```bash
npm run create-admin
```

Default credentials:

- Email: `admin@cafe.local`
- Password: `admin123`

Custom credentials:

```bash
npm run create-admin you@example.com your-password "Your Name"
```

### 5. Run the dev server

```bash
npm run dev
```

Open:

- Public menu: [http://localhost:3000/fa](http://localhost:3000/fa)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run dev:clean` | Clear `.next` cache and start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync Prisma schema to SQLite |
| `npm run db:seed` | Seed database with default menu data |
| `npm run create-admin` | Create or update an admin user |
| `npm run download-images` | Download remote images locally |
| `npm run migrate-image-urls` | Migrate image URLs in the database |

## Backup and restore

From **Admin → Backup** you can:

- **Export:** Download a `.zip` archive containing `cafe.db` and `public/uploads/`
- **Import:** Restore a backup archive or a standalone `.db` file

Supported formats: `.zip`, `.db`

## Production

```bash
npm run build
npm run start
```

Set production values for `NEXTAUTH_URL`, `SITE_URL`, and a strong `NEXTAUTH_SECRET` before deploying.

## Project structure

```
app/
  [locale]/          # Public menu (per locale)
  admin/             # Admin panel pages
  api/               # API routes (admin, auth, upload)
components/
  admin/             # Admin UI components
  public/            # Public menu components
lib/                 # Business logic and utilities
messages/            # Public locale strings
messages/admin/      # Admin locale strings
prisma/              # Schema, seed, SQLite database
public/uploads/      # Uploaded media (gitignored)
scripts/             # CLI utilities
```

## Notes

- The SQLite database (`prisma/*.db`) and uploaded files (`public/uploads/`) are not tracked in git.
- Pre-restore safety copies (`prisma/*.bak`) are also gitignored.
- iOS 12+ and Safari 12+ are supported via browserslist.

## Author

Built by [Arian Pezeshki](https://github.com/arianemun)
