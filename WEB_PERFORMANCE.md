# Datansy Web Performance & UX Fix Plan

> **Status:** Analysis complete — ready for implementation  
> **Scope:** Broken images, page speed, color/styling inconsistencies, product page structure  
> **Reference:** Screenshot of StealthTrack Slim Wallet Finder PDP (broken main image, identical gray color swatches)

---

## Executive Summary

The storefront theme is generally well-structured (Online Store 2.0, responsive srcset in Liquid, lazy loading on cards, LCP preload on PDP). However, **two JavaScript helpers use a deprecated Shopify CDN URL pattern** (`_800x`, `_120x` filename suffixes) that conflicts with the modern `?width=` API. This is the most likely root cause of **broken product gallery images on page load** and **broken cart thumbnails**.

Color swatches fail because the theme maps only ~12 basic color names via CSS attribute selectors; most real product variant names (e.g. *Graphite*, *Midnight*, *Silver*) fall back to the same gray default — matching what appears in the screenshot.

Performance can be improved by reducing render-blocking resources (fonts, CSS fragmentation), fixing image dimension accuracy (CLS), and deferring non-critical JS. A **full product page redesign is not required**; targeted fixes to the gallery JS, swatch system, and token consistency will deliver the biggest impact with minimal risk.

---

## 1. Images & Speed Analysis

### 1.1 Root Cause: Deprecated CDN URL Transform (Critical)

**Files affected:**
- `assets/dty-product.js` — `shopifyImageAtWidth()`, `buildSrcset()`, `setGalleryMainImage()`
- `assets/dty-header.js` — cart drawer item thumbnails

**What happens today:**

1. Liquid renders a valid image URL via the `image_url` filter:
   ```
   https://cdn.shopify.com/.../image.jpg?v=123&width=800
   ```
2. On `DOMContentLoaded`, `updateVariant(findVariant())` runs unconditionally (line 298).
3. If the selected variant has `featured_media`, JS replaces the good URL with a transformed URL using the **legacy suffix pattern**:
   ```
   https://cdn.shopify.com/.../image_800x.jpg?v=123   ← 404 / broken
   ```

```35:41:assets/dty-product.js
    function shopifyImageAtWidth(url, width) {
      if (!url) return '';
      if (url.indexOf('width=') !== -1) {
        return url.replace(/width=\d+/, 'width=' + width);
      }
      return url.replace(/(\.[^.?]+)(\?.*)?$/, '_' + width + 'x$1$2');
    }
```

The same legacy pattern appears in the cart drawer:

```308:308:assets/dty-header.js
        '<img class="dty-cart-drawer__item-image" src="' + (item.image ? item.image.replace(/(\.[^.]*)$/, '_120x$1') : '') + '" alt="' + item.title + '" width="80" height="80" loading="lazy">' +
```

**Impact:**
- PDP main image breaks immediately after JS loads (matches screenshot: alt text visible, broken icon)
- Variant switching breaks gallery images
- Thumbnail navigation may break when `buildSrcset()` re-applies the bad transform
- Cart drawer shows broken product thumbnails site-wide

**Severity:** P0 — fix before any other image work.

---

### 1.2 Secondary Image Issues

| Issue | Location | Impact |
|-------|----------|--------|
| Hardcoded `width="800" height="800"` on PDP main image | `sections/main-product.liquid` | Layout shift (CLS) when actual media is not square |
| Preload `imagesizes` mismatch (`50vw` vs `44vw`) | `layout/theme.liquid` vs `main-product.liquid` | Suboptimal LCP image selection |
| Thumbnail click uses `data-full-src` (Liquid, correct) but then `buildSrcset()` corrupts srcset | `dty-product.js` | Broken srcset after thumb click |
| Product JSON blob embedded inline | `main-product.liquid` line 277 | Larger HTML payload on every PDP |
| Recommendations loaded via client-side fetch | `dty-product.js` `loadRecommendations()` | Extra network round-trip; section may flash empty |
| No `onerror` fallback on `<img>` tags | Theme-wide | Broken images show browser default with no graceful fallback |
| Catalog/content images in product descriptions | Shopify Admin (not theme) | Broken links if merchants paste external URLs or delete assets |

**Admin/catalog checks (outside theme code):**
- Verify each product has at least one image assigned in Shopify Admin
- Confirm variant featured media is linked correctly (Store checklist item unchecked: *"When selecting a variant, the image attached to it becomes the main image"*)
- Audit product description HTML for hardcoded external image URLs
- Target minimum 1000×1000 px product photography (per `Store_checklist.md`)

---

### 1.3 Performance Bottlenecks

#### Render-blocking & third-party resources

| Resource | File | Notes |
|----------|------|-------|
| Google Fonts (DM Sans + Syne) | `layout/theme.liquid` | 2 font families; async via `media="print"` trick but still 2 HTTP requests |
| Material Symbols Outlined (full icon font) | `layout/theme.liquid` | Loaded globally on every page; large payload for ~30 icons used |
| 4–6 separate CSS files | `theme.liquid` | `dty-base`, `dty-header`, `dty-footer`, `bodegas`, `dty-catalog`, `dty-product`/`dty-home`/`dty-pages` |
| GTM | `snippets/dty-gtm-head.liquid` | Adds third-party JS when configured |
| Shopify `content_for_header` | Auto | App scripts (Vitals, etc.) add weight post-launch |

#### JavaScript loading

| Script | Loaded on | Notes |
|--------|-----------|-------|
| `dty-header.js` | All pages | Required |
| `dty-markets.js` | All pages | Markets/localization |
| `dty-footer.js` | All pages | Back-to-top, newsletter |
| `dty-catalog.js` | Index, collection, search, product | Sliders + quick-add |
| `dty-product.js` | Product only | Gallery, variants, recommendations fetch |

#### Image loading (what is already good)

- Product cards use `image_tag` with `widths` and `sizes` (`snippets/dty-product-card.liquid`)
- PDP main image uses `fetchpriority="high"` and `loading="eager"`
- LCP preload link on product template
- Thumbnails use `loading="lazy"`
- Logo uses responsive `widths`

#### Estimated quick wins (no redesign)

1. Fix URL transform bug → restores images, eliminates wasted failed requests
2. Use real media aspect ratio for `width`/`height` attributes → reduces CLS
3. Self-host or subset Material Symbols → reduce font payload
4. Merge critical CSS or defer non-critical stylesheets → faster first paint
5. Server-render product recommendations when possible → remove client fetch
6. Align preload `imagesizes` with `sizes` attribute

---

## 2. Colors & Styling Analysis

### 2.1 Color Swatches — All Look Identical (Critical UX)

**Files affected:**
- `sections/main-product.liquid` — swatch markup
- `assets/dty-product.css` — color mapping (lines 42–66)

**How swatches work today:**

1. Color options are detected by name: `Color`, `Colour`, `Colore`, `Couleur`
2. Each swatch gets `data-color-value="{{ value | handleize }}"` (e.g. *"Dark Gray"* → `dark-gray`)
3. CSS only defines backgrounds for ~12 basic names (`black`, `negro`, `white`, `blanco`, `red`, `rojo`, etc.)
4. **Everything else falls back to** `background: var(--dty-gray)` (#F5F5F4)

**Why the screenshot shows 6 identical off-white circles:**
The StealthTrack wallet likely uses variant names like *Black*, *Brown*, *Tan*, *Charcoal*, *Silver*, or Spanish equivalents that are not in the CSS map. Only the orange selection ring differs.

**Additional gaps:**
- Compound names fail: `"Dark Blue"` → `dark-blue` does not match `"blue"` or `"azul"`
- No support for hex/metafield-driven colors (Shopify standard pattern)
- No variant image used as swatch background (best practice for accuracy)
- `Store_checklist.md` states *"I do not use colour swatches"* — theme implements swatches anyway (product decision vs. code mismatch)

---

### 2.2 Design Token Inconsistencies

**Legacy naming:**
- `--dty-blue` is actually **burnt orange** (`#C2410C`) — leftover from a prior blue-themed codebase
- Used as primary brand color across 50+ CSS rules; renaming is a refactor, not a quick fix

**Theme settings vs. hardcoded values:**

| Token | Theme setting | Hardcoded elsewhere |
|-------|---------------|---------------------|
| Primary | `settings.color_primary` → `--dty-blue` | `#9A3412` (btn hover), `#b83c0b` (announcement bar) in CSS |
| RGB overlays | `--dty-primary-rgb: 194, 65, 12` in `dty-base.css` | **Not recalculated** when merchant changes colors in theme editor |
| Placeholder gradient | Warm stone palette | `#e2e8f0` (cool blue-gray) in `.placeholder-image` |
| Swatch blue | N/A | `#2563eb` (Tailwind blue) — off-brand vs. warm premium palette |

**What `theme.liquid` overrides today:**

```79:92:layout/theme.liquid
  <style>
    :root {
      --dty-dark: {{ settings.color_header_bg }};
      --dty-blue: {{ settings.color_primary }};
      --dty-indigo: {{ settings.color_secondary }};
      --dty-yellow: {{ settings.color_accent }};
      --dty-gray: {{ settings.color_background_secondary }};
      --dty-surface: {{ settings.color_background }};
      --dty-text: {{ settings.color_text }};
      --dty-sale: {{ settings.color_sale }};
      ...
    }
  </style>
```

Missing: `--dty-primary-rgb`, `--dty-dark-rgb`, `--dty-accent-rgb` — shadows and translucent overlays won't track admin color changes.

---

### 2.3 Styling Inconsistencies Visible on PDP

| Element | Current behavior | Expected (Warm Premium palette) |
|---------|------------------|----------------------------------|
| Vendor link | Orange (`--dty-blue`) | Correct |
| Price | Red sale + orange current | Correct structure; verify `dty-money` formatting |
| Active swatch ring | Orange border | Correct, but fill color wrong |
| Gallery active thumb | Orange border | Correct |
| Trust badges / warehouse box | Stone gray backgrounds | Consistent |
| Share buttons (FB / X / WA) | Plain text abbreviations in circles | Functional but visually disconnected from brand |

---

## 3. Product Page Evaluation

### 3.1 Current Structure

**Template:** `templates/product.json`  
**Section:** `sections/main-product.liquid`

**Block order:**
1. Vendor → Title → Price (+ SKU) → Variant picker → Warehouse availability → Buy buttons → Trust badges → Share  
2. Tabs: Description | Specifications | Shipping  
3. Vitals reviews anchor (`#vitals-product-reviews`)  
4. Recommendations section (`dty-product-recommendations`)

**Layout:**
- CSS grid: `2fr 3fr` on desktop — gallery column is narrower than info
- Gallery capped at `max-width: 460px` — leaves empty space in left column (visible in screenshot)
- Sticky mobile ATC bar — good pattern
- No image zoom/lightbox despite checklist marking zoom as done

### 3.2 Verdict: Refactor vs. Fix-in-Place

| Approach | Recommendation |
|----------|----------------|
| **Fix-in-place** | ✅ **Recommended first.** The Liquid structure is sound; the JS URL bug and swatch CSS are the main failures. |
| **Partial layout tweak** | ✅ Adjust gallery column sizing and real aspect-ratio dimensions after JS fix. |
| **Full PDP redesign** | ❌ **Not needed now.** Would add scope and QA time without fixing the underlying bugs. Revisit only if conversion testing shows layout issues after fixes. |

### 3.3 Product Page Improvement Opportunities (Post-Fix)

1. **Variant image swatches** — use `matched_variant.featured_media` as swatch background instead of CSS color guessing
2. **Gallery sizing** — remove `max-width: 460px` cap or switch to balanced 1:1 grid columns
3. **Image zoom** — add lightweight click-to-zoom or Shopify native zoom pattern
4. **Reviews above fold** — integrate Vitals block after title (Phase 11)
5. **Structured data** — already present in `snippets/dty-jsonld.liquid`; verify image URL after JS fix

---

## 4. Implementation Plan

Work in priority order. Each phase has a verification step before moving on.

---

### Phase 0 — Baseline & Reproduce (30 min)

- [ ] Open StealthTrack Slim Wallet Finder PDP in Chrome DevTools → Network tab
- [ ] Confirm main image request returns **404** after page fully loads (not on initial HTML)
- [ ] Note failing URL pattern (`_800x` suffix vs `?width=800`)
- [ ] Run Lighthouse on PDP, homepage, and a collection page — save scores as baseline
- [ ] Document 3–5 products with broken images and their variant color names

**Done when:** Root cause confirmed in Network tab; baseline metrics recorded.

---

### Phase 1 — Fix Broken Images (P0, ~2 hours)

#### 1.1 Repair `shopifyImageAtWidth()` in `assets/dty-product.js`

- [ ] Replace legacy `_800x` suffix logic with URL API approach:
  - Parse existing URL
  - Set/replace `width` query parameter
  - Preserve `height`, `crop`, and `v` params
- [ ] Update `buildSrcset()` to generate `?width=400`, `?width=800`, `?width=1200` URLs
- [ ] In `setGalleryMainImage()`, prefer `data-full-src` from Liquid thumbs when available
- [ ] Add guard: only call `setGalleryMainImage()` on variant change if URL differs from current `src`
- [ ] Consider using `media.preview_image.src` with width param instead of manual string manipulation

#### 1.2 Fix cart drawer thumbnails in `assets/dty-header.js`

- [ ] Replace `_120x` suffix hack with `?width=120` (or use Shopify Cart API `image` field with size param if available)
- [ ] Add empty-state fallback when `item.image` is blank

#### 1.3 Harden Liquid templates

- [ ] In `main-product.liquid`, output real dimensions:
  ```liquid
  width="{{ product.featured_media.width }}"
  height="{{ product.featured_media.height }}"
  ```
- [ ] Align preload `imagesizes` in `theme.liquid` to match `sizes="(min-width: 1024px) 44vw, 100vw"`
- [ ] Add optional `onerror` handler or `<picture>` fallback to placeholder (low priority)

#### 1.4 Verify

- [ ] PDP main image loads and stays loaded after JS init
- [ ] Click each gallery thumbnail — image and srcset remain valid
- [ ] Change color/size variant — gallery updates to correct image
- [ ] Add product to cart — drawer thumbnail displays correctly
- [ ] Test on mobile (swipe gallery + sticky bar)

**Done when:** Zero 404s on image requests during a full PDP interaction flow.

---

### Phase 2 — Fix Color Swatches (P1, ~3 hours)

Choose **one** primary strategy (recommended: **A + C**):

#### Strategy A — Variant image swatches (recommended)

- [ ] In `main-product.liquid`, for color options, render swatch background from `matched_variant.featured_media`:
  ```liquid
  style="background-image: url('{{ matched_variant.featured_media | image_url: width: 72 }}')"
  ```
- [ ] Add CSS for `background-size: cover` on `.dty-variant-picker__color`
- [ ] Fall back to CSS color map when variant has no image

#### Strategy B — Expand CSS color map

- [ ] Audit all variant color names across catalog (export from Shopify Admin)
- [ ] Add handleized selectors for common names: `graphite`, `silver`, `gold`, `midnight`, `space-gray`, `rose-gold`, `beige`, `cream`, etc.
- [ ] Add Spanish equivalents: `plateado`, `dorado`, `crema`, `beige`, `carbon`, etc.

#### Strategy C — Metafield-driven hex colors

- [ ] Create variant metafield `custom.color_hex` (single line text, e.g. `#1C1917`)
- [ ] Output inline `style="background-color: {{ variant.metafields.custom.color_hex }}"` when present
- [ ] Document metafield setup for merchandising team

#### Strategy D — Disable swatches (if aligned with store policy)

- [ ] If store policy is text-only variants (per checklist), render text buttons for all options instead of color circles
- [ ] Remove `.dty-variant-picker__color` circular styling for color options

#### Token cleanup (same phase)

- [ ] Replace hardcoded `#9A3412`, `#b83c0b` with `color-mix(in srgb, var(--dty-blue) 85%, black)` or a new `--dty-blue-hover` token
- [ ] Fix placeholder gradient: replace `#e2e8f0` with warm stone tone
- [ ] Compute RGB custom properties in `theme.liquid` from settings (Liquid `color_extract` or predefined map)

#### Verify

- [ ] StealthTrack wallet shows visually distinct swatches
- [ ] Selected state (orange ring) visible on all swatch types
- [ ] Light colors (white/cream) have visible border
- [ ] Disabled/unavailable variants still show strikethrough state

**Done when:** No two different colors render with the same swatch fill (unless intentionally identical products).

---

### Phase 3 — Performance Optimizations (P1, ~4 hours)

#### 3.1 Fonts & icons

- [ ] Subset Material Symbols to only icons used in theme (or switch to inline SVG for top 20 icons)
- [ ] Add `font-display: swap` verification for Google Fonts
- [ ] Consider self-hosting WOFF2 files in `/assets` to eliminate Google CDN latency in Chile

#### 3.2 CSS delivery

- [ ] Audit which rules from `dty-catalog.css` are needed on PDP (recommendations only)
- [ ] Option A: Extract recommendation/card rules into a smaller `dty-cards.css`
- [ ] Option B: Inline critical above-the-fold CSS for header + PDP gallery in `theme.liquid`
- [ ] Defer `dty-footer.css` with `media="print" onload` pattern (footer is below fold)

#### 3.3 JavaScript

- [ ] Server-render recommendations in `dty-product-recommendations.liquid` when `recommendations.performed` (remove client fetch fallback or use as enhancement only)
- [ ] Lazy-init product gallery JS only when `[data-product-section]` exists (already gated)
- [ ] Review whether `dty-markets.js` can defer until user interacts with localization selector

#### 3.4 Images

- [ ] Ensure all list/card images use `widths` + `sizes` (audit sections not using `image_tag` helper)
- [ ] Add `decoding="async"` on below-fold images
- [ ] Confirm Shopify CDN serves WebP/AVIF automatically (no theme change needed; verify in Network)

#### 3.5 Third-party

- [ ] Delay GTM load until user interaction or `requestIdleCallback` (optional, measure impact first)
- [ ] After Vitals install (Phase 11), audit `content_for_header` script weight

#### Verify

- [ ] Re-run Lighthouse: target **LCP < 2.5s**, **CLS < 0.1**, **Performance ≥ 75** on PDP (mobile)
- [ ] Total image bytes reduced on collection pages
- [ ] No regression in add-to-cart, variant selection, or cart drawer

**Done when:** Lighthouse Performance score improves ≥10 points vs. Phase 0 baseline on PDP.

---

### Phase 4 — Product Page Layout Polish (P2, ~2 hours)

Only after Phases 1–3 are verified.

- [ ] Adjust `.dty-product-gallery` — remove or raise `max-width: 460px`; let gallery fill its grid column
- [ ] Rebalance grid to `1fr 1fr` or `5fr 4fr` on desktop if gallery still feels small
- [ ] Implement click-to-zoom on main gallery image (CSS transform or lightweight modal)
- [ ] Move price block visually closer to ATC (block reorder in `templates/product.json` if needed)
- [ ] Style share buttons to match brand (icon SVGs instead of "FB / X / WA" text)
- [ ] Confirm warehouse availability block spacing on mobile (tight spacing noted in screenshot)

#### Verify

- [ ] Gallery fills column without excessive whitespace
- [ ] Zoom works on desktop and mobile
- [ ] No horizontal overflow on 375px viewport
- [ ] Conversion elements (price, variant, ATC) visible without scroll on common laptop viewport

**Done when:** PDP visual balance matches brand reference (datansy.com) and passes mobile UX review.

---

### Phase 5 — Catalog & Admin Hygiene (P2, ongoing)

- [ ] Bulk audit: every product has ≥1 image at ≥1000×1000 px
- [ ] Link variant featured media to correct color/SKU
- [ ] Remove broken `<img>` tags from product descriptions
- [ ] Standardize variant naming (capitalized, consistent language — Spanish or English, not mixed)
- [ ] Populate `custom.specifications` metafield for tab content
- [ ] Populate `custom.warehouse_locations` metafield or confirm placeholder behavior is acceptable

**Done when:** `Store_checklist.md` image gallery and variant sections reach ≥80% checked.

---

### Phase 6 — Monitoring & Regression Prevention (P3, ~1 hour)

- [ ] Add `shopify theme check` to CI/pre-deploy script (`scripts/validate-theme.mjs`)
- [ ] Create a smoke-test checklist: 1 PDP, 1 PLP, cart drawer, variant switch
- [ ] Set up Lighthouse CI or monthly manual audit schedule
- [ ] Document image URL rules in theme README for future contributors:
  - **Always use** Liquid `image_url` filter or `?width=` param
  - **Never use** `_120x`, `_800x` filename suffix transforms

**Done when:** Deploy pipeline catches Liquid/JS errors; team has written image URL guidelines.

---

## 5. File Change Reference

| Priority | File | Change summary |
|----------|------|----------------|
| P0 | `assets/dty-product.js` | Fix URL width helper; guard variant image update |
| P0 | `assets/dty-header.js` | Fix cart thumbnail URL |
| P1 | `sections/main-product.liquid` | Real image dimensions; variant image swatches |
| P1 | `assets/dty-product.css` | Swatch styles; gallery sizing |
| P1 | `layout/theme.liquid` | Align preload sizes; RGB token generation |
| P1 | `assets/dty-base.css` | Replace hardcoded colors with tokens |
| P2 | `assets/dty-header.css` | Replace `#b83c0b` with token |
| P2 | `sections/dty-product-recommendations.liquid` | Prefer server-rendered recommendations |
| P2 | `templates/product.json` | Block order tweaks (optional) |

---

## 6. Success Criteria

| Metric | Target |
|--------|--------|
| Broken image requests on PDP | **0** after page load + variant interaction |
| Cart drawer thumbnails | **100%** load correctly |
| Color swatches visually distinct | **100%** of color variants with different colors |
| Lighthouse Performance (mobile PDP) | **≥ 75** (stretch: 85+) |
| LCP | **< 2.5s** |
| CLS | **< 0.1** |
| Store checklist — variant image switch | Checked ✅ |
| Store checklist — HD product photography | In progress via Admin |

---

## 7. Suggested Execution Order for Claude Code

Copy this sequence into your next implementation session:

```
1. Fix dty-product.js shopifyImageAtWidth + buildSrcset + updateVariant guard
2. Fix dty-header.js cart image URL
3. Test PDP + cart drawer manually
4. Implement variant image swatches in main-product.liquid
5. Expand color map + token cleanup in CSS/theme.liquid
6. Fix image width/height + preload sizes mismatch
7. Gallery layout CSS adjustments
8. Font/icon performance pass
9. Recommendations server-render optimization
10. Lighthouse re-test + document results
```

---

## Appendix A — Screenshot Symptom Mapping

| Visible symptom | Likely cause | Fix phase |
|-----------------|--------------|-----------|
| Broken main product image with alt text showing | JS overwrites valid URL with `_800x` suffix on load | Phase 1 |
| Six identical off-white color circles | CSS color map miss → `--dty-gray` fallback | Phase 2 |
| Large empty area in gallery column | `max-width: 460px` + broken image | Phase 1 + 4 |
| Orange selection ring on swatch (only distinct element) | `--dty-blue` primary token works; fill logic does not | Phase 2 |
| Price/styling otherwise coherent | Liquid rendering is fine; JS/CSS gaps are localized | Phases 1–2 |

---

## Appendix B — What Not to Do

- **Do not** rewrite the entire PDP in a new section before fixing the JS URL bug — the bug will persist.
- **Do not** add more CSS color name aliases without variant image fallback — the catalog will always outgrow a static list.
- **Do not** rename `--dty-blue` globally in the first pass — high churn, low immediate value; schedule as a separate refactor.
- **Do not** commit `.env`, API keys, or store credentials during implementation.

---

*Generated from codebase analysis of the Datansy Shopify theme (`datansy_shopify`). No code changes were made in this pass.*
