# Jungle Gem Plant Co. — Website

Online storefront for **Jungle Gem Plant Co.**, a woman-owned specialty plant shop in Historic Cambria, Christiansburg, VA (1035 Cambria St NE). Team 3 class project.

Plain HTML/CSS/JS — no build step, no framework, nothing to install.

## Run it locally

From this folder:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>. (Opening the `.html` files directly also mostly works, but a local server matches how it'll be hosted.)

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Home — hero, seasonal NRV care tips, featured plants, shop by space, FAQ, newsletter spotlight |
| `shop.html` | Plant grid with filter sidebar (drawer on phones), search, sort, add to cart |
| `care.html` | Care sheets by genus (QR codes on plant tags link to `care.html#<genus>`) + care calendar |
| `visit.html` | Hours, directions, shipping info, FAQ |
| `cart.html` | Cart → pickup or shipping request (sent by email for now) |
| `login.html` | Account UI only — **not connected to anything yet** |

## Where to edit things

- **Plants, prices, stock, care sheets, newsletter spotlight:** `js/plants.js`
- **Behavior** (filters, cart, hours, shipping speeds): `js/main.js`
- **Styles / colors:** `css/styles.css` (color tokens at the top)
- **Header** (shared by every page): edit `tools/sync-header.py`, then run `python tools/sync-header.py .`
- **Newsletter email template:** `newsletter/spotlight-template.html`

After changing `css/styles.css`, `js/main.js` or `js/plants.js`, bump the `?v=` number on their links in all six pages so browsers don't show an old cached copy.

## Still placeholders

- Prices, SKUs and stock counts are **sample data** — real numbers should come from HandiFox / QuickBooks.
- Plant photos are **Unsplash stock** — swap in the shop's own photos (`assets/`).
- Shipping rates are "quoted by email" until a carrier is picked (Pirate Ship / UPS / Palm Street).
- Newsletter signup and login aren't wired to a service yet.
- No domain / hosting chosen yet.

**`CLAUDE.md` has the full project notes** — client meeting decisions, design system, and everything above in more detail.
