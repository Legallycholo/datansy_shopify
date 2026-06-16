# Contributing to the Datansy theme

Practical rules for anyone editing this theme. Keep changes small, validate before
deploy, and follow the conventions below so regressions don't creep back in.

---

## Image URLs — read this before touching any `<img>`

Shopify serves CDN images through two **incompatible** resizing mechanisms. Mixing
them is what caused the broken-image incident documented in `WEB_PERFORMANCE.md`.

### ✅ Always
- **In Liquid**, resize with the `image_url` filter and a width:
  ```liquid
  {{ product.featured_media | image_url: width: 800 }}
  {{ media | image_url: width: 144 | image_tag: loading: 'lazy', decoding: 'async', alt: media.alt }}
  ```
- **In JavaScript**, use the shared helpers — never build CDN URLs by hand:
  - `shopifyImageAtWidth(url, width)` in [`assets/dty-product.js`](assets/dty-product.js)
  - `cartImageAtWidth(url, width)` in [`assets/dty-header.js`](assets/dty-header.js)

  Both set the modern `?width=` query parameter and strip any legacy size suffix,
  so they're safe to call on any Shopify CDN URL (`preview_image.src`, cart
  `item.image`, a `data-full-src`, etc.).

### ❌ Never
- **Never** build the legacy filename-suffix transform:
  ```js
  url.replace(/(\.[^.]*)$/, '_800x$1')   // ✗ 404s against modern CDN URLs
  ```
  Patterns like `_120x`, `_800x`, `_1200x1200` in a filename are deprecated and
  conflict with `?width=`. If you see one, replace it with the helper above.

### Other image rules
- Below-the-fold images get `loading="lazy"` **and** `decoding="async"`.
- The LCP image (PDP main image, logo) uses `fetchpriority="high"` + `loading="eager"`.
- Keep the PDP preload `imagesizes` in [`layout/theme.liquid`](layout/theme.liquid) in
  sync with the `sizes` attribute on the main image in
  [`sections/main-product.liquid`](sections/main-product.liquid) (currently
  `(min-width: 1024px) 44vw, 100vw`).
- Broken images degrade gracefully via the `dty-img-broken` class — a global
  capture-phase `error` listener in `dty-header.js` applies it, styled in
  `dty-base.css`. You don't need per-image `onerror` handlers.

---

## Color swatches

Swatch fill is resolved in [`sections/main-product.liquid`](sections/main-product.liquid)
in priority order — add data at the highest tier you can:

1. **Variant metafield `custom.color_hex`** (e.g. `#1C1917`) — exact brand color.
2. **Variant featured image** — used as the swatch background automatically.
3. **CSS color-name map** in [`assets/dty-product.css`](assets/dty-product.css) — a
   fallback keyed on `data-color-value="{{ value | handleize }}"`.

The CSS map is a *fallback only*; the catalog will always outgrow a static list, so
prefer `custom.color_hex` or a variant image for accuracy. Compound names handleize
with hyphens (`"Dark Gray"` → `dark-gray`).

---

## Design tokens

- Brand color comes from theme settings → `--dty-blue` (set in `theme.liquid`).
  Derived shades `--dty-blue-hover` / `--dty-blue-tint` track it automatically via
  `color-mix` — use those instead of hardcoding hex values.
- RGB components (`--dty-primary-rgb`, `--dty-dark-rgb`, `--dty-accent-rgb`) are
  recomputed from settings in `theme.liquid` so translucent overlays follow admin
  color changes. Don't hardcode `rgba(194, 65, 12, …)`; use
  `rgba(var(--dty-primary-rgb), …)`.
- Note: `--dty-blue` is historically named but holds the **burnt-orange** primary.
  A global rename is intentionally deferred (high churn, low value).

---

## Naming convention (`dty` prefix)

All theme sections, snippets, assets, CSS tokens, and JSON section instance keys use
the **`dty`** prefix (Datansy). Legacy **`gsm` / GSMPRO** identifiers are forbidden in
theme code — `node scripts/validate-theme.mjs` fails if they reappear.

---

## Validating changes

Run both before deploying:

```bash
# Fast structural checks (required files, schema JSON, section types, deprecated Liquid)
node scripts/validate-theme.mjs

# Full Shopify lint (Liquid correctness, performance, accessibility, translations)
shopify theme check
```

Known/accepted `theme check` warnings: Google Fonts `RemoteAsset` / `AssetPreload`
(external fonts can't be Shopify-CDN served).

---

## Smoke test before every deploy

Manually verify on a preview theme:

- [ ] **PDP**: main image loads and stays loaded after JS init (no 404s in Network).
- [ ] **PDP**: click each thumbnail — image + srcset update correctly.
- [ ] **PDP**: switch color/size variants — gallery updates to the right image.
- [ ] **PDP**: click the main image — zoom lightbox opens; Esc / arrows / close work.
- [ ] **Swatches**: different colors render visually distinct (no identical grays).
- [ ] **Cart**: add to cart — drawer thumbnail displays correctly.
- [ ] **Mobile (375px)**: gallery swipe + sticky ATC bar work; no horizontal overflow.
