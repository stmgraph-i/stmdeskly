/* ============================================================
   DESKLY · BOTTOM TAB BAR
   Injected on signed-in pages. 5 tabs, always visible on mobile.
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
      <span>Chats</span>
      <span class="tabbar-badge" id="tabbarChatsBadge" hidden>0</span>
    </a>

    <a class="tabbar-item" data-tab="settings" href="settings.html">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span>Settings</span>
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
    'settings':  'settings',
    'bot':       'settings',
    'profile':   'explore',
    'desk':      'explore',
    'gig':       'explore',
    'post-gig':  'chats'
  };

  const activeTab = activeMap[base];
  if (activeTab) {
    const el = bar.querySelector('[data-tab="' + activeTab + '"]');
    if (el) el.classList.add('active');
  }

  /* ---- Show badge: only incoming requests + unread received messages ---- */
  (async function loadChatsBadge(){
    try {
      if (!window.DB || !DB.ready || !DB.currentUser()) return;

      const me = DB.currentUser();

      /* Count incoming pending requests only */
      const all = await DB.getMyThreads();
      const incoming = (all.pending || []).filter(t => t.initiated_by !== me.id);
      const requestCount = incoming.length;

      /* Count unread messages from others */
      let unreadCount = 0;
      try {
        unreadCount = await DB.getUnreadCount();
      } catch(e) { unreadCount = 0; }

      const total = requestCount + unreadCount;

      const badge = document.getElementById('tabbarChatsBadge');
      if (badge) {
        if (total > 0) {
          badge.textContent = String(total > 99 ? '99+' : total);
          badge.hidden = false;
        } else {
          badge.hidden = true;
        }
      }
    } catch(e) { /* silent */ }
  })();

})();