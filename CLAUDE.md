# Jungle Gem Plant Co. — Website

## What this is

A class project (Team 3) building the online storefront for **Jungle Gem Plant Co.**, a real local plant shop that currently only sells in person. This repo is the website piece of that project — not the full system (shipping, inventory sync, etc.), just the customer-facing site, built incrementally from here.

Budget reality: this is a student team project with a 40–60 hour/person total budget for the *entire* project, not just the site. Favor simple, maintainable choices over elaborate architecture. A static site (plain HTML/CSS/JS) is enough unless a specific feature genuinely needs more — don't reach for a framework or backend without a clear reason.

## Current state

**Repo:** https://github.com/bhavya-c211/Jungle-Gem-Website (private, branch `main`). Teammates get access via Settings → Collaborators. On this machine the remote URL includes `bhavya-c211@` because another GitHub account (`bhavyac-211`) is also saved in Windows Credential Manager.

Static multi-page site (decided: separate pages, not one scroll — each page is a real URL people can bookmark and QR codes can point to). Preview locally with `python -m http.server` from this folder (the session's `.claude/launch.json` config "site" does this).

- `index.html` — Home: hero (arched photo, spinning badge, hanging price tag, live in-stock counts), plant-name ticker, seasonal NRV note (changes by month), featured plants, "shop by space" photo tiles (dorm / pet-safe / sunny window), visit strip with live open/closed, **top-4 Questions** (tap to expand; full list on visit.html#faq — keep answers in sync), **newsletter plant spotlight**, newsletter signup.
- `shop.html` — hero with live in-stock count + arched category shortcuts, then search + the plant grid with a **filter panel**: a compact sticky sidebar on desktop (fits a laptop screen ≥700px tall without scrolling — Price is always open, Availability starts collapsed unless in use, Plant type shows 4 then "Show more"; genus common names show on hover), a slide-in drawer (Filters button → "See N plants") on phones/tablets. Collapsible groups built from plants.js (`FILTER_GROUPS` in js/main.js): Plant type (by genus; shows 6 then "Show more"), Light, Good for (pet-safe, dorm & desk, rare), Availability (in stock, last few = 1–3 left), and Price (min/max + slider). Each option shows how many plants you'd get; options with 0 are disabled. Within a group options are OR; across groups AND ("Good for" is AND). Active filters show as removable chips above the grid with "Clear all"; Sort: featured / price / name (sold out always last). URL params: `type, light, fit, stock` (comma lists), `min, max, sort, q` — e.g. `shop.html?light=low,bright&fit=pet&max=25`. Older links (`?pet=1`, `?small=1`, `?rare=1`, `?price=u20|20-30|30p`) are converted automatically.
- `care.html` — hero is a blown-up plant tag (random genus each load) with the care search built in; **one care sheet per genus**, with the year-round care calendar for Christiansburg (zone 7a, ~2,000 ft, last frost ~mid-May, first frost ~mid-Oct) as a **sticky sidebar beside the results** (`#calendar`) — moved there so searching doesn't mean scrolling past it; on phones/tablets it sits after the results. **QR target: `care.html#<genus>`** (e.g. `#epipremnum`, `#ficus`) — the sheet is highlighted on arrival. Old plant-id links (`#pothos`) forward to the genus sheet.
- `visit.html` — hero is a shop-door sign: live Open/Closed (Eastern time) + this week's hours with today highlighted. Then sections with anchors: `#hours`, `#directions` (Blacksburg/VT, Radford), `#shipping`, `#faq` (tap-to-expand questions), `#newsletter`.
- On the Shop page **only the filter + grid section is wider** (up to 1280px, ≥48px from the screen edges, never narrower than the normal column) so the grid gets 4 columns beside the sidebar. Everything else on the page — hero, "Beyond the grid", header, footer — keeps the normal 1040px width. CSS: `.shop-band .shop-layout` `--wide`.
- `cart.html` — cart from "Add to cart" buttons. **Stored in localStorage on this device only** (no accounts/backend). Quantities are capped at stock and re-checked on every page load. Customer picks **Pickup** (next open day) or **Ship it** (address + speed). Submitting opens a pre-filled email to the shop (mailto) with SKUs. No payments online yet.
- `login.html` — sign in / create account UI. **Front end only: nothing is sent or stored**, it shows an "accounts open soon" message. Needs an auth provider before it's real — ask the team first (accounts/credentials).
- `newsletter/spotlight-template.html` — email-safe (tables + inline styles) "Plant Spotlight" template with `{{PLACEHOLDERS}}`; paste into whichever email service the team picks. Uses `assets/logo-email.png` (PNG because email clients don't support webp). Keeps the CAN-SPAM footer (address + unsubscribe).
- Header has two dropdowns — **Shop** (categories + care-sheet card) and **Visit** (jumps to each Visit section + live open/closed panel). Hover on desktop, chevron button on touch/keyboard, Esc or picking a link closes. Plus account and cart icons with a live count. Top strip + footer link to `visit.html#shipping`.
- `js/plants.js` — `PLANTS` (for sale: price, `sku`, `stock`, `genus`), `GENERA` (care sheets by genus), `SPOTLIGHT` (newsletter plant of the issue). Edit here, not in HTML.
- `js/main.js` — all behavior, keyed off `data-*` hooks. Shop hours are in `HOURS`, shipping speeds/rates in `SHIPPING` (keep both in sync with the HTML).

### Client meeting decisions (9/17/26 and 10/7/26) — what applies to the website
- **Goal:** 10–15% sales bump once everything's set up.
- **Shipping:** carrier not chosen — comparing Pirate Ship (looks cheapest), UPS, Palm Street; compare discounted vs. regular UPS rates. Site offers 2-Day (slowest option, not guaranteed) plus **2-Day Guaranteed** and **Overnight Guaranteed** upgrades. Disclaimers: no delivery guarantee unless they pay for an upgrade; 2-Day is the slowest. Rates are `null` in `SHIPPING` → cart says "Quoted by email" until the team sets them. ⚠ The "2-Day standard vs. 2-Day Guaranteed" split is our reading of the notes — confirm with the client.
- **Inventory:** HandiFox for inventory, QuickBooks for POS and consigner sales. Online sales should come out of the same inventory automatically. The site is ready for that: every plant has `sku` (match HandiFox/QuickBooks) and `stock`. Until a sync exists, update `stock` by hand after counts. Inventory day: Fri Oct 23, 2026, 12–6pm (internal — not shown on the site).
- **QR codes:** two jobs — inventory tracking (internal, HandiFox) and customer care sheets **by genus** → `care.html#<genus>`.
- **Newsletter:** start an email list; spotlight one plant each issue, linked to the shop. Home spotlight + email template both read from `SPOTLIGHT`. Email service not picked yet.
- **Look & feel:** dark theme, black/green/neutrals/taupe, no gray/boring colors, minimalist, simple to navigate. Bhavya is checking the color scheme in person the week of 10/12.
- **Reference:** look at the shop's old Shopify site if it's still reachable — we don't have the URL yet.
- **Cache-busting:** every page loads `css/styles.css`, `js/plants.js` and `js/main.js` with `?v=YYYYMMDD`. Bump that number in all six pages whenever those files change, or browsers may keep showing the old version.
- Header markup is duplicated in each page (no build step). Edit it in `tools/sync-header.py`, then run `python tools/sync-header.py .` to rewrite all six pages. The footer is still copied by hand.

Local audience decisions: Christiansburg/NRV is named in titles, meta descriptions, and LocalBusiness JSON-LD (for Google local search). Shortcuts target VT/Radford students (small + low light) and pet owners (ASPCA non-toxic flag).

### Placeholders — the team must fill these in
- **Address is set:** 1035 Cambria St NE, Christiansburg, VA 24073 (Visit page, home Visit strip, footer, Visit dropdown, search listing JSON-LD, map links, newsletter template). Phone: (540) 922-7673 (`tel:+15409227673` links; Visit contact + hero button, footer, Visit dropdown, FAQ, JSON-LD, newsletter template). **Still missing: website URL/domain** — search for `TODO(team)` (JSON-LD in index.html + visit.html).
- **Prices, SKUs, and stock in `js/plants.js` are sample values.** Pet-safe flags follow the ASPCA list; double-check before launch.
- **Shipping rates** — `rate: null` in `SHIPPING` (js/main.js) until the carrier is picked.
- **Newsletter** signup shows a success message and logs to the console only — not sent anywhere. Pick a service (step 4 below); the template is ready.
- "We reply within a day", curbside pickup, and the order-request-by-email flow are assumptions — confirm with the shop owner.

### About the business (from the owner)
Woman-owned specialty plant shop in **Historic Cambria**, Christiansburg (1035 Cambria St NE). Rare plants are the specialty, but "a little something for everyone" — easy plants for green or not-so-green thumbs, plus **handcrafted items and consignments from local artists**. Instagram: **@junglegemplantco** (footer link + JSON-LD `sameAs`). Featured by Montgomery County tourism, @gotomontva (Instagram reel, Oct 2026).
- Home has an "A little something for everyone" cream band (rare / every thumb / handmade & consigned) right after the ticker.
- Shop has a "Beyond the grid" band (`#makers`): rare finds, handcrafted goods, consignment — with an artist "ask about consigning" email link. Handmade/consigned items are **not sold online yet** (no product data for them).
- `rare: true` on a plant in plants.js adds a "Rare" badge and shows the Shop's Rare filter (hidden while no plant is rare). None of the sample plants are rare — mark real ones when real inventory goes in.

## Design system (keep this intact)

Dark base overall, with light contrast added on purpose (team feedback: the all-dark version was too low-contrast; inspo was houseplantshop.com). No light-mode toggle.

- **Palette (updated 10/20/26)** — black stays the main color; accents from the "Engie Designs" olive/burgundy scheme the team picked. All tokens are CSS custom properties at the top of `css/styles.css`:
  - `--bg` #0A0C09 near-black (main) · `--surface` #292E16 **Darkest Forest** (panels) · `--fg` #ECE6D6 off-white · `--fg-muted` #AAA587 (lightened Tilleul so small text stays readable on panels)
  - `--accent` #898660 **Tilleul de Noémie** (buttons with black text, outlines, offset photo blocks) · `--leaf` #CFBD8C **Dry Leaf** (top strip, prices, italic highlights, ticker, badges) · `--cypress` #595B3E **Cypress** · `--taupe` #B9A789 (mono labels)
  - `--wine` #42010F **Rhinoceros Beetle** — special accent, use sparingly: the Home spotlight band (`.band.wine`), cart count, Sold out + Rare badges
  - Light side: `--cream` #DDD1AB (light Dry Leaf bands) · `--paper` #F2EBD9 · `--ink` #1A1E0D · `--ink-muted` #4F513A · `--ink-accent` #4A4C2E (olive links on cream)
  - Every text/background pairing was checked at ≥ 4.5:1 contrast. Re-check if you change a token.
  - **Green accents, not green backgrounds (10/20/26):** tried full green hero backgrounds; the team preferred the original backgrounds (black heroes, beige ticker, cream bands). Kept from that pass: Tilleul green for hero italics + Shop's big number, and **Cypress for the top strip and the spinning badge** (both liked). Lives in the "Green accents" block at the end of `css/styles.css`.
- `.band.light` = full-bleed cream band; `.band.wine` = full-bleed burgundy band. Use about one light band per page and wine only once; don't put two bands of the same color side by side.
- Photos: plant cards show a photo on a paper mat; home hero, "shop by space" tiles, care sheets, and the Visit page use photos. **All photos are Unsplash stock placeholders** (hotlinked; `photo` IDs in `js/plants.js`, URLs in the HTML). Replace them with the shop's own photos: put files in `assets/` and set `photo: 'assets/pothos.jpg'` — the card code accepts a path.
- Signature shapes (team asked for a less generic look): **arches** (`.arch` — arched shop windows, used for hero/category photos), **plant tags** (notched paper tags with a punched hole — hang tag on Home, giant tag on Care), the **door sign** on Visit, a **leaf-green ticker**, and offset green "shadow" blocks behind photos. Reuse these before inventing new shapes. Animations respect `prefers-reduced-motion`.
- Logo: the shop's hand-lettered "Jungle Gem Plant Co." mark, white on transparent — `assets/logo.webp` (full size, tightly cropped) and `assets/logo-sm.webp` (553×419, used in header + footer). It's white, so it only works on dark backgrounds; ask for a dark version before putting it on cream. `assets/sprout.webp` is just the sprout + star cut from the logo (white, square); it's used as a CSS mask so it can take any color — currently ink-colored in the center of the home hero's spinning badge.
- Motion: tried site-wide scroll reveals + parallax (10/19/26); the owner/team felt it was too much and it was removed. Keep motion limited to the existing small touches (spinning badge, swinging tag, ticker, hover lifts).
- Fonts: Fraunces (display/headings), Archivo (body/nav), IBM Plex Mono (labels, prices, tags — the "plant tag" detail).
- Layout language: sections as bands separated by hairline dividers (not cards/shadows), grids with 1px gap "seams" rather than individual bordered cards, minimal copy — labels over paragraphs.
- Keep text sparse. This isn't a marketing site; it reads like a shop, not a pitch.

## What the full project eventually needs (from the project charter)

These are the five deliverables the class charter commits to. The website covers pieces of all of them — build toward these, but ask before taking on anything that implies real infrastructure (payments, a real QuickBooks connection, a real shipping carrier account) since those need real accounts/credentials the team has to set up themselves.

1. **Shipping system** — shipping options/rates, labels, order tracking (site needs to *display* shipping info/status; the actual carrier integration is a separate, bigger piece).
2. **Website** — order ticketing (cart/checkout flow), searchable plant care info, QR-linked care sheets per plant.
3. **Inventory tracking** — barcode/QR tracking synced to QuickBooks for consignment pricing (site needs product data to come from somewhere real eventually, not hardcoded).
4. **Packaging & fulfillment guidance** — internal staff-facing, probably not part of the public site.
5. **Email newsletter** — signup capture (the site already has a static form; it isn't wired to anything yet).

## First things to tackle here

Reasonable next steps, roughly in order:
1. ~~Turn the single scrolling page into real navigation~~ — done (Home, Shop, Care, Visit).
2. ~~Make the plant grid data-driven~~ — done (`js/plants.js`). Next: load it from an inventory export instead of hand-editing.
3. ~~Care-sheet pages for QR codes~~ — done, one sheet per genus on care.html. Generate QR codes pointing at `<domain>/care.html#<genus>` once the domain is set. Add photos (`assets/`) per plant.
4. Newsletter has a visible success state; still ask what service the team wants before integrating a real one.
5. Only after the above: start thinking about cart/checkout, which is a much bigger piece — scope it with the team first.

## Ground rules

- Ask before adding paid services, accounts, or dependencies that cost money or need credentials.
- Keep the copy minimal and in the shop's voice — no generic marketing language.
- This file is project memory: update it as real decisions get made (final domain, hosting choice, what's actually wired up) so the context stays accurate for next time.
