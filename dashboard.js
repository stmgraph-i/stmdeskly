/* ============================================================
   DESKLY · DASHBOARD (view)
   ============================================================ */

(function initDashboard(){

  const root      = document.getElementById('dashboardRoot');
  const loading   = document.getElementById('dashLoading');
  const noAuth    = document.getElementById('noAuth');
  const $ = (id) => document.getElementById(id);

  const linkEl   = $('deskLink');
  const copyBtn  = $('copyBtn');
  const viewBtn  = $('viewBtn');
  const shareBtn = $('shareBtn');

  /* ---- Icons (inline SVG) ---- */
  const ICON_ARROW_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';

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

    showLoading(true);

    const user = DB.currentUser();
    if (!user) {
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
      noAuth.querySelector('p').textContent  = err.message || 'We could not load your Desk.';
      noAuth.style.display = 'block';
      return;
    }

    if (!desk) { showLoading(false); window.location.replace('signup.html'); return; }

    const name = desk.name || 'Your Desk';
    $('dashGreet').textContent    = 'Welcome back.';
    $('dashHeadline').textContent = name;

    /* Avatar */
    const avatarEl = $('dashAvatar');
    if (avatarEl) {
      if (desk.avatar_url) {
        avatarEl.textContent = '';
        avatarEl.style.backgroundImage = 'url("' + desk.avatar_url + '")';
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.classList.add('has-image');
      } else {
        avatarEl.textContent = (desk.initials || 'D');
      }
    }

    $('viewName').textContent = desk.name || '—';
    $('viewRole').textContent = desk.role || '—';

    if (desk.tagline && desk.tagline.trim()) {
      $('viewTagline').textContent = desk.tagline;
      $('rowTagline').hidden = false;
    }

    /* Offer */
    const offerSource = (desk.type === 'business' && desk.products) ? desk.products : desk.services;
    const offerItems  = (offerSource || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (offerItems.length) {
      const list = $('viewOffer');
      list.innerHTML = '';
      offerItems.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        list.appendChild(li);
      });
      $('secOffer').hidden = false;
    }

    /* About */
    if (desk.about && desk.about.trim()) {
      $('viewAbout').textContent = desk.about.trim();
      $('secAbout').hidden = false;
    }

    /* Work */
    let photos = [];
    try {
      photos = desk.photos ? JSON.parse(desk.photos) : [];
      if (!Array.isArray(photos)) photos = [];
    } catch(e) { photos = []; }

    if (photos.length) {
      const wrap = $('viewPhotos');
      wrap.innerHTML = '';
      photos.forEach(url => {
        const tile = document.createElement('div');
        tile.className = 'dash-photo';
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        tile.appendChild(img);
        wrap.appendChild(tile);
      });
      $('secWork').hidden = false;
    }

    /* Details */
    const details = [];
    if (desk.location && desk.location.trim()) {
      details.push({ label: desk.type === 'person' ? 'Service area' : 'Location', value: desk.location.trim() });
    }
    if (desk.opening_hours && desk.opening_hours.trim()) {
      details.push({ label: 'Opening hours', value: desk.opening_hours.trim() });
    }
    if (desk.service_times && desk.service_times.trim()) {
      details.push({ label: 'Service times', value: desk.service_times.trim() });
    }
    if (desk.programmes && desk.programmes.trim()) {
      details.push({ label: 'Programmes', value: desk.programmes.trim(), multi: true });
    }
    if (desk.facilities && desk.facilities.trim()) {
      details.push({ label: 'Facilities', value: desk.facilities.trim(), multi: true });
    }

    if (details.length) {
      const wrap = $('viewDetails');
      wrap.innerHTML = '';
      details.forEach(d => {
        const row = document.createElement('div');
        row.className = 'dash-row' + (d.multi ? ' dash-row-multi' : '');
        row.innerHTML =
          '<span class="dash-label">' + d.label + '</span>' +
          '<span class="dash-value">' + d.value.replace(/\n/g, '<br>') + '</span>';
        wrap.appendChild(row);
      });
      $('secDetails').hidden = false;
    }

    /* Contact */
    if (desk.whatsapp) {
      const wa = desk.whatsapp;
      $('viewWhatsapp').textContent = '+' + wa.slice(0,3) + ' ' + wa.slice(3,6) + ' ' + wa.slice(6,9) + ' ' + wa.slice(9);
      $('secContact').hidden = false;
    }

    /* ----- Visits ----- */
    try {
      const visits = await DB.getMyVisits(desk.id);
      renderVisits(visits);
    } catch(e) {
      console.error('Visits failed:', e);
    }

    /* ----- Unanswered questions ----- */
    try {
      const unanswered = await DB.getUnanswered(desk.id);
      renderUnanswered(unanswered, desk);
    } catch(e) {
      console.error('Unanswered failed:', e);
    }

    /* ----- Link + share ----- */
    const url = SUPABASE_CONFIG.siteUrl + '/desk.html?u=' + desk.username;
    const shareTitle = name + ' on Deskly';

    linkEl.textContent = url;
    viewBtn.href = url + '&from=owner';

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1400);
      } catch(e) { copyBtn.textContent = 'Tap and hold'; }
    });

    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: shareTitle,
              url: url
            });
          } catch(e) { /* cancelled */ }
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
          shareBtn.textContent = 'Copied';
          setTimeout(() => { shareBtn.textContent = 'Share'; }, 1400);
        } catch(e) {
          shareBtn.textContent = 'Tap and hold';
          setTimeout(() => { shareBtn.textContent = 'Share'; }, 1600);
        }
      });
    }

    /* ----- Invite someone ----- */
    const inviteBtn = $('inviteBtn');
    if (inviteBtn) {
      const siteUrl = (SUPABASE_CONFIG.siteUrl || location.origin) + '/index.html';
      const inviteTitle = 'Try Deskly';
      const inviteMessage = 'Check out Deskly — a place to share who you are and what you do:\n' + siteUrl;

      inviteBtn.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: inviteTitle,
              text: inviteMessage,
              url: siteUrl
            });
          } catch(e) { /* cancelled */ }
          return;
        }
        try {
          await navigator.clipboard.writeText(inviteMessage);
          inviteBtn.textContent = 'Link copied';
          setTimeout(() => { inviteBtn.textContent = 'Share Deskly'; }, 1400);
        } catch(e) {
          inviteBtn.textContent = 'Tap and hold';
          setTimeout(() => { inviteBtn.textContent = 'Share Deskly'; }, 1600);
        }
      });
    }

    /* Remember this account with its desk data */
    if (DB.rememberAccount && DB.currentUser()) {
      DB.rememberAccount(DB.currentUser().email, {
        name: desk.name || '',
        initials: desk.initials || '',
        avatar_url: desk.avatar_url || ''
      });
    }

    showLoading(false);
    root.style.display = '';

    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
    });
  }

  /* ---------------- RENDER VISITS ---------------- */

  function renderVisits(visits){
    const sec = document.getElementById('secViews');
    const chart = document.getElementById('viewChart');
    if (!sec || !chart) return;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    let today = 0, week = 0;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      days.push({ date: d, count: 0 });
    }

    visits.forEach(v => {
      const t = new Date(v.visited_at);
      if (t >= startOfToday) today++;
      if (t >= startOfWeek) week++;

      for (const d of days) {
        const next = new Date(d.date);
        next.setDate(next.getDate() + 1);
        if (t >= d.date && t < next) {
          d.count++;
          break;
        }
      }
    });

    document.getElementById('viewToday').textContent = today;
    document.getElementById('viewWeek').textContent  = week;
    document.getElementById('viewAll').textContent   = visits.length;

    const max = Math.max(...days.map(d => d.count), 1);
    chart.innerHTML = '';
    days.forEach(d => {
      const bar = document.createElement('div');
      bar.className = 'dash-view-bar';
      const height = Math.max(4, Math.round((d.count / max) * 100));
      bar.style.height = height + '%';
      bar.title = d.count + ' on ' + d.date.toDateString().slice(0, 10);
      chart.appendChild(bar);
    });

    sec.hidden = false;
  }

  /* ---------------- RENDER UNANSWERED ---------------- */

  function renderUnanswered(list, desk){
    const sec = document.getElementById('secUnanswered');
    const ul = document.getElementById('unansweredList');
    const clearBtn = document.getElementById('clearUnanswered');
    if (!sec || !ul) return;

    const grouped = [];
    const seen = {};

    list.forEach(row => {
      const key = String(row.question || '').toLowerCase().trim();
      if (!key) return;
      if (seen[key]) {
        seen[key].count++;
      } else {
        seen[key] = { question: row.question, ids: [row.id], count: 1 };
        grouped.push(seen[key]);
      }
    });

    grouped.sort((a, b) => b.count - a.count);

    if (!grouped.length) {
      sec.hidden = true;
      return;
    }

    ul.innerHTML = '';
    grouped.slice(0, 20).forEach(g => {
      const li = document.createElement('li');
      li.className = 'dash-unanswered-item';

      const q = document.createElement('div');
      q.className = 'dash-unanswered-q';
      q.textContent = g.question;
      if (g.count > 1) {
        const badge = document.createElement('span');
        badge.className = 'dash-unanswered-count';
        badge.textContent = '×' + g.count;
        q.appendChild(badge);
      }
      li.appendChild(q);

      const actions = document.createElement('div');
      actions.className = 'dash-unanswered-actions';

      const answerBtn = document.createElement('a');
      answerBtn.className = 'dash-unanswered-answer';
      answerBtn.href = 'bot.html?ask=' + encodeURIComponent(g.question);
      /* Arrow as SVG */
      answerBtn.innerHTML = 'Answer ' + ICON_ARROW_RIGHT;
      actions.appendChild(answerBtn);

      const dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.className = 'dash-unanswered-dismiss';
      dismissBtn.setAttribute('aria-label', 'Dismiss');
      dismissBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
      dismissBtn.addEventListener('click', async () => {
        for (const id of g.ids) {
          try { await DB.deleteUnanswered(id); } catch(e) {}
        }
        li.remove();
        if (!ul.children.length) sec.hidden = true;
      });
      actions.appendChild(dismissBtn);

      li.appendChild(actions);
      ul.appendChild(li);
    });

    if (clearBtn) {
      clearBtn.onclick = async () => {
        if (!confirm('Clear all unanswered questions?')) return;
        for (const row of list) {
          try { await DB.deleteUnanswered(row.id); } catch(e) {}
        }
        ul.innerHTML = '';
        sec.hidden = true;
      };
    }

    sec.hidden = false;
  }

  init();

})();