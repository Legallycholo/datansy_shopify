# Datansy rebrand — Shopify Admin & Meta checklist

Theme code changes remove all `gsm` / GSMPRO identifiers from the repo. Complete these
**manual** steps in Shopify Admin and Meta Business Manager to fix Facebook/catalog
redirects that theme code cannot control.

## Shopify Admin

### Store identity
- [ ] **Settings → Store details:** Store name = `Datansy`
- [ ] **Settings → Domains:** Primary domain = `datansy.com` (no gsmpro domain connected)
- [ ] **Settings → Policies / Online Store → Pages:** Search for “GSMPRO”, “gsmpro” and update copy

### Facebook & Instagram channel
- [ ] **Sales channels → Facebook & Instagram**
  - [ ] Connected Facebook Page = **Datansy** (not GSMPRO.CL / `facebook.com/gsmpro.cl`)
  - [ ] Reconnect channel if tied to the old page
  - [ ] **Product catalog:** every product URL is `https://datansy.com/products/...` (not `gsmpro.com`)
  - [ ] **Meta pixel** (`1731643011583334` on live site): owned by Datansy Business Manager

### Customer events
- [ ] **Settings → Customer events:** Remove any GSMPRO-owned pixels; keep Datansy pixel only

### Contact page
- [ ] **Online Store → Pages → contact-us:** Keep `dariel@tanygrowth.com`; remove GSMPRO branding text if present

## Meta Business Manager

- [ ] **Business Settings → Pages:** Datansy page owns `datansy.com` domain verification
- [ ] **Commerce Manager / Catalog:** Delete or update catalogs that still list `gsmpro.com` product links
- [ ] **[Sharing Debugger](https://developers.facebook.com/tools/debug):** Scrape a datansy.com product URL → preview shows Datansy → click **Scrape Again** to clear cached GSMPRO previews
- [ ] **Ads Manager:** Pause or update ads using `gsmpro.com` URLs or the GSMPRO Facebook page

## After theme deploy

- [ ] Homepage HTML: section IDs use `__dty_faq` (not `__gsm_faq`)
- [ ] Footer “Preguntas Frecuentes” scrolls to `/#datansy-faq`
- [ ] PDP Facebook share URL encodes `datansy.com`
- [ ] Header/footer Facebook icon opens the Datansy page
