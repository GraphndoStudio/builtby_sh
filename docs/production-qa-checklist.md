# Production QA Checklist

## Pre-Launch Commands

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run start` and smoke test main routes

## Environment Validation

- [ ] `NEXT_PUBLIC_SITE_URL` is set to your production domain
- [ ] `ADMIN_SESSION_SECRET` is set (strong random value)
- [ ] `ADMIN_COOKIE_SECURE=true` in production
- [ ] `BLOB_READ_WRITE_TOKEN` is set for persistent media/content
- [ ] `ADMIN_EMAIL_CHANGE_OTP` set if OTP email-change flow should be enabled

## Mobile QA (360px-430px)

- [ ] Header does not overlap hero content
- [ ] Hamburger opens/closes correctly (overlay, close button, Esc)
- [ ] Hero media transitions are smooth without flicker
- [ ] About section order is text first, image second
- [ ] Experience timeline glow tracks scroll properly
- [ ] Featured Works cards are not oversized and remain readable
- [ ] Case-study modal opens, scrolls, and closes reliably
- [ ] Contact buttons and social links are tap-friendly

## Desktop QA (1280px-1920px)

- [ ] Hero composition balance (text/media spacing) looks intentional
- [ ] Background ambient objects are visible but not distracting
- [ ] Experience timeline dots and glow align with cards
- [ ] Featured Works images and detail panels align cleanly
- [ ] Services/Toolbox/Why sections have consistent visual hierarchy
- [ ] Footer spacing and typography feel balanced

## Admin QA

- [ ] First-time registration flow works on production
- [ ] Login/logout works with session persistence
- [ ] Content updates save and reflect on frontend
- [ ] Image/video upload and URL fields both work
- [ ] Password reset works from Admin Settings
- [ ] Email change requires OTP and handles invalid OTP gracefully

## SEO & Social QA

- [ ] `<title>` and description are correct on homepage
- [ ] `robots.txt` resolves at `/robots.txt`
- [ ] `sitemap.xml` resolves at `/sitemap.xml`
- [ ] Open Graph image resolves at `/opengraph-image`
- [ ] Twitter image resolves at `/twitter-image`
- [ ] Link previews render correctly in WhatsApp / LinkedIn / X

## Performance QA

- [ ] No major layout shifts while images load
- [ ] No persistent console errors in production build
- [ ] Animations remain smooth on mid-range mobile devices
- [ ] Reduced motion preference degrades animation intensity correctly
