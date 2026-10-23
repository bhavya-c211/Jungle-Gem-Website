# Jungle Gem Plant Co. — Website

Online storefront for **Jungle Gem Plant Co.**, a woman-owned specialty plant shop in Historic Cambria, Christiansburg, VA (1035 Cambria St NE). Team 3 class project.

Plain HTML/CSS/JS — no build step, no framework, nothing to install.

## Team setup (start here)

### 1. Get access

This repo is **private**. You need a free GitHub account ([github.com/signup](https://github.com/signup)).

1. Send your **GitHub username** to Bhavya so you can be added.
2. Accept the invite — it comes by email, or check [github.com/notifications](https://github.com/notifications).
3. Open <https://github.com/bhavya-c211/Jungle-Gem-Website> — if you see the files, you're in.

### 2. Get the code — pick one

**A. Just want to look? Download a ZIP (nothing to install)**
On the repo page: green **Code** button → **Download ZIP** → unzip it anywhere.
⚠️ This is a snapshot — it won't update. Download again to see newer changes.

**B. Going to make changes? Use GitHub Desktop (easiest)**
1. Install [GitHub Desktop](https://desktop.github.com) and sign in with your GitHub account.
2. **File → Clone repository** → pick `bhavya-c211/Jungle-Gem-Website` → choose a folder → **Clone**.
3. To get teammates' latest changes later: **Fetch origin** → **Pull origin**.

**C. Comfortable with the terminal?**
```bash
git clone https://github.com/bhavya-c211/Jungle-Gem-Website.git
```

### 3. View the site on your computer

**Quickest:** open the folder and **double-click `index.html`**. It opens in your browser and every page works.

**Same as it'll run when hosted (optional):** open a terminal *in the project folder* and run:

```bash
python -m http.server 5173
```

(Mac: use `python3` instead of `python`.) Then go to <http://localhost:5173>. Press **Ctrl + C** in the terminal to stop it.
If you get "python not found", install it from [python.org](https://www.python.org/downloads/) — on Windows, tick **"Add python.exe to PATH"** during install.

**Using VS Code?** Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**. The page refreshes itself when you save.

**Changes not showing?** Hard-refresh: **Ctrl + Shift + R** (Mac: **Cmd + Shift + R**).

### 4. Making changes as a team

1. **Pull first**, every time you start (GitHub Desktop: *Fetch origin* → *Pull*).
2. Make your edits and check them in the browser.
3. **Commit** with a clear message (e.g. "Add real prices for October inventory") → **Push**.
4. Say what you changed in the group chat — and avoid two people editing the same file at the same time (especially `css/styles.css` and `js/main.js`), or you'll have to merge by hand.

New to Git? GitHub Desktop handles all of this with buttons — no commands needed.

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
