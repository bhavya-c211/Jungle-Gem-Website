// Jungle Gem Plant Co. — site scripts
// Each feature looks for its own data-* hook and does nothing if the
// page doesn't have it, so every page loads this same file.
// Depends on js/plants.js (window.PLANTS) being loaded first.

(function () {
  const PLANTS = window.PLANTS || [];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Shop hours, in Christiansburg time. 0 = Sun. [open, close] in 24h.
  // Keep in sync with the hours printed on visit.html.
  const HOURS = { 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 18], 6: [10, 18] };
  const SHOP_EMAIL = 'hello@junglegemplantco.com';

  // Shipping speeds (meeting 9/17). Carrier not chosen yet — Pirate Ship,
  // UPS, and Palm Street are being compared. Set `rate` (dollars) once
  // rates are picked; while it's null the cart says "Quoted by email".
  // 2-Day is the slowest option offered; only the upgrades are guaranteed.
  const SHIPPING = [
    { id: '2day', label: '2-Day', note: 'Our slowest option. Delivery date not guaranteed.', guaranteed: false, rate: null },
    { id: '2day-guaranteed', label: '2-Day Guaranteed', note: 'Upgrade. Arrives in 2 business days.', guaranteed: true, rate: null },
    { id: 'overnight', label: 'Overnight Guaranteed', note: 'Upgrade. Next business day.', guaranteed: true, rate: null }
  ];

  // Placeholder stock photos (Unsplash, free license) until the shop
  // shoots its own — then swap `photo` in plants.js for a local path.
  const photoUrl = (id, w, h) => id.includes('/')
    ? id
    : `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;

  const GENERA = window.GENERA || {};
  const byId = (id) => PLANTS.find((p) => p.id === id);
  // Stock comes from plants.js for now (HandiFox/QuickBooks sync later).
  const stockOf = (id) => { const p = byId(id); return p ? Math.max(0, p.stock ?? 0) : 0; };
  const inStock = PLANTS.filter((p) => p.stock > 0);

  // ---------- cart (this browser only, until accounts/orders exist) ----------
  // { plantId: qty } in localStorage. Wrapped in try/catch: private
  // windows and blocked storage fall back to an in-memory cart.
  const CART_KEY = 'jg-cart';
  let memCart = {};
  const cart = {
    get() {
      try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return memCart; }
    },
    set(c) {
      // Never hold more than what's on the floor; drop sold-out plants.
      Object.keys(c).forEach((k) => {
        c[k] = Math.min(c[k], stockOf(k));
        if (c[k] < 1) delete c[k];
      });
      memCart = c;
      try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) { /* memory only */ }
      cart.paintCount();
    },
    add(id, n = 1) {
      const c = cart.get();
      const before = c[id] || 0;
      c[id] = before + n;
      cart.set(c);
      return (cart.get()[id] || 0) > before; // false = hit the stock limit
    },
    qty() { return Object.values(cart.get()).reduce((a, b) => a + b, 0); },
    paintCount(bump) {
      const n = cart.qty();
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = n;
        el.hidden = n === 0;
        if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
      });
    }
  };
  // Re-check a saved cart against today's stock (e.g. after an inventory
  // update a plant sold out) — trims quantities and repaints the count.
  cart.set(cart.get());

  // Add-to-cart buttons are rendered later, so listen at the document.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn || btn.disabled) return;
    const ok = cart.add(btn.dataset.add);
    if (ok) cart.paintCount(true);
    btn.classList.add('added');
    btn.textContent = ok ? 'Added ✓' : `Max ${stockOf(btn.dataset.add)} in stock`;
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'Add to cart'; }, 1400);
  });

  // ---------- plant cards ----------
  function stockNote(p) {
    if (p.stock < 1) return '<span class="stock out">Sold out</span>';
    if (p.stock <= 3) return `<span class="stock low">Only ${p.stock} left</span>`;
    return '<span class="stock">In stock</span>';
  }
  function card(p) {
    const out = p.stock < 1;
    return `
      <article class="plant${out ? ' sold-out' : ''}">
        <a class="plant-photo" href="care.html#${esc(p.genus)}" tabindex="-1" aria-hidden="true">
          <img src="${photoUrl(p.photo, 480, 600)}" alt="" loading="lazy" width="480" height="600">
          ${out ? '<span class="badge out">Sold out</span>' : p.rare ? '<span class="badge rare">Rare</span>' : p.petSafe ? '<span class="badge">Pet-safe</span>' : ''}
        </a>
        <h3>${esc(p.name)}</h3>
        <span class="bot">${esc(p.botanical)}</span>
        <div class="tags">
          <span>${esc(p.lightLabel)}</span><span>${esc(p.waterLabel)}</span>
        </div>
        <div class="row-end">
          <span class="price">$${esc(p.price)}</span>
          ${stockNote(p)}
        </div>
        <div class="card-actions">
          <button class="btn-add" type="button" data-add="${esc(p.id)}"${out ? ' disabled' : ''}>${out ? 'Sold out' : 'Add to cart'}</button>
          <a class="tag-link" href="care.html#${esc(p.genus)}">Care &rarr;</a>
        </div>
      </article>`;
  }

  const featured = document.querySelector('[data-featured]');
  if (featured) featured.innerHTML = PLANTS.filter((p) => p.featured).map(card).join('');

  // ---------- shop: filter sidebar / drawer, mirrored in the URL ----------
  // Desktop: sticky sidebar. Phones/tablets: the same panel slides in as a
  // drawer from the "Filters" button. Within a group, checked options widen
  // the results (any of them); across groups they narrow (all must match).
  // "Good for" is the exception: its options are traits, so all must match.
  const grid = document.querySelector('[data-shop]');
  if (grid) {
    const presentGenera = [...new Set(PLANTS.map((p) => p.genus))].filter((g) => GENERA[g]);
    const FILTER_GROUPS = [
      { key: 'type', label: 'Plant type', mode: 'any',
        options: presentGenera.map((g) => ({ val: g, label: GENERA[g].name, sub: GENERA[g].common })),
        test: (p, v) => p.genus === v },
      { key: 'light', label: 'Light', mode: 'any',
        options: [{ val: 'low', label: 'Low light' }, { val: 'medium', label: 'Medium light' }, { val: 'bright', label: 'Bright light' }],
        test: (p, v) => p.light === v },
      { key: 'fit', label: 'Good for', mode: 'all',
        options: [{ val: 'pet', label: 'Homes with pets' }, { val: 'small', label: 'Dorm & desk' },
          ...(PLANTS.some((p) => p.rare) ? [{ val: 'rare', label: 'Rare finds' }] : [])],
        test: (p, v) => (v === 'pet' ? p.petSafe : v === 'small' ? p.small : !!p.rare) },
      { key: 'stock', label: 'Availability', mode: 'any',
        options: [{ val: 'in', label: 'In stock' }, { val: 'low', label: 'Last few (1–3 left)' }],
        test: (p, v) => (v === 'in' ? p.stock > 0 : p.stock > 0 && p.stock <= 3) }
    ];
    const PRICE_TOP = Math.ceil(Math.max(...PLANTS.map((p) => p.price)));
    const SHOW_FIRST = 4; // longer groups (plant type) collapse behind "Show more"

    // ---- state from the URL (plus older links: ?pet=1, ?small=1, ?price=u20 …)
    const params = new URLSearchParams(location.search);
    const list = (k) => (params.get(k) || '').split(',').filter(Boolean);
    const state = { q: params.get('q') || '', sort: params.get('sort') || 'featured', min: null, max: null };
    FILTER_GROUPS.forEach((g) => {
      const ok = new Set(g.options.map((o) => o.val));
      state[g.key] = new Set(list(g.key).filter((v) => ok.has(v)));
    });
    ['pet', 'small', 'rare'].forEach((k) => { if (params.get(k) === '1' && FILTER_GROUPS[2].options.some((o) => o.val === k)) state.fit.add(k); });
    const num = (v) => (v === null || v === '' || isNaN(+v) ? null : Math.max(0, +v));
    state.min = num(params.get('min'));
    state.max = num(params.get('max'));
    const legacyPrice = { u20: [null, 19.99], '20-30': [20, 30], '30p': [30.01, null] }[params.get('price')];
    if (legacyPrice) [state.min, state.max] = legacyPrice;

    // ---- elements
    const search = document.querySelector('[data-shop-search]');
    const count = document.querySelector('[data-shop-count]');
    const seeCount = document.querySelector('[data-see-count]');
    const activeN = document.querySelector('[data-active-n]');
    const chips = document.querySelector('[data-active-chips]');
    const clearBtns = document.querySelectorAll('[data-clear]');
    const sortSel = document.querySelector('[data-sort]');
    const groupsEl = document.querySelector('[data-filter-groups]');
    search.value = state.q;
    sortSel.value = [...sortSel.options].some((o) => o.value === state.sort) ? state.sort : 'featured';
    state.sort = sortSel.value;

    // ---- build the panel once; render() only updates counts/checks
    // Availability starts collapsed (keeps the sidebar short) unless in use;
    // Price is always open so it's easy to find.
    const startOpen = (key) => key !== 'stock' || state[key].size > 0;
    groupsEl.innerHTML = FILTER_GROUPS.map((g) => `
      <details class="fg"${startOpen(g.key) ? ' open' : ''}>
        <summary>${esc(g.label)}</summary>
        <div class="fg-opts">
          ${g.options.map((o, i) => `
            <label class="fopt${i >= SHOW_FIRST ? ' more' : ''}"${o.sub ? ` title="${esc(o.sub)}"` : ''}>
              <input type="checkbox" data-group="${g.key}" value="${esc(o.val)}">
              <span class="fopt-label">${esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span>
              <span class="fopt-n" data-n="${g.key}:${esc(o.val)}"></span>
            </label>`).join('')}
          ${g.options.length > SHOW_FIRST ? `<button class="fg-more" type="button" data-more aria-expanded="false">+ Show ${g.options.length - SHOW_FIRST} more</button>` : ''}
        </div>
      </details>`).join('') + `
      <details class="fg"${startOpen('price') ? ' open' : ''}>
        <summary>Price</summary>
        <div class="fg-price">
          <p class="price-note">The highest price is $${PRICE_TOP}</p>
          <input class="price-range" type="range" min="0" max="${PRICE_TOP}" step="1" data-price-range aria-label="Maximum price">
          <div class="price-boxes">
            <label>Min<span class="money"><span>$</span><input class="field" type="number" min="0" max="${PRICE_TOP}" inputmode="numeric" placeholder="0" data-price="min"></span></label>
            <span class="to">to</span>
            <label>Max<span class="money"><span>$</span><input class="field" type="number" min="0" max="${PRICE_TOP}" inputmode="numeric" placeholder="${PRICE_TOP}" data-price="max"></span></label>
          </div>
        </div>
      </details>`;
    groupsEl.querySelectorAll('[data-more]').forEach((btn) => btn.addEventListener('click', () => {
      const fg = btn.closest('.fg');
      const open = fg.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? '− Show less' : `+ Show ${fg.querySelectorAll('.fopt.more').length} more`;
    }));
    const range = groupsEl.querySelector('[data-price-range]');
    const minBox = groupsEl.querySelector('[data-price="min"]');
    const maxBox = groupsEl.querySelector('[data-price="max"]');

    // ---- matching
    const matchesQ = (p) => {
      const q = state.q.trim().toLowerCase();
      if (!q) return true;
      const g = GENERA[p.genus] || {};
      return [p.name, p.botanical, g.name, g.common].join(' ').toLowerCase().includes(q);
    };
    const inGroup = (p, g, sel = state[g.key]) => !sel.size ||
      (g.mode === 'all' ? [...sel].every((v) => g.test(p, v)) : [...sel].some((v) => g.test(p, v)));
    const inPrice = (p) => (state.min === null || p.price >= state.min) && (state.max === null || p.price <= state.max);
    const passes = (p, skipKey) => matchesQ(p) && inPrice(p) && FILTER_GROUPS.every((g) => g.key === skipKey || inGroup(p, g));

    const SORTS = {
      featured: () => 0,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name)
    };

    // ---- drawer (phones/tablets)
    const panel = document.querySelector('[data-filter-panel]');
    const backdrop = document.querySelector('.fp-backdrop');
    const openBtn = document.querySelector('[data-filters-open]');
    const setDrawer = (open) => {
      panel.classList.toggle('open', open);
      backdrop.hidden = !open;
      document.documentElement.classList.toggle('fp-lock', open);
      openBtn.setAttribute('aria-expanded', open);
      // focus after the panel becomes visible (it's visibility:hidden while closed)
      if (open) setTimeout(() => panel.querySelector('.fp-close').focus(), 40);
      else if (panel.contains(document.activeElement)) openBtn.focus();
    };
    openBtn.addEventListener('click', () => setDrawer(true));
    document.querySelectorAll('[data-filters-close]').forEach((b) => b.addEventListener('click', () => setDrawer(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) setDrawer(false); });

    // ---- render
    const money = (n) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
    const render = () => {
      const shown = PLANTS.filter((p) => passes(p))
        .sort((a, b) => (b.stock > 0) - (a.stock > 0) || SORTS[state.sort](a, b)); // sold out always last
      grid.innerHTML = shown.length
        ? shown.map(card).join('')
        : '<p class="empty">Nothing matches. Try removing a filter, or ask in store &mdash; stock turns over weekly.</p>';
      count.textContent = `${shown.length} of ${PLANTS.length} plants`;
      seeCount.textContent = shown.length;

      // option counts: how many you'd see with that option added
      FILTER_GROUPS.forEach((g) => g.options.forEach((o) => {
        const sel = new Set(state[g.key]); sel.add(o.val);
        const n = PLANTS.filter((p) => passes(p, g.key) && inGroup(p, g, sel)).length;
        const box = groupsEl.querySelector(`input[data-group="${g.key}"][value="${o.val}"]`);
        box.checked = state[g.key].has(o.val);
        box.disabled = !n && !box.checked;
        box.closest('.fopt').classList.toggle('empty-opt', box.disabled);
        groupsEl.querySelector(`[data-n="${g.key}:${o.val}"]`).textContent = `(${n})`;
      }));
      minBox.value = state.min ?? '';
      maxBox.value = state.max ?? '';
      range.value = state.max ?? PRICE_TOP;

      // active-filter chips
      const active = [];
      FILTER_GROUPS.forEach((g) => state[g.key].forEach((v) => {
        const o = g.options.find((x) => x.val === v);
        active.push({ id: `${g.key}:${v}`, label: o.label });
      }));
      if (state.min !== null || state.max !== null) {
        active.push({ id: 'price', label: `${state.min !== null ? money(state.min) : '$0'}–${state.max !== null ? money(state.max) : money(PRICE_TOP)}` });
      }
      if (state.q.trim()) active.push({ id: 'q', label: `“${state.q.trim()}”` });
      chips.innerHTML = active.map((a) => `<button class="achip" type="button" data-remove="${esc(a.id)}" aria-label="Remove filter: ${esc(a.label)}">${esc(a.label)} <span aria-hidden="true">&times;</span></button>`).join('');
      const nFilters = active.filter((a) => a.id !== 'q').length;
      activeN.textContent = nFilters;
      activeN.hidden = !nFilters;
      clearBtns.forEach((b) => { b.hidden = !active.length; });

      // URL
      const next = new URLSearchParams();
      FILTER_GROUPS.forEach((g) => { if (state[g.key].size) next.set(g.key, [...state[g.key]].join(',')); });
      if (state.min !== null) next.set('min', state.min);
      if (state.max !== null) next.set('max', state.max);
      if (state.sort !== 'featured') next.set('sort', state.sort);
      if (state.q) next.set('q', state.q);
      history.replaceState(null, '', next.toString() ? '?' + next.toString().replace(/%2C/g, ',') : location.pathname);
    };

    // ---- events
    groupsEl.addEventListener('change', (e) => {
      const box = e.target.closest('input[data-group]');
      if (!box) return;
      state[box.dataset.group][box.checked ? 'add' : 'delete'](box.value);
      render();
    });
    const setPrice = () => {
      let lo = num(minBox.value), hi = num(maxBox.value);
      if (hi !== null && hi >= PRICE_TOP) hi = null;
      if (lo !== null && hi !== null && lo > hi) [lo, hi] = [hi, lo];
      state.min = lo || null; state.max = hi;
      render();
    };
    minBox.addEventListener('change', setPrice);
    maxBox.addEventListener('change', setPrice);
    range.addEventListener('input', () => { maxBox.value = +range.value >= PRICE_TOP ? '' : range.value; setPrice(); });
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (!b) return;
      const [k, v] = b.dataset.remove.split(':');
      if (k === 'price') { state.min = null; state.max = null; }
      else if (k === 'q') { state.q = ''; search.value = ''; }
      else state[k].delete(v);
      render();
    });
    clearBtns.forEach((b) => b.addEventListener('click', () => {
      FILTER_GROUPS.forEach((g) => state[g.key].clear());
      Object.assign(state, { min: null, max: null, q: '' });
      search.value = '';
      render();
    }));
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });
    search.addEventListener('input', () => { state.q = search.value; render(); });
    render();
  }

  // ---------- care sheets: one per genus. care.html#<genus> is the QR target ----------
  const sheets = document.querySelector('[data-sheets]');
  const genusKeys = Object.keys(GENERA);
  if (sheets) {
    sheets.innerHTML = genusKeys.map((key) => {
      const g = GENERA[key];
      const plants = PLANTS.filter((p) => p.genus === key);
      const photo = plants[0] ? photoUrl(plants[0].photo, 480, 360) : '';
      const search = [g.name, g.common, ...plants.map((p) => p.name + ' ' + p.botanical)].join(' ').toLowerCase();
      return `
      <article class="sheet" id="${esc(key)}" data-name="${esc(search)}">
        <div class="side">
          ${photo ? `<img class="sheet-photo" src="${photo}" alt="${esc(g.common)}" loading="lazy" width="480" height="360">` : ''}
          <span class="bt-no">Genus</span>
          <h3><em>${esc(g.name)}</em></h3>
          <span class="bot">${esc(g.common)}</span>
          <div class="tags">
            <span class="${g.petSafe ? 'safe' : ''}">${g.petSafe ? 'Pet-safe' : 'Keep from pets'}</span>
          </div>
          ${plants.length ? `<span class="in-shop">In the shop: ${plants.map((p) =>
            `<a class="tag-link" href="shop.html?q=${encodeURIComponent(p.name)}">${esc(p.name)}</a>`).join(', ')}</span>` : ''}
        </div>
        <dl>
          <dt>Light</dt><dd>${esc(g.light)}</dd>
          <dt>Water</dt><dd>${esc(g.water)}</dd>
          <dt>Humidity</dt><dd>${esc(g.humidity)}</dd>
          <dt>Here in the NRV</dt><dd class="local">${esc(g.local)}</dd>
          <dt>Trouble</dt><dd>${esc(g.trouble)}</dd>
        </dl>
      </article>`;
    }).join('');

    // Sheets are injected after load, so jump to the hash ourselves.
    // Older links/tags used the plant id (care.html#pothos) — forward
    // those to the plant's genus sheet so printed QR codes keep working.
    const hash = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    if (hash) {
      const plant = byId(hash);
      if (plant && !GENERA[hash]) location.replace('#' + plant.genus);
      const t = document.getElementById(plant && !GENERA[hash] ? plant.genus : hash);
      if (t) t.scrollIntoView({ block: 'start' });
    }

    const find = document.querySelector('[data-care-search]');
    const count = document.querySelector('[data-care-count]');
    const empty = document.querySelector('[data-care-empty]');
    const filter = () => {
      const q = find.value.trim().toLowerCase();
      let n = 0;
      sheets.querySelectorAll('.sheet').forEach((s) => {
        const hit = !q || s.dataset.name.includes(q);
        s.hidden = !hit;
        if (hit) n++;
      });
      count.textContent = `${n} of ${genusKeys.length} genera`;
      empty.hidden = n > 0;
    };
    find.addEventListener('input', filter);
    filter();
  }

  // ---------- seasonal note for Christiansburg / New River Valley ----------
  // ~2,000 ft, zone 7a. Average last frost mid-May, first frost mid-October.
  const SEASONS = [
    { months: [11, 0, 1], key: 'winter', name: 'Winter', range: 'Dec–Feb', title: 'Short days, dry heat.',
      body: 'Plants slow down while the furnace dries the air.',
      todo: ['Water less often', 'Add humidity — group plants or run a humidifier', 'Pull leaves off cold window glass'] },
    { months: [2, 3, 4], key: 'spring', name: 'Spring', range: 'Mar–May', title: 'Light is back.',
      body: 'New growth starts. Last frost usually passes mid-May.',
      todo: ['Repot anything root-bound', 'Start feeding again', 'Keep patio plants in until mid-May'] },
    { months: [5, 6, 7], key: 'summer', name: 'Summer', range: 'Jun–Aug', title: 'Humid and growing.',
      body: 'Peak growing season — plants drink fast.',
      todo: ['Water more often', 'Shade porch plants from afternoon sun', 'Check leaf undersides for pests'] },
    { months: [8, 9, 10], key: 'fall', name: 'Fall', range: 'Sep–Nov', title: 'Bring them in.',
      body: 'First frost lands around mid-October.',
      todo: ['Check for pests before moving plants inside', 'Bring tropicals in before nights hit 50°F', 'Expect some leaf drop — it’s normal'] }
  ];
  const month = new Date().getMonth();
  const season = SEASONS.find((s) => s.months.includes(month));
  document.querySelectorAll('[data-season]').forEach((el) => {
    const set = (k, v) => { const t = el.querySelector(`[data-season-${k}]`); if (t) t.textContent = v; };
    set('name', season.name);
    set('range', season.range);
    set('title', season.title);
    set('body', season.body);
    const list = el.querySelector('[data-season-todo]');
    if (list) list.innerHTML = season.todo.map((t) => `<li>${esc(t)}</li>`).join('');
    // four-season strip: mark the current one
    el.querySelectorAll('[data-season-dot]').forEach((d) => d.classList.toggle('now', d.dataset.seasonDot === season.key));
  });
  document.querySelectorAll('[data-cal]').forEach((el) => {
    if (el.dataset.cal === season.key) el.classList.add('now');
  });

  // ---------- open / closed right now (Eastern time) ----------
  function nowET() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date());
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.find((x) => x.type === 'weekday').value),
      hour: Number(parts.find((x) => x.type === 'hour').value)
    };
  }
  const { day: today, hour } = nowET();
  const openNow = !!HOURS[today] && hour >= HOURS[today][0] && hour < HOURS[today][1];
  document.querySelectorAll('[data-open-now]').forEach((el) => {
    const sign = el.classList.contains('sign-status');
    el.textContent = sign ? (openNow ? 'Open' : 'Closed')
      : el.classList.contains('dd-status') ? (openNow ? 'Open now' : 'Closed now')
      : (openNow ? '● Open now' : '○ Closed now');
    el.classList.toggle('closed', !openNow);
  });
  document.querySelectorAll(`[data-hours] [data-day="${today}"]`).forEach((li) => li.classList.add('today'));

  // ---------- live numbers + ticker ----------
  document.querySelectorAll('[data-stat="count"]').forEach((el) => { el.textContent = inStock.length; });
  document.querySelectorAll('[data-stat="pet"]').forEach((el) => { el.textContent = inStock.filter((p) => p.petSafe).length; });
  document.querySelectorAll('[data-ticker]').forEach((el) => {
    const names = PLANTS.map((p) => `<span>${esc(p.name)}</span>`).join('');
    el.innerHTML = names + names; // doubled so the loop is seamless
  });

  // ---------- newsletter spotlight (SPOTLIGHT in plants.js) ----------
  const spotEl = document.querySelector('[data-spotlight]');
  const spot = window.SPOTLIGHT;
  const spotPlant = spot && byId(spot.plant);
  if (spotEl && spotPlant) {
    const s = (k) => spotEl.querySelector(`[data-spot="${k}"]`);
    s('issue').textContent = spot.issue;
    s('img').src = photoUrl(spotPlant.photo, 600, 750);
    s('img').alt = spotPlant.name;
    s('name').innerHTML = `${esc(spotPlant.name)}<em>.</em>`;
    s('bot').textContent = spotPlant.botanical;
    s('note').textContent = spot.note;
    s('shop').href = `shop.html?q=${encodeURIComponent(spotPlant.name)}`;
    s('care').href = `care.html#${spotPlant.genus}`;
    spotEl.hidden = false;
  }

  // ---------- care hero: blown-up tag shows a random genus ----------
  const demo = document.querySelector('[data-tag-demo]');
  if (demo && genusKeys.length) {
    const i = Math.floor(Math.random() * genusKeys.length);
    const g = GENERA[genusKeys[i]];
    const p = PLANTS.find((x) => x.genus === genusKeys[i]) || {};
    const set = (k, v) => { demo.querySelector(`[data-t="${k}"]`).textContent = v; };
    set('no', `Genus · No. ${String(i + 1).padStart(2, '0')}`);
    set('name', g.name);
    set('bot', g.common);
    set('light', p.lightLabel || '');
    set('water', p.waterLabel || '');
    set('pets', g.petSafe ? 'Safe' : 'Keep away');
    demo.href = `#${genusKeys[i]}`;
  }

  // ---------- nav dropdown ----------
  // Hover opens it on desktop (CSS); the chevron button toggles it for
  // touch and keyboard. Esc or an outside click closes it.
  document.querySelectorAll('[data-dd]').forEach((dd) => {
    const btn = dd.querySelector('.dd-btn');
    const setOpen = (open) => { dd.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', () => setOpen(!dd.classList.contains('open')));
    dd.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) setOpen(false); });
    // Picking a link closes it — matters for same-page anchors like
    // visit.html#faq, where the page doesn't reload. "hush" stops the
    // hover rule from reopening it until the mouse leaves.
    dd.querySelector('.dd-menu').addEventListener('click', (e) => {
      if (!e.target.closest('a')) return;
      setOpen(false);
      dd.classList.add('hush');
    });
    dd.addEventListener('mouseleave', () => dd.classList.remove('hush'));
    // Tabbing out closes it; the window losing focus (relatedTarget null) doesn't.
    dd.addEventListener('focusout', (e) => { if (e.relatedTarget && !dd.contains(e.relatedTarget)) setOpen(false); });
  });

  // ---------- cart page ----------
  const itemsEl = document.querySelector('[data-cart-items]');
  if (itemsEl) {
    const sumEl = document.querySelector('[data-cart-summary]');
    const form = document.querySelector('[data-pickup]');
    const msg = form.querySelector('.form-msg');
    const submit = form.querySelector('button[type="submit"]');

    const lines = () => Object.entries(cart.get()).map(([id, qty]) => ({ p: byId(id), qty })).filter((l) => l.p);
    const money = (n) => `$${n.toFixed(2).replace(/\.00$/, '')}`;

    const render = () => {
      const ls = lines();
      if (!ls.length) {
        itemsEl.innerHTML = `<div class="cart-empty"><strong>Your cart is empty.</strong><p>Nothing set aside yet.</p><a class="btn" href="shop.html">Shop plants &rarr;</a></div>`;
      } else {
        itemsEl.innerHTML = ls.map(({ p, qty }) => `
          <div class="line" data-id="${esc(p.id)}">
            <img src="${photoUrl(p.photo, 176, 220)}" alt="" width="88" height="110">
            <div>
              <h3><a href="care.html#${esc(p.genus)}">${esc(p.name)}</a></h3>
              <span class="bot">${esc(p.botanical)}</span>
              <div class="tags line-tags"><span>${esc(p.lightLabel)}</span>${p.petSafe ? '<span class="safe">Pet-safe</span>' : ''}</div>
              ${qty >= p.stock ? `<span class="stock low">That&rsquo;s all ${p.stock} we have</span>` : ''}
            </div>
            <div class="line-end">
              <span class="price">${money(p.price * qty)}</span>
              <div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}">
                <button type="button" data-q="-1" aria-label="One fewer">&minus;</button>
                <output>${qty}</output>
                <button type="button" data-q="1" aria-label="One more"${qty >= p.stock ? ' disabled' : ''}>+</button>
              </div>
              <button class="remove" type="button" data-remove>Remove</button>
            </div>
          </div>`).join('');
      }
      const qty = ls.reduce((a, l) => a + l.qty, 0);
      sumEl.querySelector('[data-sum="qty"]').textContent = qty;
      const sub = ls.reduce((a, l) => a + l.p.price * l.qty, 0);
      sumEl.querySelector('[data-sum="sub"]').textContent = money(sub);
      // Shipping row: free for pickup; the speed's rate once rates are set,
      // otherwise "Quoted by email".
      const f = new FormData(form);
      const speed = SHIPPING.find((s) => s.id === f.get('speed'));
      const shipping = f.get('method') === 'ship';
      sumEl.querySelector('[data-sum="ship"]').textContent =
        !shipping ? 'Free pickup' : speed && speed.rate != null ? money(speed.rate) : 'Quoted by email';
      submit.disabled = !qty;
      submit.textContent = shipping ? 'Request shipping →' : 'Request pickup →';
    };

    itemsEl.addEventListener('click', (e) => {
      const line = e.target.closest('.line');
      if (!line) return;
      const c = cart.get();
      const id = line.dataset.id;
      const q = e.target.closest('[data-q]');
      if (q && !q.disabled) c[id] = (c[id] || 0) + Number(q.dataset.q); // cart.set caps at stock
      if (e.target.closest('[data-remove]')) delete c[id];
      cart.set(c);
      render();
    });

    // Next open days, skipping today once it's within 2 hours of close.
    const daySel = form.querySelector('[data-pickup-days]');
    const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const opts = [];
    for (let i = 0; opts.length < 6 && i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const h = HOURS[d.getDay()];
      if (!h || (i === 0 && hour >= h[1] - 2)) continue;
      opts.push(`<option>${i === 0 ? 'Today, ' : ''}${fmt.format(d)}</option>`);
    }
    daySel.innerHTML = opts.join('');

    // Shipping speeds (from SHIPPING) + pickup/ship toggle.
    const speedsEl = form.querySelector('[data-speeds]');
    speedsEl.innerHTML = SHIPPING.map((s, i) => `
      <label class="speed">
        <input type="radio" name="speed" value="${s.id}"${i === 0 ? ' checked' : ''}>
        <span><strong>${esc(s.label)}</strong><small>${esc(s.note)}</small></span>
        <em>${s.rate != null ? money(s.rate) : s.guaranteed ? 'Upgrade' : 'Standard'}</em>
      </label>`).join('');
    const syncMethod = () => {
      const ship = new FormData(form).get('method') === 'ship';
      form.querySelectorAll('[data-ship-only]').forEach((el) => { el.hidden = !ship; el.disabled = !ship; });
      form.querySelectorAll('[data-pickup-only]').forEach((el) => { el.hidden = ship; el.disabled = ship; });
      render();
    };
    form.addEventListener('change', (e) => { if (e.target.name === 'method' || e.target.name === 'speed') syncMethod(); });

    // No order backend yet: hand the request to the customer's email app.
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const ship = f.get('method') === 'ship';
      const bad = [...form.querySelectorAll('[required]')]
        .find((el) => !el.disabled && (!el.checkValidity() || !el.value.trim()));
      if (bad) {
        msg.classList.add('err');
        msg.textContent = ship ? 'Add your name, email, and full shipping address.' : 'Add your name and a valid email.';
        bad.focus();
        return;
      }
      const ls = lines();
      const speed = SHIPPING.find((s) => s.id === f.get('speed'));
      const body = [
        ship ? 'Shipping request' : 'Pickup request',
        '',
        ...ls.map((l) => `${l.qty} x ${l.p.name} (${l.p.sku}) - ${money(l.p.price * l.qty)}`),
        `Subtotal: ${sumEl.querySelector('[data-sum="sub"]').textContent}`,
        '',
        `Name: ${f.get('name')}`,
        `Email: ${f.get('email')}`,
        ...(ship
          ? [`Ship to: ${f.get('street')}, ${f.get('city')}, ${f.get('state')} ${f.get('zip')}`,
             `Speed: ${speed ? speed.label : ''}${speed && speed.guaranteed ? ' (guaranteed)' : ' (not guaranteed)'}`]
          : [`Pickup day: ${f.get('day')}`]),
        f.get('notes') ? `Notes: ${f.get('notes')}` : ''
      ].join('\n');
      msg.classList.remove('err');
      msg.textContent = ship
        ? 'Opening your email app — we’ll reply with the shipping cost before anything ships.'
        : 'Opening your email app — send it and we’ll confirm within a day.';
      location.href = `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent((ship ? 'Shipping request — ' : 'Pickup request — ') + f.get('name'))}&body=${encodeURIComponent(body)}`;
    });

    syncMethod();

    render();
  }

  // ---------- login (front end only — no auth backend yet) ----------
  const tabs = document.querySelectorAll('[data-tab]');
  if (tabs.length) {
    const authMsg = document.querySelector('[data-auth-msg]');
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', on);
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      authMsg.textContent = '';
    }));
    document.querySelectorAll('[data-auth]').forEach((form) => form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = [...form.querySelectorAll('[required]')].find((el) => !el.checkValidity() || !el.value.trim());
      if (bad) {
        authMsg.classList.add('err');
        authMsg.textContent = bad.type === 'password' && bad.value ? 'Password needs 8+ characters.' : 'Fill in every field.';
        bad.focus();
        return;
      }
      // Nothing is sent or stored. Clear the password field either way.
      form.querySelectorAll('input[type="password"]').forEach((el) => { el.value = ''; });
      authMsg.classList.remove('err');
      authMsg.textContent = 'Accounts open soon. Your cart is already saved on this device.';
    }));
  }

  // ---------- newsletter ----------
  // Not connected to a mailing service yet (team to choose one — see CLAUDE.md).
  // For now: validate, show a success state, and log the address.
  document.querySelectorAll('[data-signup]').forEach((form) => {
    const msg = form.parentElement.querySelector('.form-msg');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input.checkValidity() || !input.value) {
        msg.textContent = 'Check that email address.';
        msg.classList.add('err');
        input.focus();
        return;
      }
      console.info('[newsletter] signup (not sent anywhere yet):', input.value);
      msg.classList.remove('err');
      msg.textContent = 'You’re on the list. Next spotlight lands in your inbox.';
      form.reset();
    });
  });

  // ---------- footer year ----------
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
