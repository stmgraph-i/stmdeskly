/* ============================================================
   STMDESKLY · BOTTOM TAB BAR
   Injected on signed-in pages. 4 tabs, always visible on mobile.
   Settings lives in the top-right menu, not here.
   Advanced badge: count pill + pulsing request dot.
   ============================================================ */

(function initTabbar(){

  if (!document.body.classList.contains('signed-in')) return;
  if (document.body.classList.contains('page-bot')) return;

  const bar = document.createElement('nav');
  bar.className = 'tabbar';
  bar.setAttribute('aria-label', 'Main navigation');
  bar.innerHTML = `
    <a class="tabbar-item" data-tab="home" href="home.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12l9-9 9 9"/>
        <path d="M5 10v10h14V10"/>
      </svg>
      <span>Home</span>
    </a>

    <a class="tabbar-item" data-tab="explore" href="explore.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <span>Explore</span>
    </a>

    <a class="tabbar-item" data-tab="desk" href="dashboard.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M3 10h18"/>
      </svg>
      <span>My Desk</span>
    </a>

    <a class="tabbar-item" data-tab="chats" href="chats.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
      </svg>
      <span>Inbox</span>
      <span class="tabbar-badge" id="tabbarChatsBadge" hidden>0</span>
      <span class="tabbar-request-dot" id="tabbarRequestDot" hidden></span>
    </a>
  `;

  document.body.appendChild(bar);

  /* ---- Highlight the active tab ---- */
  const rawPath = location.pathname.split('/').pop() || '';
  let base = rawPath.replace(/\.html$/i, '').replace(/\/$/, '').toLowerCase();
  if (!base) base = 'index';

  const activeMap = {
    'home':      'home',
    'explore':   'explore',
    'dashboard': 'desk',
    'chats':     'chats',
    'chat':      'chats',
    'profile':   'explore',
    'desk':      'explore',
    'gig':       'explore',
    'post-gig':  'chats'
    /* settings, bot — no tab highlight (they live in the menu) */
  };

  const activeTab = activeMap[base];
  if (activeTab) {
    const el = bar.querySelector('[data-tab="' + activeTab + '"]');
    if (el) el.classList.add('active');
  }

  /* ---- Advanced badge ---- */
  (async function loadChatsBadge(){
    try {
      if (!window.DB || !DB.ready || !DB.currentUser()) return;

      const me = DB.currentUser();

      /* Incoming pending requests */
      const all = await DB.getMyThreads();
      const incoming = (all.pending || []).filter(t => t.initiated_by !== me.id);
      const requestCount = incoming.length;

      /* Unread messages from others */
      let unreadCount = 0;
      try {
        unreadCount = await DB.getUnreadCount();
      } catch(e) { unreadCount = 0; }

      const badge = document.getElementById('tabbarChatsBadge');
      const dot   = document.getElementById('tabbarRequestDot');
      const item  = bar.querySelector('[data-tab="chats"]');

      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = String(unreadCount > 99 ? '99+' : unreadCount);
          badge.hidden = false;
        } else {
          badge.hidden = true;
        }
      }

      if (dot) {
        if (requestCount > 0) {
          dot.hidden = false;
        } else {
          dot.hidden = true;
        }
      }

      if (item) {
        item.classList.toggle('has-count', unreadCount > 0);
        item.classList.toggle('has-requests', requestCount > 0);
      }

    } catch(e) { /* silent */ }
  })();

})();
