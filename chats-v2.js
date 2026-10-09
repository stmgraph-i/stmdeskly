/* ============================================================
   DESKLY · CHATS INBOX
   Chats tab: accepted + my outgoing pending
   Requests tab: incoming pending only
   Shows unread count per row
   ============================================================ */

(function initChats(){

  const root      = document.getElementById('chatsRoot');
  const noAuth    = document.getElementById('noAuth');
  const loading   = document.getElementById('chatsLoading');
  const emptyEl   = document.getElementById('chatsEmpty');
  const emptyTitle= document.getElementById('chatsEmptyTitle');
  const emptySub  = document.getElementById('chatsEmptySub');
  const emptyBtn  = document.getElementById('chatsEmptyBtn');
  const listEl    = document.getElementById('chatsList');
  const tabsEl    = document.getElementById('chatsTabs');
  const chatsBadge= document.getElementById('chatsBadge');
  const reqBadge  = document.getElementById('requestsBadge');

  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  let currentTab = 'chats';
  let allThreads = { accepted: [], pending: [], declined: [] };
  let userCache  = {};
  let lastMsgCache = {};
  let unreadCache = {};
  let currentUser = null;
  let lastTotalUnread = null;
  let pollTimer = null;
  let realtimeUnsub = null;

  function showLoading(on){
    if (!loading) return;
    loading.style.display = on ? 'block' : 'none';
  }

  function timeAgoShort(iso){
    if (!iso) return '';
    const t = new Date(iso).getTime();
    if (!t) return '';
    const sec = Math.floor((Date.now() - t) / 1000);
    if (sec < 60) return 'now';
    const min = Math.floor(sec / 60);
    if (min < 60) return min + 'm';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h';
    const day = Math.floor(hr / 24);
    if (day < 7) return day + 'd';
    const wk = Math.floor(day / 7);
    if (wk < 4) return wk + 'w';
    const mo = Math.floor(day / 30);
    return mo + 'mo';
  }

  async function getUser(userId){
    if (userCache[userId]) return userCache[userId];
    try {
      const u = await DB.getPublicUser(userId);
      if (u) userCache[userId] = u;
      return u || null;
    } catch(e) {
      return null;
    }
  }

  function classify(all){
    const myId = currentUser.id;
    const chats = [];
    const requests = [];

    (all.accepted || []).forEach(t => chats.push({ thread: t, kind: 'accepted' }));

    (all.pending || []).forEach(t => {
      if (t.initiated_by === myId) {
        chats.push({ thread: t, kind: 'outgoing' });
      } else {
        requests.push({ thread: t, kind: 'incoming' });
      }
    });

    return { chats, requests };
  }

  async function loadAll(){
    showLoading(true);
    emptyEl.hidden = true;
    listEl.innerHTML = '';

    try {
      allThreads = await DB.getMyThreads();

      const allUserIds = new Set();
      ['accepted', 'pending', 'declined'].forEach(k => {
        (allThreads[k] || []).forEach(t => {
          const other = t.user_a === currentUser.id ? t.user_b : t.user_a;
          allUserIds.add(other);
        });
      });
      await Promise.all([...allUserIds].map(id => getUser(id)));

      const allIds = [];
      ['accepted', 'pending', 'declined'].forEach(k => {
        (allThreads[k] || []).forEach(t => allIds.push(t.id));
      });

      if (allIds.length) {
        try {
          lastMsgCache = await DB.getLastMessages(allIds);
        } catch(e) {
          lastMsgCache = {};
        }
        try {
          unreadCache = await DB.getUnreadPerThread(allIds);
        } catch(e) {
          unreadCache = {};
        }
      }

      const totalUnread = Object.values(unreadCache).reduce((a,b) => a+b, 0);
      lastTotalUnread = totalUnread;

      showLoading(false);
      render();
    } catch(e) {
      console.error('[chats] loadAll failed:', e);
      showLoading(false);
      emptyEl.hidden = false;
      emptyTitle.textContent = 'Something went wrong';
      emptySub.textContent = e.message || 'Could not load your chats.';
      emptyBtn.hidden = true;
    }
  }

  async function silentRefresh(){
    try {
      if (!currentUser) return;

      const freshThreads = await DB.getMyThreads();
      const before = JSON.stringify(allThreads);
      const after = JSON.stringify(freshThreads);

      if (before === after) {
        const allIds = [];
        ['accepted', 'pending', 'declined'].forEach(k => {
          (freshThreads[k] || []).forEach(t => allIds.push(t.id));
        });
        if (allIds.length) {
          try {
            const freshUnread = await DB.getUnreadPerThread(allIds);
            const unreadChanged = JSON.stringify(unreadCache) !== JSON.stringify(freshUnread);
            if (unreadChanged) {
              unreadCache = freshUnread;
              render();
            }

            const totalUnread = Object.values(freshUnread).reduce((a,b) => a+b, 0);
            if (lastTotalUnread !== null && totalUnread > lastTotalUnread && window.NOTIFY) {
              const diff = totalUnread - lastTotalUnread;
              NOTIFY.show(
                'New message' + (diff > 1 ? 's' : ''),
                diff + ' new message' + (diff > 1 ? 's' : '') + ' on Deskly',
                { threadId: null }
              );
            }
            lastTotalUnread = totalUnread;
          } catch(e) { /* skip */ }
        }
        return;
      }

      allThreads = freshThreads;

      const allUserIds = new Set();
      ['accepted', 'pending', 'declined'].forEach(k => {
        (freshThreads[k] || []).forEach(t => {
          const other = t.user_a === currentUser.id ? t.user_b : t.user_a;
          allUserIds.add(other);
        });
      });
      await Promise.all([...allUserIds].map(id => getUser(id)));

      const allIds = [];
      ['accepted', 'pending', 'declined'].forEach(k => {
        (freshThreads[k] || []).forEach(t => allIds.push(t.id));
      });

      if (allIds.length) {
        try {
          lastMsgCache = await DB.getLastMessages(allIds);
        } catch(e) { lastMsgCache = {}; }
        try {
          unreadCache = await DB.getUnreadPerThread(allIds);
        } catch(e) { unreadCache = {}; }
      }

      const totalUnread = Object.values(unreadCache).reduce((a,b) => a+b, 0);
      if (lastTotalUnread !== null && totalUnread > lastTotalUnread && window.NOTIFY) {
        const diff = totalUnread - lastTotalUnread;
        NOTIFY.show(
          'New message' + (diff > 1 ? 's' : ''),
          diff + ' new message' + (diff > 1 ? 's' : '') + ' on Deskly',
          { threadId: null }
        );
      }
      lastTotalUnread = totalUnread;

      render();
    } catch(e) {
      /* Silent */
    }
  }

  function startPolling(){
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(silentRefresh, 8000);
  }

  function startRealtime(){
    if (!DB.subscribeToMyThreads) return;
    if (!currentUser) return;

    if (realtimeUnsub) {
      try { realtimeUnsub(); } catch(e) {}
      realtimeUnsub = null;
    }

    realtimeUnsub = DB.subscribeToMyThreads(() => {
      silentRefresh();
    });
  }

  function renderBadges(){
    const cls = classify(allThreads);
    const incomingCount = cls.requests.length;

    if (incomingCount > 0) {
      reqBadge.textContent = String(incomingCount);
      reqBadge.hidden = false;
      chatsBadge.textContent = String(incomingCount);
      chatsBadge.hidden = false;
    } else {
      reqBadge.hidden = true;
      chatsBadge.hidden = true;
    }
  }

  function render(){
    renderBadges();

    const cls = classify(allThreads);

    if (currentTab === 'chats') {
      renderList(cls.chats, 'chats');
    } else {
      renderList(cls.requests, 'requests');
    }
  }

  function renderList(items, mode){
    listEl.innerHTML = '';

    if (!items || !items.length) {
      emptyEl.hidden = false;
      if (mode === 'requests') {
        emptyTitle.textContent = 'No requests';
        emptySub.textContent = 'When someone messages you for the first time, their request will appear here.';
        emptyBtn.hidden = true;
      } else {
        emptyTitle.textContent = 'No chats yet';
        emptySub.textContent = 'Find someone on Explore and tap Message to start a conversation.';
        emptyBtn.hidden = false;
      }
      return;
    }

    emptyEl.hidden = true;

    items.forEach(item => {
      listEl.appendChild(buildRow(item.thread, item.kind));
    });
  }

  function buildRow(thread, kind){
    const otherId = thread.user_a === currentUser.id ? thread.user_b : thread.user_a;
    const other = userCache[otherId];

    const row = document.createElement('div');
    row.className = 'chat-row';

    if (kind === 'accepted' || kind === 'outgoing') {
      row.classList.add('chat-row-tappable');
      row.addEventListener('click', () => {
        window.location.href = 'chat.html?id=' + encodeURIComponent(thread.id);
      });
    }

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    if (other && other.avatar_url) {
      avatar.style.backgroundImage = 'url("' + other.avatar_url + '")';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
    } else {
      const initials = (other && other.initials) || (other && other.name ? other.name.charAt(0) : '?');
      avatar.textContent = String(initials).toUpperCase().slice(0, 2);
    }
    row.appendChild(avatar);

    const body = document.createElement('div');
    body.className = 'chat-row-body';

    const top = document.createElement('div');
    top.className = 'chat-row-top';

    const name = document.createElement('span');
    name.className = 'chat-row-name';
    name.textContent = (other && other.name) ? other.name : 'Someone';
    top.appendChild(name);

    if (other && other.role) {
      const role = document.createElement('span');
      role.className = 'chat-row-role';
      role.textContent = '· ' + other.role;
      top.appendChild(role);
    }

    const time = document.createElement('span');
    time.className = 'chat-row-time';
    time.textContent = timeAgoShort(thread.last_message_at);
    top.appendChild(time);

    body.appendChild(top);

    const preview = document.createElement('div');
    preview.className = 'chat-row-preview';

    const last = lastMsgCache[thread.id];
    if (last) {
      if (last.photo_url && !last.body) {
        preview.textContent = '📷 Photo';
      } else {
        const isMe = last.sender_id === currentUser.id;
        preview.textContent = (isMe ? 'You: ' : '') + (last.body || '');
      }
    } else {
      preview.textContent = 'No messages yet';
      preview.classList.add('chat-row-preview-quiet');
    }
    body.appendChild(preview);

    if (kind === 'outgoing') {
      const waiting = document.createElement('div');
      waiting.className = 'chat-row-waiting';
      waiting.textContent = 'Waiting for reply';
      body.appendChild(waiting);
    }

    row.appendChild(body);

    const unreadCount = unreadCache[thread.id] || 0;
    if (unreadCount > 0) {
      const pill = document.createElement('span');
      pill.className = 'chat-row-unread';
      pill.textContent = String(unreadCount > 99 ? '99+' : unreadCount);
      row.appendChild(pill);
    }

    if (kind === 'incoming') {
      const actions = document.createElement('div');
      actions.className = 'chat-row-actions';

      const acceptBtn = document.createElement('button');
      acceptBtn.type = 'button';
      acceptBtn.className = 'chat-action chat-action-accept ripple';
      acceptBtn.textContent = 'Accept';
      acceptBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        acceptBtn.disabled = true;
        acceptBtn.textContent = '...';
        try {
          await DB.acceptThread(thread.id);
          await loadAll();
        } catch(err) {
          console.error(err);
          acceptBtn.disabled = false;
          acceptBtn.textContent = 'Accept';
          alert(err.message || 'Could not accept.');
        }
      });
      actions.appendChild(acceptBtn);

      const declineBtn = document.createElement('button');
      declineBtn.type = 'button';
      declineBtn.className = 'chat-action chat-action-decline';
      declineBtn.setAttribute('aria-label', 'Decline');
      declineBtn.innerHTML = ICON_CLOSE;
      declineBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Decline this request?')) return;
        declineBtn.disabled = true;
        try {
          await DB.declineThread(thread.id);
          await loadAll();
        } catch(err) {
          console.error(err);
          declineBtn.disabled = false;
          alert(err.message || 'Could not decline.');
        }
      });
      actions.appendChild(declineBtn);

      row.appendChild(actions);
    }

    return row;
  }

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.chats-tab');
    if (!btn) return;
    tabsEl.querySelectorAll('.chats-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.getAttribute('data-tab') || 'chats';
    render();
  });

  (async function init(){
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

    currentUser = DB.currentUser();

    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'requests') {
      currentTab = 'requests';
      tabsEl.querySelectorAll('.chats-tab').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'requests');
      });
    }

    noAuth.style.display = 'none';
    root.style.display = '';

    await loadAll();

    startRealtime();
    startPolling();

    window.addEventListener('beforeunload', () => {
      if (pollTimer) clearInterval(pollTimer);
      if (realtimeUnsub) {
        try { realtimeUnsub(); } catch(e) {}
      }
    });
  })();

})();