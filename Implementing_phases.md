# Datansy Frontend Rebuild — Implementation Phases

> **Purpose:** Step-by-step checklist for rebuilding the datansy.com storefront as a Shopify Online Store 2.0 theme in Cursor, deployable via GitHub.
>
> **Status:** Phases **1–10, 12–13** implemented. Brand assets + store connection verified (2026-06-07). **Next: Phase 14 — push to GitHub & connect Online Store.** Manual browser QA + Admin setup still recommended. Phase 11 (Vitals) is **last**.
>
> **Reference store:** https://datansy.com/
> **Base theme:** Warehouse 6.1.0 (heavily customized)
> **Target repo:** `datansy_shopify`

---

## How to use this document

- Work phases **in order** unless a dependency note says otherwise.
- Check each box `[x]` only when the step is fully done and verified.
- Do **not** skip Phase 0 (prerequisites) — missing admin access or theme source will block accurate rebuild.
- Prefer **native Shopify sections** over Custom Liquid blobs or page-builder dependencies.
- Replace Tailwind CDN with compiled assets in `/assets` before final deploy.

### Agent handoff (where to resume)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 | **Mostly done** | Store `sn2n1j-6w.myshopify.com`, CLI + brand assets verified; Admin Markets/currency pending |
| 1–9 | **Done** | Theme scaffold through cart, pages, blog, 404, customer login/register/account |
| 10 | **Theme done** | Admin Markets + currency format still manual |
| 12 | **Done** | Performance, a11y, SEO (theme-side); Lighthouse pending |
| 13 | **Automated done** | Manual QA + checkout smoke test on dev store |
| **14** | **In progress** | GitHub connected; publish + QA pending |
| **11** | **Last** | Vitals app + GTM/GSC/FB (after site is live) |
| 15 | Optional | Post-launch enhancements |

**Phase 9 deliverables:** `assets/gsm-pages.css`, `assets/gsm-cart-page.js`, `sections/main-cart.liquid`, `main-page.liquid`, `gsm-page-cotizacion.liquid`, `gsm-page-rastreo.liquid`, `main-blog.liquid`, `main-article.liquid`, `main-404.liquid`, `main-login.liquid`, `main-register.liquid`, `main-account.liquid`, templates `page.cotizacion.json`, `page.rastreo.json`, `404.json` (category blocks), `blog.json`, `customers/*.json`.

**Verify on dev store:** assign `page.cotizacion` / `page.rastreo` templates; create `/blogs/noticias`; enable Markets in Admin; set currency format to `${{amount_no_decimals}}`; create discount **`BIENVENIDO10`** in Admin; run `shopify theme check`.

**Brand assets (saved — no re-upload needed):** `assets/datansy-favicon-white.png`, `datansy-favicon-black.png`, `datansy-logo-white.png`, `datansy-logo-black.png`. Wired in `header.liquid` + `theme.liquid`.

**Store verified (public API):** Datansy · datansy.com · CLP · 7 products · collections `coleccion-principal`, `frontpage` · dev theme `#147124748348`.

**Phase 12 deliverables:** `snippets/gsm-social-meta.liquid`, `snippets/gsm-jsonld.liquid`, `snippets/gsm-gtm-head.liquid`, `snippets/gsm-gtm-body.liquid`, theme settings for GTM/GSC/FB verification, font preload, PDP LCP preload, FAQ `hidden`/ARIA, slider keyboard nav.

**Phase 13 deliverables:** Cart `/cart/add.js` + `/cart/change.js` fixes, `scripts/validate-theme.mjs`, customer reset/activate templates.

**Execution order (website first, Vitals last):** 12 → 13 → 14 → **11** → 15

---

## Phase 0 — Prerequisites & decisions

> **Gate:** Do not write theme code until every item in this phase is resolved.

### Access & source of truth
- [x] Confirm Shopify Admin access to target store **`sn2n1j-6w.myshopify.com`** (Datansy / datansy.com)
- [x] Confirm rebuild target: **Datansy-inspired variant** (not exact datansy.com clone)
- [x] Warehouse theme license — N/A (custom OS 2.0 theme built from scratch)
- [x] Theme source: built in repo (no Warehouse pull required)
- [x] Dev theme ID documented: **`#147124748348`** (Development); live theme: Refresh `#147095060540`

### Tooling setup (local)
- [x] Install / verify Shopify CLI (`shopify version`)
- [x] Authenticate CLI to target store (`shopify theme list` works)
- [x] Install Theme Check (`shopify theme check` — zero errors)
- [x] Confirm Node.js available (`node scripts/validate-theme.mjs`)
- [x] Create `.gitignore` (exclude `.env`, `.shopify`, `node_modules`)

### Scope decisions (record answers in this file or a comment)
- [x] **Markets:** Chile first at launch; international expansion later (CL, AR, PE, CO, MX, US long-term)
- [x] **Apps:** **Vitals** replaces legacy multi-app stack (Phase 11 — last). Google GTM/GSC/FB separate.
- [x] **Collection pages:** Native Datansy grid + facets (no legacy page-builder app blocks)
- [x] **Page builders:** Remove Beae / PageFly dependency (recommended: yes)
- [x] **Languages:** Spanish only for now
- [x] **Brand / domain:** **Datansy.com** on store `sn2n1j-6w.myshopify.com`; Datansy-inspired design
- [x] **Brand assets** saved in `assets/datansy-*.png` (logo + favicon, white/black variants)

---

## Phase 1 — Theme scaffold & repository structure

> **Goal:** Valid OS 2.0 theme skeleton that Shopify accepts from GitHub.

### 1.1 Initialize theme files
- [x] Create required top-level folders: `layout/`, `templates/`, `sections/`, `snippets/`, `assets/`, `config/`, `locales/`
- [x] Add `layout/theme.liquid` (base HTML shell, `content_for_header`, `content_for_layout`)
- [x] Add `config/settings_schema.json` (minimal valid schema)
- [x] Add `config/settings_data.json` (default settings matching Datansy colors)
- [x] Add `locales/es.default.json` (Spanish strings)
- [x] Verify theme passes `shopify theme check` with zero errors (warnings documented — 4 RemoteAsset font warnings)

### 1.2 GitHub readiness
- [ ] **Initial commit + push** to `https://github.com/Legallycholo/datansy_shopify.git` (repo exists; no commits yet)
- [x] Deploy method documented: **GitHub integration** (recommended) or `shopify theme push`
- [x] Development theme on store (unpublished): `#147124748348`

### 1.3 Development workflow
- [x] Run local dev preview: `shopify theme dev` → http://127.0.0.1:9292
- [x] Hot reload on section edits (CLI dev server)
- [x] Preview URL: dev theme on `sn2n1j-6w.myshopify.com` + local proxy

---

## Phase 2 — Design system & global assets

> **Goal:** Single source of truth for colors, typography, spacing — no Tailwind CDN in production.

### 2.1 CSS variables & tokens
- [x] Define Datansy color tokens in `:root`:
  - `--gsm-dark: #00003A`
  - `--gsm-blue: #0389FC`
  - `--gsm-indigo: #413AF4`
  - `--gsm-yellow: #EDFF00`
  - `--gsm-gray: #F5F7FA`
  - Warehouse accent overrides (`#0389FC`, header `#00003A`, sale red `#EE0000`)
- [x] Define typography stack:
  - Display: Space Grotesk
  - Body/shell: Barlow
  - Icons: Material Symbols Outlined (self-hosted or subset)
- [x] Define shadow tokens (`gsm`, `gsm-card`, `gsm-hover`)
- [x] Define border-radius scale (`rounded-2xl` equivalent)
- [x] Define responsive breakpoints (mobile / tablet / desktop)

### 2.2 Asset files
- [x] Create `assets/gsm-base.css` (design tokens + utility classes used across sections)
- [x] Create `assets/gsm-home.css` (homepage-specific styles)
- [x] Create `assets/gsm-home.js` (hero rotation, FAQ accordion, coupon copy)
- [x] Create `assets/bodegas.css` (warehouse/inventory UI — port from live site)
- [x] Load fonts via `link` tags or `@font-face` in theme (no render-blocking chains)
- [x] **Do not** use `cdn.tailwindcss.com` in production theme

### 2.3 Theme settings (admin-editable)
- [x] Add color pickers in `settings_schema.json` for primary/secondary/accent
- [x] Add font selectors (or fixed font declaration with note)
- [x] Add global settings: free-shipping threshold ($50.000 CLP), coupon code default
- [x] Wire settings to CSS variables in `theme.liquid`

---

## Phase 3 — Header & navigation

> **Goal:** Match Warehouse inline header — logo, mega menu, search, markets, account, cart.

### 3.1 Header section (`sections/header.liquid`)
- [x] Navy background `#00003A`, white text, inline layout
- [x] Centered logo linking to `/`
- [x] Desktop mega menu (hover trigger) with full category tree:
  - Nuevos Lanzamientos, Más Vendidos
  - Celulares (iPhone, Pixel, Samsung, Xiaomi, Vivo, Otras Marcas, Accesorios)
  - Consolas, Realidad Virtual, Computación, Audio, Reacondicionados
  - Más Tecnología, Cotización, Rastrea tu Pedido
- [x] Search bar (~600px desktop) with category filter dropdown ("Todas las categorias")
- [x] Predictive search integration (Shopify native)
- [x] Markets / currency selector (`/localization` form)
- [x] Account link (`/account/login`)
- [x] Cart icon with live item count

### 3.2 Mobile navigation
- [x] Hamburger toggle → slide-out panel menu
- [x] Multi-level drill-down panels (3 deep: e.g. Celulares → iPhone → iPhone 16)
- [x] Help block: phone, email, social links
- [x] Sticky sub-panel headers on scroll

### 3.3 Header group & JSON template
- [x] Register header in `sections/header-group.json` (or template header group)
- [x] Add inline CSS overrides if needed (search bar width, header height 70px)
- [x] Test sticky header setting (live site: `useStickyHeader: false` — confirm desired behavior)

### 3.4 Mini cart
- [x] Cart drawer or message-type cart (`cartType: "message"` on reference site)
- [x] Free-shipping progress message: "Gasta $X más y obtén envío gratis"
- [x] Empty cart state with CTA

---

## Phase 4 — Footer

> **Goal:** Match footer columns, contact info, payments, localization.

### 4.1 Footer section (`sections/footer.liquid`)
- [x] Column 1 — Nosotros: Quienes Somos, Referidos, Venta a Empresas, Blog, Contacto
- [x] Column 2 — Menú 2026: mirror main nav links
- [x] Contact block:
  - WhatsApp Chile: +56 9 9136 9127
  - International: +1 754 200 9891
  - Call center: +56 2 2938 1889
  - Email: contacto@datansy.com
  - Hours: Lun–Vie 7:00–23:00, Sab–Dom 9:00–22:00
- [x] Country/region selector (duplicate of header)
- [x] Payment icons row (Visa, MC, Amex, PayPal, Apple Pay, etc.)
- [x] Copyright + reCAPTCHA notice
- [x] Social icons: Facebook, Twitter, Instagram, YouTube, TikTok, LinkedIn

### 4.2 Footer group
- [x] Register in footer section group
- [x] Collapsible footer blocks on mobile (Warehouse pattern)

---

## Phase 5 — Homepage marketing sections

> **Goal:** Recreate the ~108KB Custom Liquid block as native, editable sections.
> **Source reference:** `custom_liquid_eAcPLF` on live homepage.

### 5.1 Hero — `sections/gsm-hero.liquid`
- [x] Badge pill: "Tecnología Premium"
- [x] Animated headline (3-line rotation via `sloganSets` JS):
  - "Tecnología Premium / Al Precio Que / Debería Ser"
  - "Innovación Total / Sin Fronteras / Ni Esperas"
  - "Las Mejores Marcas / Garantía Oficial / En Chile"
  - (+ any additional sets from live source)
- [x] Subtext: "Envíos Gratis a todo Chile. Garantía Datansy Oficial"
- [x] CTA buttons: "Ver Catálogo", "Ofertas Flash"
- [x] Trust row: 5 stars + "+5,000 clientes felices"
- [x] Decorative circle / gradient background elements
- [x] Section schema: editable headlines, CTA URLs, badge text

### 5.2 Brand marquee — `sections/gsm-brand-marquee.liquid`
- [x] Section label: "Marcas Oficiales"
- [x] Heading: "Solo las Mejores Marcas"
- [x] Two auto-scrolling logo rows (opposite directions)
- [x] Brands: Google, Apple, Samsung, Motorola, Vivo, ZTE, Red Magic, CAT, Valve, Sony, Xbox, Amazon, Meta, Ray-Ban, Oakley, DJI, Hollyland, Asus ROG, Dell, HP
- [x] Logo blocks editable via section blocks (image + link)
- [x] Pause on hover, gradient edge masks

### 5.3 Regional coverage — `sections/gsm-regions.liquid`
- [x] Label: "Cobertura Regional"
- [x] Heading: "Operamos en 6 Países"
- [x] Country cards: Chile, Argentina, Perú, Colombia, México, Estados Unidos
- [x] Flag images + country names
- [x] Optional link to market-specific URLs

### 5.4 Sourcing hubs — `sections/gsm-sourcing-hubs.liquid`
- [x] Label: "Sourcing Internacional"
- [x] Heading: "Los Mejores Precios Del Mundo"
- [x] Stat badge: "5+ Hubs de Abastecimiento"
- [x] Hub cards: Dubai, Singapur, Hong Kong, Estados Unidos, China (Shenzhen)
- [x] Icon + title + subtitle per hub
- [x] Blocks editable in theme editor

### 5.5 Category grid — `sections/gsm-category-grid.liquid`
- [x] Label: "Categorías Elite"
- [x] Heading + "Ver catálogo completo" link
- [x] 6 category tiles with icons:
  - Celulares, Audio, Computación, Wearables, Consolas, Fotografía
- [x] Each tile links to collection URL
- [x] Hover lift + border glow effect

### 5.6 VIP presales — `sections/gsm-presales.liquid`
- [x] Label: "Preventas VIP"
- [x] Heading: "El Futuro Llega Primero Aquí."
- [x] 3 benefit cards: Precio Especial, Prioridad Total, Stock Asegurado
- [x] Product teaser cards with status badges:
  - CONFIRMADO, PRÓXIMAMENTE, RUMOR, ESPERA, PROTOTIPO
- [x] Examples: S26 Ultra, Steam Deck Machine, Poco F8, Pixel 10a, RTX 5090, iPad Pro M5
- [x] CTA: "Ver Colección Preventa"
- [x] Blocks: image, title, status, link per item

### 5.7 Testimonials — `sections/gsm-testimonials.liquid`
- [x] Heading: "Experiencia Datansy"
- [x] Subheading: "Lo que dicen nuestros clientes de Arica a Punta Arenas."
- [x] Infinite horizontal scroll of review cards
- [x] Each card: name, "Compra Verificada" badge, product name, quote, 5 stars
- [x] Sample reviews from live site (minimum 12, duplicated for seamless loop)
- [x] Blocks editable: name, product, quote, rating

### 5.8 FAQ — `sections/gsm-faq.liquid`
- [x] Label: "Preguntas Frecuentes" / "Transparencia Total"
- [x] Accordion items (5 from live site):
  1. ¿Los productos tienen garantía?
  2. ¿Cuáles son los medios de pago?
  3. ¿Hacen envíos a regiones?
  4. ¿Tienen tienda física?
  5. ¿Debo preocuparme por el "Aduanazo"?
- [x] Numbered 01–05, expand/collapse animation
- [x] JS accordion in `gsm-home.js`
- [x] Blocks: question + answer pairs

### 5.9 Coupon / newsletter CTA — `sections/gsm-coupon-cta.liquid`
- [x] Heading: "Tecnología a tu Alcance"
- [x] Subtext: "Únete a nuestra comunidad."
- [x] Coupon display: **`BIENVENIDO10`** (admin-editable; create matching discount in Shopify Admin)
- [x] "Canjear" button with copy-to-clipboard JS
- [x] Urgency text: "Oferta válida solo por hoy"
- [x] Optional Shopify customer form integration (email capture)

### 5.10 Homepage template assembly — `templates/index.json`
- [x] Sections 1–10 + 16 wired (header/footer via section groups; marketing sections in `index.json`):
  1. Header (group) ✓
  2. gsm-hero ✓
  3. gsm-brand-marquee ✓
  4. gsm-regions ✓
  5. gsm-sourcing-hubs ✓
  6. gsm-category-grid ✓
  7. gsm-presales ✓
  8. gsm-testimonials ✓
  9. gsm-faq ✓
  10. gsm-coupon-cta ✓
  11. Product sliders — **Phase 6** ✓
  12. Slideshow — **Phase 6** ✓ (`gsm-promo-banner`)
  13. Featured collection — **Phase 6** ✓ (`gsm-featured-collections`)
  14. Recently viewed — deferred (localStorage; optional post-launch)
  15. Blog posts — **Phase 6** ✓ (`gsm-blog-strip`)
  16. Footer (group) ✓
- [x] Preview homepage in dev theme — real products from `coleccion-principal`; compare styling vs datansy.com (optional)

---

## Phase 6 — Homepage product sliders

> **Goal:** Replace app-generated sliders (~228KB block) with native reusable section.
> **Source reference:** section `1748974714ed98b36b` on live homepage.

### 6.1 Reusable slider section — `sections/gsm-product-slider.liquid`
- [x] Schema inputs: heading, collection handle, "Ver más" link, products to show (limit)
- [x] Horizontal scroll carousel (native scroll-snap; no Flickity dependency)
- [x] Prev / next navigation arrows
- [x] Product card component (see 6.2)

### 6.2 Product card snippet — `snippets/gsm-product-card.liquid`
- [x] Product image (lazy loaded, responsive srcset)
- [x] Vendor name
- [x] "Desde $X" price (handle variant price ranges)
- [x] Compare-at price (strikethrough)
- [x] "Ahorra $X" savings badge
- [x] Product title
- [x] Reviews placeholder (Vitals reviews in Phase 11)
- [x] "Añadir al carrito" quick-add OR "Ver producto" link
- [x] Match card hover effects from live site

### 6.3 Configure slider instances in `templates/index.json`
- [x] Slider 1: **Entrega inmediata** → `/collections/ofertas-entrega-express`
- [x] Slider 2: **Google Pixel** → Google Pixel collection
- [x] Slider 3: **iPhone** → iPhone collection
- [x] Slider 4: **Realidad Virtual** → VR collection
- [x] Slider 5: **Estrenos imperdibles** → new releases collection
- [x] Slider 6: **Drones** → drones collection
- [x] Slider 7: **!BLACK SALE!** → sale collection
- [x] Verify each slider pulls live products from store catalog (`coleccion-principal` on dev store)

### 6.4 Optional promo sections
- [x] Slideshow section (`slideshow_BBntKH` equivalent) — promo banner (`gsm-promo-banner.liquid`)
- [x] "Unidades Limitadas" collection list section (`gsm-featured-collections.liquid`)
- [x] BLACK SALE full-width CTA banner (if not covered by slider)
- [x] Blog strip section (`gsm-blog-strip.liquid`) for homepage item 15

---

## Phase 7 — Product detail page (PDP)

> **Goal:** Warehouse product template with Datansy customizations.

### 7.1 Product template — `templates/product.json`
- [x] Section: `main-product` (Warehouse base)
- [x] Section: product recommendations
- [x] Optional: custom liquid blocks for trust badges

### 7.2 Product gallery
- [x] Main carousel with zoom
- [x] Thumbnail strip below / beside
- [x] Support multiple images per variant (featured media switching)
- [x] Lazy load non-primary images

### 7.3 Product info blocks
- [x] Title (H1)
- [x] Vendor link → `/collections/vendors?q=VendorName`
- [x] Review stars placeholder (Vitals module in Phase 11)
- [x] Price: regular, sale, "Desde" for ranges
- [x] Savings label: "Ahorrar {{savings}}"
- [x] Variant pickers: block swatches (color) + block swatches (storage)
- [x] Quantity selector
- [x] Add to cart button
- [x] Dynamic checkout buttons (Shop Pay, etc.)
- [x] Share buttons
- [x] SKU display (conditional)

### 7.4 Warehouse inventory — `snippets/gsm-warehouse-availability.liquid`
- [x] Port `bodegas.css` styles
- [x] Santiago express availability (green)
- [x] Other warehouse locations with timing
- [x] Store name + quantity display
- [ ] Metafield or inventory app integration (confirm data source in admin) — reads `product.metafields.custom.warehouse_locations` when set

### 7.5 Product tabs / content
- [x] Description
- [x] Specifications (if metafields exist)
- [x] Shipping & returns info
- [ ] Estimated delivery app block (Phase 9 — optional)

### 7.6 Sticky add-to-cart (mobile)
- [x] Sticky product bar on scroll (native; evaluate vs Vitals sticky cart in Phase 11)
- [x] Price + ATC visible on mobile viewport

---

## Phase 8 — Collection & catalog pages

> **Goal:** Product listing pages with filters, sort, pagination.

### 8.1 Collection template — `templates/collection.json`
- [x] Decide: standard Warehouse grid **vs** custom layout (live site uses app block) — **using native Datansy grid + facets**
- [x] Collection banner / title
- [x] Product count
- [x] Sort dropdown (price, best selling, newest)
- [x] Filter sidebar or drawer (facets — Shopify Search & Discovery)
- [x] Product grid: 2 col mobile, 3–4 col desktop
- [x] Pagination or infinite scroll
- [x] Reuse `gsm-product-card` snippet OR Warehouse `product-item` snippet

### 8.2 Collection list template — `templates/list-collections.json`
- [x] Grid of all collections (if needed)

### 8.3 Search results — `templates/search.json`
- [x] Search bar results page
- [x] Product + article results
- [x] Match header search behavior

---

## Phase 9 — Additional page templates

> **Status:** Implemented 2026-06-07.

### 9.1 Cart — `templates/cart.json`
- [x] Line items with image, title, variant, price, quantity
- [x] Free shipping threshold bar
- [x] Discount code field
- [x] Checkout CTA
- [x] Empty cart state

### 9.2 Static pages — `templates/page.json`
- [x] Generic page layout for:
  - `/pages/sobre-nosotros`
  - `/pages/cotizaciones`
  - `/pages/rastrea-tu-pedido`
  - `/pages/contact`
  - `/pages/club-propartner`
- [x] Optional custom templates: `page.cotizacion.json`, `page.rastreo.json`

### 9.3 Blog — `templates/blog.json` + `templates/article.json`
- [x] Blog listing: "Datansy News - Tecnología y Noticias"
- [x] Article template with date, author, featured image
- [x] Homepage blog strip pulls from `/blogs/noticias` (section exists — confirm blog handle on live store)

### 9.4 Customer account pages
- [x] Login / register (Shopify default — verify branding)
- [x] Account dashboard styling pass (low priority)

### 9.5 404 page — `templates/404.json`
- [x] Branded not-found page with search + category links

---

## Phase 10 — Markets, localization & currency

> **Reference:** Live site supports CL, AR, BR, CO, US, MX, PE.
> **Status:** Theme-side implemented 2026-06-07. Admin Markets setup requires store access.

- [x] Wire header/footer/mobile localization forms (`/localization`) — unique form IDs, auto-submit on change
- [x] Confirm currency display format: `${{amount_no_decimals}}` via `gsm-money` snippet + admin note in theme settings
- [x] hreflang alternates — `gsm-hreflang.liquid` (Shopify `country.root_url` + fallback market URL settings)
- [x] Homepage region cards switch market via ISO codes + `gsm-markets.js`
- [x] Spanish (`es`) as default locale in `locales/es.default.json`
- [x] Translate remaining hardcoded English in titles/filters (page meta, Min/Max filters)
- [ ] **Admin:** Enable Shopify Markets in admin (if not already)
- [ ] **Admin:** Configure market domains / root URLs for hreflang
- [ ] **Verify:** Country switcher updates prices on dev store
- [ ] **Verify:** Set Admin → currency format to `${{amount_no_decimals}}` (CLP)

---

## Phase 12 — Performance, accessibility & SEO

> **Status:** Theme-side implemented 2026-06-07. Lighthouse audit pending dev store.

### 12.1 Performance
- [x] No Tailwind CDN in production
- [x] Lazy load non-critical images (product cards, blog, thumbs; PDP main image eager + preload)
- [x] Defer non-critical JS (`defer` on all theme scripts)
- [ ] Minify custom CSS/JS before production deploy (build step optional)
- [x] Preload fonts (async stylesheet load) and PDP LCP image (`fetchpriority="high"`)
- [ ] Audit with Lighthouse (target: 70+ mobile performance minimum)

### 12.2 Accessibility
- [x] Global `:focus-visible` outline in `gsm-base.css`
- [x] Skip-to-content link
- [x] FAQ accordion: `aria-expanded`, `aria-controls`, `hidden` on answers
- [x] Slider nav: `aria-label` on prev/next; keyboard ArrowLeft/ArrowRight on track
- [ ] Color contrast check on navy header + blue buttons (manual verify)
- [x] Alt text pattern on product images; brand placeholders use vendor/name where applicable

### 12.3 SEO
- [x] `title` and `meta description` via Shopify + theme title tags
- [x] Canonical URLs + hreflang (Phase 10)
- [x] Open Graph + Twitter Card meta (`gsm-social-meta.liquid`)
- [x] JSON-LD: Organization, WebSite, BreadcrumbList, Product (`gsm-jsonld.liquid`)
- [x] GTM + GSC + Facebook verification hooks in theme settings
- [ ] Sitemap (Shopify native — verify in Admin after deploy)

---

## Phase 13 — QA & cross-browser testing

> **Status:** Automated checks passed 2026-06-07. Cart AJAX fixes applied. Manual store QA still required before go-live.

### 13.1 Functional testing
- [x] Add to cart from homepage sliders — JSON `/cart/add.js` + drawer refresh (code verified)
- [x] Add to cart from PDP — AJAX add + drawer open (code verified)
- [x] Cart quantity update / remove — cart page uses `/cart/change.js` (no full reload)
- [ ] Checkout flow completes (test mode) — **verify on dev store**
- [ ] Search returns relevant products — **verify on dev store**
- [x] Mega menu: collection links point to live handles (`coleccion-principal`, `frontpage`) until catalog expands
- [x] Mobile menu: drill-down panels + Escape to close (code verified)
- [ ] Country/currency switcher works — **verify Markets enabled**
- [x] Coupon copy button — `data-coupon-copy` + clipboard API (code verified)
- [x] FAQ accordion opens one at a time — `aria-expanded` + `hidden` (code verified)
- [x] Hero slogan rotation cycles — 4s interval (code verified)

### 13.2 Visual regression
- [ ] Homepage vs datansy.com — desktop (1440px) — **manual**
- [ ] Homepage vs datansy.com — tablet (768px) — **manual**
- [ ] Homepage vs datansy.com — mobile (375px) — **manual**
- [ ] PDP layout check — **manual**
- [ ] Collection page layout check — **manual**
- [ ] Footer on all page types — **manual**

### 13.3 Browser matrix
- [ ] Chrome (desktop + mobile) — **manual**
- [ ] Safari (desktop + iOS) — **manual**
- [ ] Firefox — **manual**
- [ ] Edge — **manual**

### 13.4 Theme Check & Shopify validation
- [x] `shopify theme check` — zero errors (9 font/preload warnings documented)
- [x] `node scripts/validate-theme.mjs` — templates, schemas, section groups
- [x] No deprecated `{% include %}` tags
- [x] All sections have valid `{% schema %}` JSON
- [x] All template JSON files reference existing sections
- [x] Customer templates: login, register, account, reset_password, activate_account

### 13.5 QA tooling
- [x] `scripts/validate-theme.mjs` — run before deploy: `node scripts/validate-theme.mjs`
- [ ] `shopify theme dev` — smoke test all templates on dev store
- [ ] Bogus Gateway checkout test — Admin → Settings → Payments

---

## Phase 14 — GitHub & Shopify deployment

> **Ready for GitHub import:** Theme code is complete (Phases 1–13). **Blocker:** initial commit + push to GitHub. After push, connect repo in Admin immediately.

### 14.1 Repository
- [ ] Initial commit of full theme (all files in repo)
- [ ] Push to GitHub remote: `https://github.com/Legallycholo/datansy_shopify.git`
- [ ] Branch strategy: `main` = production theme, optional `develop` = staging
- [ ] README with setup instructions (optional — only if requested)

### 14.2 Shopify connection (GitHub import)
- [x] Admin → **Online Store → Themes → Connect from GitHub**
- [x] Repo **`Legallycholo/datansy_shopify`** connected (unpublished)
- [ ] Test auto-sync: push a change → confirm theme updates in Admin
- [ ] Alternative (no GitHub): `shopify theme push --unpublished` from CLI

### 14.3 Go-live checklist
- [ ] Create discount code **`BIENVENIDO10`** in Admin (Discounts) — theme only displays/copies it
- [ ] Admin: CLP currency format `${{amount_no_decimals}}`; product images; blog `noticias`
- [ ] Full QA pass on GitHub-connected dev theme
- [ ] Stakeholder sign-off on homepage + PDP + collection
- [ ] **Publish** theme (replace live Refresh when ready)
- [ ] Smoke test datansy.com post-publish
- [ ] Monitor checkout for 24h (Bogus Gateway test first)
- [ ] Rollback plan: keep Refresh theme unpublished as backup

---

---

## Phase 11 — Vitals + analytics (LAST — after website build)

> **Decision:** Use **Vitals** as the single Shopify app for conversion/marketing features.
> Replaces legacy datansy.com stack (Yotpo, Crisp, Qikify, Autoketing, etc.).
> **Do not install** separate apps for reviews, upsells, sticky cart, trust badges, pop-ups, etc.
>
> **Outside Vitals (already in theme or Admin):** Google Tag Manager, Google Analytics, Google Search Console, Facebook domain verification.
> **Deferred:** Live chat via Google AI Studio — not required for theme launch.
>
> **When:** Run this phase **after** Phases 12–14 (QA + deploy). Website must be built and stable first.

### 11.0 Vitals setup (admin)
- [ ] Install Vitals on store
- [ ] Enable only modules needed for launch (disable duplicates of native theme features)
- [ ] Document which Vitals modules are ON vs deferred
- [ ] Confirm Vitals app embeds appear in Theme Editor

### 11.1 Reviews & social proof → **Vitals**
- [ ] Enable Vitals **Product Reviews** (replaces Yotpo)
- [ ] Import existing reviews if migrating (CSV / other app)
- [ ] Replace theme review placeholders on PDP + product cards when live

### 11.2 Marketing & urgency → **Vitals**
- [ ] Vitals **Pop-ups** — post-launch if needed
- [ ] Vitals **Countdown timer** — flash sales
- [ ] Vitals **Announcement bar** — optional
- [ ] Vitals **Cart abandonment email** — post-launch

### 11.3 Cart & checkout → **Vitals** (evaluate vs native theme)
- [ ] **Decision:** Vitals Cart Drawer **or** native `gsm-cart-drawer` (not both)
- [ ] **Decision:** Vitals Sticky Add to Cart **or** native PDP sticky bar (not both)
- [ ] Vitals **Volume discounts / BOGO / bundles**
- [ ] Vitals **Free shipping bar** — vs native threshold bar

### 11.4 Product enhancements → **Vitals**
- [ ] Vitals **Related products** / **Recently viewed**
- [ ] Vitals **Back in stock** alerts
- [ ] Vitals **Shipping estimates** on PDP
- [ ] Remove legacy app references (Customizery, EasyLocation) unless confirmed required

### 11.5 Support & trust
- [ ] ~~Crisp~~ — not used; chat via Google AI Studio (deferred)
- [ ] Vitals trust badges if not covered by theme footer
- [ ] Cotización / contact forms remain **native theme sections**

### 11.6 Analytics (not Vitals — theme settings)
- [ ] Enter **GTM container ID** in theme settings (snippet already in theme)
- [ ] Enter **Google Search Console** verification meta content
- [ ] Enter **Facebook domain verification** meta content
- [ ] Confirm GA4 fires via GTM

### 11.7 Page builders — **remove from theme**
- [ ] Remove Beae dependency from theme templates
- [ ] Remove PageFly dependency from theme templates
- [ ] Migrate PageFly-only pages to native sections

### 11.8 Native vs Vitals conflict matrix

| Feature | Theme (native) | Vitals module | Launch choice |
|---------|----------------|---------------|---------------|
| Cart drawer | `gsm-cart-drawer` | Cart drawer | TBD |
| Sticky ATC | `main-product` sticky bar | Sticky add to cart | TBD |
| Reviews | Placeholder stars | Product reviews | **Vitals** |
| Free shipping bar | Header + cart | Shipping bar | TBD |
| Upsells/bundles | — | Bundles / BOGO | **Vitals** |
| Live chat | — | Google AI Studio | **Deferred** |

---

## Phase 15 — Post-launch (optional enhancements)

- [ ] Swym wishlist integration
- [ ] Doran shoppable videos
- [ ] CustomerHub enhancements
- [ ] SMS / email marketing integrations
- [ ] A/B test hero slogans
- [ ] Admin documentation for editing each custom section

---

## File manifest (expected deliverables)

| File | Phase |
|---|---|
| `assets/datansy-favicon-white.png` | 0 |
| `assets/datansy-favicon-black.png` | 0 |
| `assets/datansy-logo-white.png` | 0 |
| `assets/datansy-logo-black.png` | 0 |
| `layout/theme.liquid` | 1 |
| `config/settings_schema.json` | 1, 2 |
| `config/settings_data.json` | 1, 2 |
| `locales/es.default.json` | 1 |
| `assets/gsm-base.css` | 2 |
| `assets/gsm-home.css` | 2 |
| `assets/gsm-home.js` | 2, 5 |
| `assets/bodegas.css` | 2, 7 |
| `sections/header.liquid` | 3 |
| `sections/footer.liquid` | 4 |
| `sections/gsm-hero.liquid` | 5 |
| `sections/gsm-brand-marquee.liquid` | 5 |
| `sections/gsm-regions.liquid` | 5 |
| `sections/gsm-sourcing-hubs.liquid` | 5 |
| `sections/gsm-category-grid.liquid` | 5 |
| `sections/gsm-presales.liquid` | 5 |
| `sections/gsm-testimonials.liquid` | 5 |
| `sections/gsm-faq.liquid` | 5 |
| `sections/gsm-coupon-cta.liquid` | 5 |
| `sections/gsm-product-slider.liquid` | 6 |
| `snippets/gsm-product-card.liquid` | 6 |
| `snippets/gsm-warehouse-availability.liquid` | 7 |
| `templates/index.json` | 5, 6 |
| `templates/product.json` | 7 |
| `templates/collection.json` | 8 |
| `templates/cart.json` | 9 |
| `templates/page.json` | 9 |
| `templates/blog.json` | 9 |
| `templates/article.json` | 9 |
| `templates/search.json` | 8 |
| `templates/404.json` | 9 |
| `snippets/gsm-social-meta.liquid` | 12 |
| `snippets/gsm-jsonld.liquid` | 12 |
| `snippets/gsm-gtm-head.liquid` | 12 |
| `snippets/gsm-gtm-body.liquid` | 12 |
| `scripts/validate-theme.mjs` | 13 |
| `templates/customers/reset_password.json` | 13 |
| `templates/customers/activate_account.json` | 13 |

---

## Open questions (resolve in Phase 0)

1. ~~Exact clone vs Datansy-inspired redesign?~~ → **Datansy-inspired**
2. ~~Shopify Admin access — yes or no?~~ → **Yes** (`sn2n1j-6w.myshopify.com`)
3. Warehouse license — owned or use Dawn/free base? (N/A — custom theme built)
4. ~~Chile-only launch or all 6 markets?~~ → **Chile first**, international later
5. ~~Which apps for launch?~~ → **Vitals last (Phase 11); GTM/GSC/FB in theme settings**
6. ~~Collection page: standard grid or custom layout?~~ → **Native grid**
7. ~~Production domain?~~ → **datansy.com**

---

## Implementation order summary

```
Phase 0  → Prerequisites & decisions
Phase 1  → Theme scaffold
Phase 2  → Design system
Phase 3  → Header
Phase 4  → Footer
Phase 5  → Homepage marketing sections (9 sections)
Phase 6  → Product sliders (7 instances)
Phase 7  → Product page
Phase 8  → Collection pages
Phase 9  → Cart, pages, blog, 404 ✅
Phase 10 → Markets & localization ✅
Phase 12 → Performance, a11y, SEO ✅
Phase 13 → QA (automated) ✅
Phase 14 → GitHub & deploy ← **NEXT**
Phase 11 → Vitals + analytics ← **LAST (after site live)**
Phase 15 → Post-launch enhancements (optional)
```

---

## Remaining work (summary)

| Area | What’s left |
|------|-------------|
| **Phase 14** | Git commit + push → Connect GitHub in Shopify Admin → QA → publish |
| **Admin** | Discount `BIENVENIDO10`, CLP `${{amount_no_decimals}}`, product images, collections, blog `noticias`, page templates |
| **Phase 13 (manual)** | Checkout test, visual QA, browser matrix, Lighthouse |
| **Branding copy** | Done — all user-facing copy uses Datansy |
| **Phase 11** | Vitals + GTM/GSC/FB — **after go-live** |
| **Phase 15** | Optional post-launch features |

---

*Last updated: 2026-06-07*
*Phases 1–10, 12–13 implemented. Datansy branding applied. GitHub connected (unpublished). Coupon: BIENVENIDO10. Next: QA → publish → Vitals.*
