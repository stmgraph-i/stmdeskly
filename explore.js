/* ============================================================
   DESKLY · EXPLORE
   Search engine. Two modes:
   - @username → jump to that exact profile
   - anything else → normal search
   ============================================================ */

(function initExplore(){

  const input    = document.getElementById('exploreInput');
  const tabs     = document.getElementById('exploreTabs');
  const status   = document.getElementById('exploreStatus');
  const results  = document.getElementById('exploreResults');
  const popular  = document.getElementById('explorePopular');

  const desksSection = document.getElementById('exploreDesksSection');
  const desksGrid    = document.getElementById('exploreDesksGrid');
  const desksTitle   = document.getElementById('exploreDesksTitle');

  const gigsSection  = document.getElementById('exploreGigsSection');
  const gigsList     = document.getElementById('exploreGigsList');
  const gigsTitle    = document.getElementById('exploreGigsTitle');

  const emptyBox     = document.getElementById('exploreEmpty');
  const emptySub     = document.getElementById('exploreEmptySub');

  if (!input || !results) return;

  let currentTab   = 'all';
  let currentQuery = '';
  let debounce     = null;
  let lastRequest  = 0;

  const urlParams = new URLSearchParams(location.search);
  const initialQ = urlParams.get('q');
  if (initialQ) {
    input.value = initialQ;
    currentQuery = initialQ;
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  function formatMoney(n){
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function capitalize(s){
    return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  }

  function showStatus(text){
    if (!status) return;
    if (text) {
      status.textContent = text;
      status.hidden = false;
    } else {
      status.hidden = true;
    }
  }

  /* ============================================================
     EXACT LOOKUP — @username, bare username, or pasted URL
     ============================================================ */

  function extractExactUsername(raw){
    const t = String(raw || '').trim();
    if (!t) return null;

    if (t.charAt(0) === '@') {
      const name = t.slice(1).toLowerCase().replace(/[^a-z0-9-]/g, '');
      return name.length >= 3 ? name : null;
    }

    if (/^https?:\/\//i.test(t) || /^stmdeskly\.pages\.dev/i.test(t) || /^[a-z0-9.-]+\.pages\.dev/i.test(t)) {
      let urlString = t;
      if (!/^https?:\/\//i.test(urlString)) urlString = 'https://' + urlString;
      try {
        const url = new URL(urlString);

        const q = url.searchParams.get('u');
        if (q) return q.toLowerCase().replace(/[^a-z0-9-]/g, '');

        const path = url.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
        if (path.startsWith('u/')) {
          const name = path.slice(2).replace(/[^a-z0-9-]/g, '');
          return name.length >= 3 ? name : null;
        }
        const parts = path.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || '';
        if (last && last.indexOf('.') === -1) {
          const name = last.replace(/[^a-z0-9-]/g, '');
          return name.length >= 3 ? name : null;
        }
      } catch(e) {
        return null;
      }
    }

    return null;
  }

  async function tryExactLookup(username){
    emptyBox.hidden = true;
    results.hidden = true;
    popular.hidden = true;
    showStatus('Looking up @' + username + '…');

    try {
      const desk = await DB.getDesk(username);

      if (!desk || !desk.username) {
        showStatus('');
        results.hidden = false;
        emptyBox.hidden = false;
        emptySub.textContent = 'No Desk found with the link @' + username + '.';
        return true;
      }

      window.location.href = 'profile.html?u=' + encodeURIComponent(desk.username);
      return true;
    } catch(e) {
      console.error(e);
      showStatus('');
      results.hidden = false;
      emptyBox.hidden = false;
      emptySub.textContent = 'Could not look up @' + username + '. Try again.';
      return true;
    }
  }

  /* ============================================================
     NORMAL SEARCH — cards now show @username
     ============================================================ */

  function renderDeskCard(desk){
    const card = document.createElement('a');
    card.className = 'explore-card ripple';
    card.href = 'profile.html?u=' + encodeURIComponent(desk.username);

    const initials = desk.initials || (desk.name || 'D').charAt(0).toUpperCase();
    const avatar = document.createElement('div');
    avatar.className = 'explore-avatar';

    if (desk.avatar_url) {
      avatar.style.backgroundImage = 'url("' + desk.avatar_url + '")';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
    } else {
      avatar.textContent = initials.toUpperCase();
      if (desk.accent) {
        avatar.style.background = desk.accentsoft || 'var(--accent-soft)';
        avatar.style.color = desk.accent;
      }
    }
    card.appendChild(avatar);

    const nameEl = document.createElement('div');
    nameEl.className = 'explore-name';
    nameEl.textContent = desk.name || 'Desk';
    card.appendChild(nameEl);

    if (desk.role) {
      const roleEl = document.createElement('div');
      roleEl.className = 'explore-role';
      roleEl.textContent = desk.role;
      card.appendChild(roleEl);
    }

    /* Show the @username so two same-name cards are distinguishable */
    if (desk.username) {
      const handleEl = document.createElement('div');
      handleEl.className = 'explore-handle';
      handleEl.textContent = '@' + desk.username;
      card.appendChild(handleEl);
    }

    if (desk.tagline) {
      const tag = document.createElement('div');
      tag.className = 'explore-tagline';
      tag.textContent = desk.tagline;
      card.appendChild(tag);
    }

    if (desk.location) {
      const loc = document.createElement('div');
      loc.className = 'explore-loc';
      loc.textContent = desk.location;
      card.appendChild(loc);
    }

    return card;
  }

  function renderDesks(list, parsed){
    desksGrid.innerHTML = '';

    if (!list.length) {
      desksSection.hidden = true;
      return;
    }

    if (parsed && parsed.searchTerm) {
      const role = parsed.searchTerm;
      const loc  = parsed.location ? ' in ' + capitalize(parsed.location) : '';
      desksTitle.textContent = capitalize(role) + 's' + loc + ' — ' + list.length;
    } else if (parsed && parsed.location) {
      desksTitle.textContent = 'Desks in ' + capitalize(parsed.location) + ' — ' + list.length;
    } else {
      desksTitle.textContent = 'Desks — ' + list.length;
    }

    list.forEach(d => desksGrid.appendChild(renderDeskCard(d)));
    desksSection.hidden = false;
  }

  function renderGigs(list, parsed){
    if (!gigsList) return;
    gigsList.innerHTML = '';

    if (!list || !list.length) {
      gigsSection.hidden = true;
      return;
    }

    gigsTitle.textContent = 'Gigs — ' + list.length;

    list.forEach(g => {
      const card = document.createElement('a');
      card.className = 'explore-gig';
      card.href = 'gig.html?id=' + encodeURIComponent(g.id);

      const type = document.createElement('div');
      type.className = 'explore-gig-type';
      type.textContent = g.type === 'need' ? 'Looking for' : 'Available';
      card.appendChild(type);

      const title = document.createElement('div');
      title.className = 'explore-gig-title';
      title.textContent = g.title || 'Gig';
      card.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'explore-gig-meta';
      const bits = [];
      if (g.location) bits.push(g.location);
      if (g.days)     bits.push(g.days);
      if (g.pay_min || g.pay_max) {
        const min = g.pay_min ? '₦' + formatMoney(g.pay_min) : '';
        const max = g.pay_max ? '₦' + formatMoney(g.pay_max) : '';
        const pay = min && max ? min + '–' + max : (min || max);
        const unit = g.pay_unit ? ' ' + g.pay_unit.replace(/_/g,' ') : '';
        bits.push(pay + unit);
      }
      meta.textContent = bits.join(' · ');
      card.appendChild(meta);

      gigsList.appendChild(card);
    });

    gigsSection.hidden = false;
  }

  /* ============================================================
     MAIN LOAD
     ============================================================ */

  async function load(){
    const exact = extractExactUsername(currentQuery);
    if (exact) {
      const handled = await tryExactLookup(exact);
      if (handled) return;
    }

    const reqId = ++lastRequest;
    emptyBox.hidden = true;
    results.hidden = true;
    popular.hidden = true;
    showStatus('Searching…');

    const parsed = window.SEARCH_PARSER
      ? SEARCH_PARSER.parse(currentQuery)
      : { raw: currentQuery, searchTerm: currentQuery, location: null, day: null, maxPrice: null, intent: 'all' };

    try {
      const desksRaw = await DB.searchDesks(parsed.searchTerm || '', 'all');

      let desks = (desksRaw || []).slice();

      if (parsed.location) {
        const loc = parsed.location.toLowerCase();
        const filtered = desks.filter(d => (d.location || '').toLowerCase().includes(loc));
        if (filtered.length) desks = filtered;
      }

      let gigs = [];
      if (typeof DB.searchGigs === 'function') {
        try {
          const gigOpts = {};
          if (parsed.intent === 'gigs') gigOpts.type = 'need';
          if (parsed.location) gigOpts.location = parsed.location;

          gigs = await DB.searchGigs(parsed.searchTerm || '', gigOpts);
          gigs = gigs || [];

          if (parsed.day) {
            const dayLower = parsed.day.toLowerCase();
            gigs = gigs.filter(g => (g.days || '').toLowerCase().includes(dayLower));
          }

          if (parsed.maxPrice) {
            gigs = gigs.filter(g => {
              const price = g.pay_min || g.pay_max || 0;
              return !price || price <= parsed.maxPrice;
            });
          }
        } catch(e) {
          console.error('searchGigs failed:', e);
          gigs = [];
        }
      }

      if (reqId !== lastRequest) return;

      showStatus('');

      const showDesks = currentTab !== 'gigs';
      const showGigs  = currentTab !== 'desks';

      const finalDesks = showDesks ? desks : [];
      const finalGigs  = showGigs  ? gigs  : [];

      if (!finalDesks.length && !finalGigs.length) {
        results.hidden = false;
        emptyBox.hidden = false;
        emptySub.textContent = parsed.searchTerm
          ? 'No matches for "' + parsed.searchTerm + '". Try different words.'
          : 'Try searching for what you need.';
        return;
      }

      if (parsed.intent === 'gigs' && finalGigs.length) {
        renderGigs(finalGigs, parsed);
        renderDesks(finalDesks, parsed);
      } else {
        renderDesks(finalDesks, parsed);
        renderGigs(finalGigs, parsed);
      }

      results.hidden = false;

    } catch (err) {
      console.error(err);
      if (reqId !== lastRequest) return;
      showStatus('');
      results.hidden = false;
      emptyBox.hidden = false;
      emptySub.textContent = 'Something went wrong. Try again.';
    }
  }

  /* ============================================================
     EVENTS
     ============================================================ */

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      currentQuery = input.value.trim();
      if (!currentQuery) {
        results.hidden = true;
        showStatus('');
        popular.hidden = false;
        return;
      }

      if (currentQuery.charAt(0) === '@') {
        const name = currentQuery.slice(1);
        if (name.length < 3) return;
        load();
        return;
      }

      load();
    }, 350);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounce);
      currentQuery = input.value.trim();
      if (!currentQuery) return;
      load();
    }
  });

  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.explore-tab');
      if (!btn) return;
      tabs.querySelectorAll('.explore-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab') || 'all';
      if (currentQuery && currentQuery.charAt(0) !== '@') load();
    });
  }

  if (popular) {
    popular.addEventListener('click', (e) => {
      const chip = e.target.closest('.explore-popular-chip');
      if (!chip) return;
      const q = chip.getAttribute('data-query') || '';
      input.value = q;
      currentQuery = q;
      popular.hidden = true;
      load();
    });
  }

  /* ============================================================
     BOOT
     ============================================================ */

  if (currentQuery) {
    load();
  } else {
    showStatus('');
    results.hidden = true;
    popular.hidden = false;
  }

})();