"""Keep the <header> identical across pages: edit HEADER below, then run
   python tools/sync-header.py .   (from the site folder)"""
import re, sys, pathlib

SITE = pathlib.Path(sys.argv[1])

HEADER = '''<header>
  <nav aria-label="Main">
    <a class="logo" href="index.html"{home}><img src="assets/logo-sm.webp" alt="Jungle Gem Plant Co." width="553" height="419"></a>
    <div class="nav-links">
      <div class="dd" data-dd>
        <a href="shop.html"{shop}>Shop</a>
        <button class="dd-btn" type="button" aria-expanded="false" aria-controls="shop-menu" aria-label="Shop categories">
          <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <div class="dd-menu" id="shop-menu">
          <div class="dd-links">
            <span class="dd-label">Shop by</span>
            <a href="shop.html">All plants <span data-stat="count"></span></a>
            <a href="shop.html?light=low">Low light</a>
            <a href="shop.html?light=medium">Medium light</a>
            <a href="shop.html?light=bright">Bright light</a>
            <a href="shop.html?pet=1">Pet-safe <span data-stat="pet"></span></a>
            <a href="shop.html?small=1">Dorm &amp; desk</a>
          </div>
          <a class="dd-feature" href="care.html#monstera">
            <img src="https://images.unsplash.com/photo-1636525653613-2a3a05c00759?w=360&amp;h=440&amp;fit=crop&amp;auto=format&amp;q=70" alt="" loading="lazy" width="360" height="440">
            <span class="dd-label">Care sheets</span>
            <strong>Every tag, scannable &rarr;</strong>
          </a>
        </div>
      </div>
      <a href="care.html"{care}>Care</a>
      <div class="dd" data-dd>
        <a href="visit.html"{visit}>Visit</a>
        <button class="dd-btn" type="button" aria-expanded="false" aria-controls="visit-menu" aria-label="Visit sections">
          <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <div class="dd-menu" id="visit-menu">
          <div class="dd-links">
            <span class="dd-label">Visit</span>
            <a href="visit.html#hours">Hours &amp; location</a>
            <a href="visit.html#directions">Getting here</a>
            <a href="visit.html#shipping">Shipping</a>
            <a href="visit.html#faq">Questions</a>
            <a href="visit.html#newsletter">Newsletter</a>
          </div>
          <a class="dd-feature dd-sign" href="visit.html#hours">
            <span class="dd-label">Right now</span>
            <strong class="dd-status" data-open-now>Open now</strong>
            <span class="dd-hours">Tue&ndash;Sat<br>10am&ndash;6pm</span>
            <span class="dd-hours">1035 Cambria St NE<br>Christiansburg, VA</span>
            <span class="dd-hours">(540) 922-7673</span>
          </a>
        </div>
      </div>
      <span class="nav-icons">
        <a class="icon-link" href="login.html" aria-label="Account"{login}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        </a>
        <a class="icon-link" href="cart.html" aria-label="Cart"{cart}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
          <span class="cart-count" data-cart-count hidden>0</span>
        </a>
      </span>
    </div>
  </nav>
</header>'''

PAGES = ['index', 'shop', 'care', 'visit', 'login', 'cart']
for page in PAGES:
    f = SITE / f'{page}.html'
    if not f.exists():
        continue
    cur = {p: (' aria-current="page"' if p == page else '') for p in PAGES + ['home']}
    cur['home'] = cur['index']
    html = f.read_text(encoding='utf-8')
    html, n = re.subn(r'<header>.*?</header>', lambda m: HEADER.format(**cur), html, flags=re.S)
    f.write_text(html, encoding='utf-8')
    print(page, n)
