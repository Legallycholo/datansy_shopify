# Advertising — Diagnosis & Fix List

_Last reviewed: 2026-06-16. Store: datansy.com (CLP, Chile market)._

## TL;DR
Tracking is **not** the problem — the Facebook & Instagram and Google & YouTube
sales channels are both connected, so Meta Pixel/CAPI and GA4 (`G-X84KSKBTW7`)
fire natively through Shopify (in the web-pixel sandbox, not the theme). The real
problem is **conversion + data hygiene**: ~439 sessions over the first ~18 ad days,
**0 real customer orders**, ATC ~1.6%. The only 3 orders are owner test orders.

## Don't double-track
- `G-X84KSKBTW7` is a **GA4 Measurement ID**, already injected by the Google &
  YouTube channel. Do **not** paste it into the theme. Leave the theme's
  "Google Tag Manager ID" (`GTM-…`) field **empty** — you're not using GTM.
- A custom theme dataLayer was prototyped and then **removed** for this reason.
  If you later move to GTM + server-side tagging, re-introduce it deliberately
  with event dedup so it doesn't collide with the native channel events.

## What's actually broken — fix list (priority order)

### 1. You have 0 real orders — confirm the pixels really fire
Channels are connected, but "connected" ≠ "firing correctly." Verify:
- **Meta:** Events Manager → your Pixel → **Test Events** → open datansy.com →
  confirm `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`
  appear with value + currency (CLP). Check "Aggregated Event Measurement" /
  domain verification is done.
- **GA4:** Admin → **DebugView** (or Reports → Realtime) → browse the store →
  confirm `add_to_cart`, `begin_checkout`, `purchase` events arrive.

### 2. Stop polluting your own data
- The 3 orders (#1001–1003) and most of the 380 desktop sessions are **you/your team**.
  This wrecks conversion math AND poisons the ad algorithms' learning.
- **Shopify:** Settings → (Preferences) exclude your own visits / staff.
- **GA4:** Admin → Data Streams → Web stream → Configure tag settings →
  **Define internal traffic** → add your IP; then activate the "Internal Traffic"
  data filter (set it from Testing → Active).
- **Meta:** don't click your own ads; use the FB Pixel Helper for QA instead.

### 3. Diagnose the desktop/mobile mismatch
- 380 desktop vs 57 mobile while running Facebook ads is backwards (FB is mobile-heavy).
- **Meta Ads Manager → Breakdown → by Placement & by Device.** If delivery is
  desktop/Audience-Network heavy or impressions are cheap-but-junk, tighten placements
  to FB/IG feeds + stories/reels and check the audience.

### 4. The real conversion levers (0 sales from 439 sessions)
- **Reviews / social proof on the PDP** — currently placeholder-only
  (`sections/main-product.liquid`), depends on the Vitals app being populated.
  Cold paid traffic converts on proof. Get real reviews live.
- **Message match** — send each ad to the matching product/collection page, not home.
- **Speed** — fonts (DM Sans / Syne / Material Symbols) load render-blocking from
  Google's origin in `layout/theme.liquid` (theme-check: 9 RemoteAsset/AssetPreload
  warnings). Self-host them to improve mobile LCP on ad landing pages.

### 5. Reconnect Google Analytics API access
- The analytics integration returns `invalid_grant` (re-auth needed) so external
  tools can't read GA4. Re-authorize the Google connection.

## Notes
- Pricing is correct (50k–625k CLP). The 899/809 CLP orders were test orders, not a bug.
- Inventory is set to oversell (`inventoryPolicy: CONTINUE`), so out-of-stock items
  are still buyable — not a blocker.
