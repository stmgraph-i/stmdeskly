/* ============================================================
   DESKLY · HOME
   Adaptive home page. Reads your role + location to show
   what's relevant. Falls back to popular gigs and Desks.
   ============================================================ */

(function initHome(){

  const root    = document.getElementById('homeRoot');
  const loading = document.getElementById('homeLoading');
  const noAuth  = document.getElementById('noAuth');

  const $ = (id) => document.getElementById(id);

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  function formatMoney(n){
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function showLoading(on){
    if (!loading) return;
    loading.style.display = on ? 'block' : 'none';
  }

  async function init(){
    if (!window.DB || !DB.ready) {
      showLoading(false);
      noAuth.style.display = 'block';
      return;
    }

    if (!DB.currentUser()) {
      await new Promise(r => setTimeout(r, 400));
    }
    if (!DB.currentUser()) {
      showLoading(false);
      window.location.replace('login.html');
      return;
    }

    let desk;
    try { desk = await DB.getMyDesk(); }
    catch (err) {
      console.error(err);
      showLoading(false);
      noAuth.querySelector('h1').textContent = 'Something went wrong';
      noAuth.querySelector('p').textContent  = 'We could not load your Desk.';
      noAuth.style.display = 'block';
      return;
    }

    if (!desk) { showLoading(false); window.location.replace('signup.html'); return; }

    const firstName = (desk.name || '').split(/\s+/)[0] || '';
    $('homeHello').textContent = firstName ? 'Hi, ' + firstName + '.' : 'Hi.';
    $('homeSub').textContent = 'Here\u2019s what\u2019s on Deskly today.';

    const searchInput = $('homeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) window.location.href = 'explore.html?q=' + encodeURIComponent(q);
        }
      });
    }

    const avatar = $('homeDeskAvatar');
    if (avatar) {
      if (desk.avatar_url) {
        avatar.textContent = '';
        avatar.style.backgroundImage = 'url("' + desk.avatar_url + '")';
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.classList.add('has-image');
      } else {
        avatar.textContent = (desk.initials || 'D').toUpperCase();
      }
    }
    $('homeDeskName').textContent = desk.name || 'Your Desk';
    $('homeDeskRole').textContent = desk.role || '';

    const profile = buildProfile(desk);

    const gigsTitle = $('homeGigsTitle');
    const laneTitle = $('homeLaneTitle');

    if (gigsTitle) {
      if (profile.isProvider && profile.role) {
        gigsTitle.textContent = 'Gigs for ' + profile.role.toLowerCase() + 's';
      } else if (profile.isHirer && profile.role) {
        gigsTitle.textContent = profile.role.toLowerCase() + 's available';
      } else {
        gigsTitle.textContent = 'Gigs on Deskly';
      }
    }

    if (laneTitle) {
      if (profile.role) {
        laneTitle.textContent = 'Other ' + profile.role.toLowerCase() + 's';
      } else {
        laneTitle.textContent = 'Desks near you';
      }
    }

    const gigsSection = $('homeGigs');
    if (gigsSection && !gigsSection.querySelector('.home-see-more')) {
      const link = document.createElement('a');
      link.className = 'home-see-more';
      link.href = 'explore.html' + (profile.role ? '?q=' + encodeURIComponent(profile.role) : '');
      link.innerHTML = 'See all <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;vertical-align:-2px;margin-left:4px;"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
      gigsSection.appendChild(link);
    }

    try {
      await Promise.all([
        loadGigs(desk, profile),
        loadDesks(desk, profile)
      ]);
    } catch(e) {
      console.error(e);
    }

    showLoading(false);
    root.style.display = '';
  }

  function buildProfile(desk){
    const role = (desk.role || '').toLowerCase().trim();
    const location = (desk.location || '').toLowerCase().trim();
    const type = desk.type || 'person';
    const available = desk.available_for_gigs === true;
    const gigRoles = (desk.gig_roles || '').toLowerCase().trim();

    const isHirer = (type === 'organisation') || (type === 'business' && !available);
    const isProvider = !isHirer;

    return {
      role:       role || gigRoles,
      location:   location,
      type:       type,
      available:  available,
      isProvider: isProvider,
      isHirer:    isHirer
    };
  }

  async function loadGigs(desk, profile){
    const body = $('homeGigsBody');
    if (!body) return;

    const gigType = profile.isHirer ? 'available' : 'need';
    const query = profile.isHirer ? '' : (profile.role || '');

    let gigs = [];
    try {
      gigs = await DB.searchGigs(query, { type: gigType });
      gigs = (gigs || []).slice(0, 4);
    } catch(e) {
      console.error('loadGigs failed:', e);
    }

    body.innerHTML = '';

    if (!gigs.length) {
      const msg = profile.isHirer
        ? 'No one listed as available yet. '
        : 'No open gigs yet. ';
      body.innerHTML =
        '<p class="home-empty">' + msg +
        '<a href="post-gig.html" class="home-empty-link">Post one</a></p>';
      return;
    }

    gigs.forEach(g => {
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
        bits.push(pay);
      }
      meta.textContent = bits.join(' · ');
      card.appendChild(meta);

      body.appendChild(card);
    });
  }

  async function loadDesks(desk, profile){
    const laneBody = $('homeLaneBody');
    const alsoBody = $('homeAlsoBody');
    if (!laneBody || !alsoBody) return;

    const all = await DB.searchDesks('', 'all');
    const others = (all || []).filter(d => d.id !== desk.id);

    const sameLane = others.filter(d => {
      const r = (d.role || '').toLowerCase().trim();
      if (!profile.role || !r) return false;
      return r.includes(profile.role) || profile.role.includes(r);
    });

    const otherLane = others.filter(d => !sameLane.includes(d));

    function sortByCity(list){
      return list.slice().sort((a, b) => {
        const aMatch = profile.location && (a.location || '').toLowerCase().includes(profile.location);
        const bMatch = profile.location && (b.location || '').toLowerCase().includes(profile.location);
        if (aMatch && !bMatch) return -1;
        if (bMatch && !aMatch) return 1;
        return 0;
      });
    }

    const sortedSame  = sortByCity(sameLane).slice(0, 4);
    const sortedOther = sortByCity(otherLane).slice(0, 6);

    renderDeskList(
      laneBody,
      sortedSame,
      profile.role
        ? 'No other ' + profile.role + 's on Deskly yet.'
        : 'Complete your role to see your lane.'
    );

    renderDeskList(
      alsoBody,
      sortedOther,
      'Nobody else on Deskly yet.'
    );
  }

  /* ----------------------------------------------------------------
     MINI DESK CARD — now shows the @username
     ---------------------------------------------------------------- */
  function renderDeskList(container, list, emptyMsg){
    if (!container) return;
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = '<p class="home-empty">' + escapeHtml(emptyMsg) + '</p>';
      return;
    }

    list.forEach(d => {
      const card = document.createElement('a');
      card.className = 'home-desk-mini ripple';
      card.href = 'profile.html?u=' + encodeURIComponent(d.username);

      const av = document.createElement('div');
      av.className = 'home-desk-mini-avatar';
      if (d.avatar_url) {
        av.style.backgroundImage = 'url("' + d.avatar_url + '")';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
      } else {
        const initials = d.initials || (d.name || 'D').charAt(0).toUpperCase();
        av.textContent = initials.toUpperCase();
        if (d.accent) {
          av.style.background = d.accentsoft || 'var(--accent-soft)';
          av.style.color = d.accent;
        }
      }
      card.appendChild(av);

      const info = document.createElement('div');
      info.className = 'home-desk-mini-info';

      const name = document.createElement('div');
      name.className = 'home-desk-mini-name';
      name.textContent = d.name || 'Desk';
      info.appendChild(name);

      /* Role + @username on the same line */
      const subParts = [];
      if (d.role) subParts.push(d.role);

      if (subParts.length || d.username) {
        const sub = document.createElement('div');
        sub.className = 'home-desk-mini-role';
        if (d.role) {
          sub.textContent = d.role;
          info.appendChild(sub);
        }

        if (d.username) {
          const handle = document.createElement('div');
          handle.className = 'home-desk-mini-handle';
          handle.textContent = '@' + d.username;
          info.appendChild(handle);
        }
      }

      if (d.location) {
        const loc = document.createElement('div');
        loc.className = 'home-desk-mini-loc';
        loc.textContent = d.location;
        info.appendChild(loc);
      }

      card.appendChild(info);
      container.appendChild(card);
    });
  }

  init();

})();