# THE CREATIVE ENGINE - Portfolio

Modern portfolio website with a section-based admin panel.

## Highlights

- Neo mint/cyan design system
- Loading screen, hero, about, experience, featured works, services, toolbox, numbers, contact, footer
- Experience modal galleries (`Show Work`)
- Bottom quick showcase slider before contact
- Social links (Instagram, LinkedIn, WhatsApp)
- Admin panel with sidebar navigation and form-based editing (no raw code editor in workflow)
- Per-section media controls using:
  - direct URL inputs
  - file upload inputs

## Tech

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Motion (`motion/react`)
- GSAP + ScrollTrigger
- Lenis
- Zod
- Vercel Blob (`@vercel/blob`)

## Run locally

```bash
npm install
npm run dev
```

Open:

- Website: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

Default admin password (if not configured): `admin123`

## Admin workflow

1. Login to `/admin/login`.
2. Use the sidebar to pick a section.
3. Update fields directly.
4. For image/video fields, either:
   - paste a media URL, or
   - upload a file and let admin fill URL.
5. Click `Save Changes`.

## Environment variables

Create `.env.local`:

```bash
ADMIN_PASSWORD=replace-with-strong-password
ADMIN_SESSION_SECRET=replace-with-long-random-secret

# Optional: force secure admin cookie (recommended in HTTPS environments)
ADMIN_COOKIE_SECURE=true

# Optional but recommended for Vercel media/content persistence:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## Persistence behavior

- If `BLOB_READ_WRITE_TOKEN` is set:
  - content + uploaded media are stored in Vercel Blob.
- If not set:
  - content is stored in `data/content.json`
  - uploads are stored in `public/uploads`

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add env vars.
4. Connect Vercel Blob and set `BLOB_READ_WRITE_TOKEN`.
