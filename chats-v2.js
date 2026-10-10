/* ============================================================
   STMDESKLY · INBOX
   Fixed tabs: Inbox, Requests, Updates, Archived
   Optional tabs: Sent, Pinned, Muted
   Custom tabs: user-created keyword filters
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
  const pill      = document.getElementById('chatsPill');
  const chatsBadge= document.getElementById('chatsBadge');
  const reqBadge  = document.getElementById('requestsBadge');
  const addBtn    = document.getElementById('chatsTabAdd');

  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  const ICON_ARCHIVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></svg>';
  const ICON_UNARCHIVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M12 17v-5M9.5 14.5L12 12l2.5 2.5"/></svg>';
  const ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
  const ICON_UNPIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><line x1="12" y1="17" x2="12" y2="22"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h9.5"/><path d="M16 6V4"/><path d="M8 4h8"/></svg>';
  const ICON_MUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-9.33-5"/><path d="M6 8c0 7-3 9-3 9h16"/><path d="M6.26 6.26A6 6 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';
  const ICON_UNMUTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14"/></svg>';

  const ICON_NOTIF_REVIEW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  const ICON_NOTIF_QUESTION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1.1-1 1.9v.2"/><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none"/></svg>';
  const ICON_NOTIF_WHATSAPP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3l-9 9"/><path d="M21 3h-6"/><path d="M21 3v6"/></svg>';
  const ICON_NOTIF_GIG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  const ICON_NOTIF_VIEW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const ICON_NOTIF_DEFAULT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';

  const OPTIONAL_TABS = [
    { key: 'sent',   label: 'Sent' },
    { key: 'pinned', label: 'Pinned' },
    { key: 'muted',  label: 'Muted' }
  ];
  const OPTIONAL_KEY = 'fd_optional_tabs';
  const CUSTOM_KEY   = 'fd_custom_tabs';

  function getOptionalTabs(){
    try {
      const raw = localStorage.getItem(OPTIONAL_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(k => OPTIONAL_TABS.some(t => t.key === k));
    } catch(e) { return []; }
  }

  function setOptionalTabs(list){
    try { localStorage.setItem(OPTIONAL_KEY, JSON.stringify(list)); } catch(e){}
  }

  function getCustomTabs(){
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(t => t && t.key && t.label && t.keyword);
    } catch(e) { return []; }
  }

  function setCustomTabs(list){
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); } catch(e){}
  }

  let currentTab = 'chats';
  let allThreads = { accepted: [], pending: [], declined: [] };
  let userCache  = {};
  let lastMsgCache = {};
  let unreadCache = {};
  let currentUser = null;
  let pollTimer = null;
  let realtimeUnsub = null;
  let openMenu = null;

  let notifications = [];
  let notifPollTimer = null;
  let optionalTabs = getOptionalTabs();
  let customTabs = getCustomTabs();
  let activePickerSheet = null;

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

  function formatDateLabel(iso){
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  }

  function notifIcon(kind){
    switch (kind) {
      case 'review':        return ICON_NOTIF_REVIEW;
      case 'unanswered':    return ICON_NOTIF_QUESTION;
      case 'whatsapp_tap':  return ICON_NOTIF_WHATSAPP;
      case 'gig_new':       return ICON_NOTIF_GIG;
      case 'view_milestone':return ICON_NOTIF_VIEW;
      default:              return ICON_NOTIF_DEFAULT;
    }
  }

  function notifColor(kind){
    switch (kind) {
      case 'review':         return '#C8912E';
      case 'unanswered':     return '#2E6B8A';
      case 'whatsapp_tap':   return '#01764C';
      case 'gig_new':        return '#7A3D6B';
      case 'view_milestone': return '#D96B3A';
      default:               return '#4A5A6B';
    }
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

  function sortThreads(list){
    return list.slice().sort((a, b) => {
      const aPinned = a.thread.pinned_at ? 1 : 0;
      const bPinned = b.thread.pinned_at ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      const aT = a.thread.last_message_at ? new Date(a.thread.last_message_at).getTime() : 0;
      const bT = b.thread.last_message_at ? new Date(b.thread.last_message_at).getTime() : 0;
      return bT - aT;
    });
  }

  function classify(all){
    const myId = currentUser.id;
    const inbox = [];
    const sent = [];
    const requests = [];
    const archived = [];
    const pinned = [];
    const muted = [];

    (all.accepted || []).forEach(t => {
      if (t.archived_at) {
        archived.push({ thread: t, kind: 'accepted' });
      } else {
        inbox.push({ thread: t, kind: 'accepted' });
      }
      if (t.pinned_at && !t.archived_at) pinned.push({ thread: t, kind: 'accepted' });
      if (t.muted && !t.archived_at) muted.push({ thread: t, kind: 'accepted' });
    });

    (all.pending || []).forEach(t => {
      const isMine = t.initiated_by === myId;
      const kind = isMine ? 'outgoing' : 'incoming';

      if (t.archived_at) {
        archived.push({ thread: t, kind: kind });
      } else if (isMine) {
        sent.push({ thread: t, kind: 'outgoing' });
      } else {
        requests.push({ thread: t, kind: 'incoming' });
      }

      if (t.pinned_at && !t.archived_at) pinned.push({ thread: t, kind: kind });
      if (t.muted && !t.archived_at) muted.push({ thread: t, kind: kind });
    });

    const custom = {};
    const pool = [].concat(inbox, sent, requests);
    customTabs.forEach(ct => {
      const k = ct.keyword.toLowerCase();
      const matches = pool.filter(item => {
        const last = lastMsgCache[item.thread.id];
        if (!last) return false;
        const body = (last.body || '').toLowerCase();
        return body.indexOf(k) !== -1;
      });
      custom[ct.key] = sortThreads(matches);
    });

    return {
      inbox: sortThreads(inbox),
      sent: sortThreads(sent),
      requests: sortThreads(requests),
      archived: sortThreads(archived),
      pinned: sortThreads(pinned),
      muted: sortThreads(muted),
      custom: custom
    };
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

      await refreshNotifBadge();

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
              if (currentTab !== 'updates') render();
            }
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

      if (currentTab !== 'updates') render();
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

  async function refreshNotifBadge(){
    try {
      const count = await DB.getUnreadNotificationCount();
      updateUpdatesBadge(count);
    } catch(e) { /* silent */ }
  }

  function updateUpdatesBadge(count){
    const tab = tabsEl.querySelector('[data-tab="updates"]');
    if (!tab) return;
    let badge = tab.querySelector('.chats-tab-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'chats-tab-badge';
      tab.appendChild(badge);
    }
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  async function render(){
    renderBadges();

    if (currentTab === 'updates') {
      await loadAndRenderNotifications();
      return;
    }

    const cls = classify(allThreads);

    if (currentTab === 'chats') {
      renderList(cls.inbox, 'chats');
    } else if (currentTab === 'requests') {
      renderList(cls.requests, 'requests');
    } else if (currentTab === 'sent') {
      renderList(cls.sent, 'sent');
    } else if (currentTab === 'archived') {
      renderList(cls.archived, 'archived');
    } else if (currentTab === 'pinned') {
      renderList(cls.pinned, 'pinned');
    } else if (currentTab === 'muted') {
      renderList(cls.muted, 'muted');
    } else if (cls.custom[currentTab] !== undefined) {
      renderList(cls.custom[currentTab], 'custom');
    } else {
      renderList(cls.inbox, 'chats');
    }
  }

  /* ============================================================
     OPTIONAL + CUSTOM TABS
     ============================================================ */

  function renderOptionalTabs(){
    tabsEl.querySelectorAll('.chats-tab[data-optional="1"]').forEach(el => el.remove());
    tabsEl.querySelectorAll('.chats-tab[data-custom="1"]').forEach(el => el.remove());

    const addBtnEl = tabsEl.querySelector('.chats-tab-add');
    if (!addBtnEl) return;

    optionalTabs.forEach(key => {
      const meta = OPTIONAL_TABS.find(t => t.key === key);
      if (!meta) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chats-tab';
      btn.setAttribute('data-tab', meta.key);
      btn.setAttribute('data-optional', '1');
      btn.textContent = meta.label;
      if (currentTab === meta.key) btn.classList.add('active');

      tabsEl.insertBefore(btn, addBtnEl);
    });

    customTabs.forEach(ct => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chats-tab';
      btn.setAttribute('data-tab', ct.key);
      btn.setAttribute('data-custom', '1');
      btn.textContent = ct.label;
      if (currentTab === ct.key) btn.classList.add('active');

      tabsEl.insertBefore(btn, addBtnEl);
    });

    const active = tabsEl.querySelector('.chats-tab.active');
    if (active) requestAnimationFrame(() => movePill(active));

    if (addBtnEl) {
      const anyExtra = (optionalTabs.length + customTabs.length) > 0;
      addBtnEl.classList.toggle('has-tabs', anyExtra);
    }
  }

  function applyActiveTab(){
    tabsEl.querySelectorAll('.chats-tab').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === currentTab);
    });
    const active = tabsEl.querySelector('.chats-tab.active');
    if (active) movePill(active);
  }

  function openTabPicker(){
    closeTabPicker();

    const backdrop = document.createElement('div');
    backdrop.className = 'tab-picker-backdrop';
    backdrop.addEventListener('click', closeTabPicker);

    const sheet = document.createElement('div');
    sheet.className = 'tab-picker-sheet';

    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);

    function renderListView(){
      sheet.innerHTML = '';

      const handle = document.createElement('div');
      handle.className = 'tab-picker-handle';
      sheet.appendChild(handle);

      const title = document.createElement('div');
      title.className = 'tab-picker-title';
      title.textContent = 'Add tabs';
      sheet.appendChild(title);

      const sub = document.createElement('div');
      sub.className = 'tab-picker-sub';
      sub.textContent = 'Extra tabs shown at the top of your inbox.';
      sheet.appendChild(sub);

      const list = document.createElement('div');
      list.className = 'tab-picker-list';

      OPTIONAL_TABS.forEach(meta => {
        const isOn = optionalTabs.indexOf(meta.key) !== -1;

        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'tab-picker-row' + (isOn ? ' on' : '');

        const label = document.createElement('span');
        label.className = 'tab-picker-row-label';
        label.textContent = meta.label;
        row.appendChild(label);

        const toggle = document.createElement('span');
        toggle.className = 'tab-picker-row-toggle';
        row.appendChild(toggle);

        row.addEventListener('click', () => {
          const idx = optionalTabs.indexOf(meta.key);
          if (idx === -1) {
            optionalTabs.push(meta.key);
          } else {
            optionalTabs.splice(idx, 1);
            if (currentTab === meta.key) currentTab = 'chats';
          }
          setOptionalTabs(optionalTabs);
          renderOptionalTabs();
          applyActiveTab();
          render();
          row.classList.toggle('on', idx === -1);
        });

        list.appendChild(row);
      });

      sheet.appendChild(list);

      const sectionTitle = document.createElement('div');
      sectionTitle.className = 'tab-picker-section-title';
      sectionTitle.textContent = 'Your tabs';
      sheet.appendChild(sectionTitle);

      const customList = document.createElement('div');
      customList.className = 'tab-picker-list';

      if (!customTabs.length) {
        const empty = document.createElement('div');
        empty.className = 'tab-picker-empty';
        empty.textContent = 'No custom tabs yet.';
        customList.appendChild(empty);
      } else {
        customTabs.forEach(ct => {
          const row = document.createElement('div');
          row.className = 'tab-picker-custom-row';

          const info = document.createElement('div');
          info.className = 'tab-picker-custom-info';

          const labelEl = document.createElement('div');
          labelEl.className = 'tab-picker-custom-label';
          labelEl.textContent = ct.label;
          info.appendChild(labelEl);

          const kw = document.createElement('div');
          kw.className = 'tab-picker-custom-kw';
          kw.textContent = 'matches: "' + ct.keyword + '"';
          info.appendChild(kw);

          row.appendChild(info);

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'tab-picker-custom-delete';
          delBtn.setAttribute('aria-label', 'Remove tab');
          delBtn.innerHTML = ICON_TRASH;
          delBtn.addEventListener('click', () => {
            if (!confirm('Remove "' + ct.label + '" tab?')) return;
            customTabs = customTabs.filter(t => t.key !== ct.key);
            setCustomTabs(customTabs);
            if (currentTab === ct.key) currentTab = 'chats';
            renderOptionalTabs();
            applyActiveTab();
            render();
            renderListView();
          });
          row.appendChild(delBtn);

          customList.appendChild(row);
        });
      }

      sheet.appendChild(customList);

      const newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.className = 'tab-picker-new-btn';
      newBtn.textContent = '+ New custom tab';
      newBtn.addEventListener('click', renderCreateView);
      sheet.appendChild(newBtn);

      const done = document.createElement('button');
      done.type = 'button';
      done.className = 'tab-picker-done';
      done.textContent = 'Done';
      done.addEventListener('click', closeTabPicker);
      sheet.appendChild(done);
    }

    function renderCreateView(){
      sheet.innerHTML = '';

      const handle = document.createElement('div');
      handle.className = 'tab-picker-handle';
      sheet.appendChild(handle);

      const title = document.createElement('div');
      title.className = 'tab-picker-title';
      title.textContent = 'New tab';
      sheet.appendChild(title);

      const sub = document.createElement('div');
      sub.className = 'tab-picker-sub';
      sub.textContent = 'Give it a name and a word to match in your chats.';
      sheet.appendChild(sub);

      const nameLabel = document.createElement('label');
      nameLabel.className = 'tab-picker-field-label';
      nameLabel.textContent = 'Tab name';
      sheet.appendChild(nameLabel);

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'tab-picker-input';
      nameInput.placeholder = 'Weddings';
      nameInput.maxLength = 16;
      sheet.appendChild(nameInput);

      const kwLabel = document.createElement('label');
      kwLabel.className = 'tab-picker-field-label';
      kwLabel.textContent = 'Match this word in chats';
      sheet.appendChild(kwLabel);

      const kwInput = document.createElement('input');
      kwInput.type = 'text';
      kwInput.className = 'tab-picker-input';
      kwInput.placeholder = 'wedding';
      kwInput.maxLength = 24;
      sheet.appendChild(kwInput);

      const err = document.createElement('div');
      err.className = 'tab-picker-error';
      err.hidden = true;
      sheet.appendChild(err);

      const actions = document.createElement('div');
      actions.className = 'tab-picker-form-actions';

      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'tab-picker-cancel';
      cancel.textContent = 'Back';
      cancel.addEventListener('click', renderListView);
      actions.appendChild(cancel);

      const save = document.createElement('button');
      save.type = 'button';
      save.className = 'tab-picker-save';
      save.textContent = 'Add tab';
      save.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const keyword = kwInput.value.trim();

        if (!name) {
          err.textContent = 'Give the tab a name.';
          err.hidden = false;
          return;
        }
        if (!keyword) {
          err.textContent = 'Enter a word to match.';
          err.hidden = false;
          return;
        }

        const key = 'custom_' + Date.now();

        customTabs.push({ key: key, label: name, keyword: keyword });
        setCustomTabs(customTabs);

        renderOptionalTabs();
        applyActiveTab();
        render();
        closeTabPicker();
      });
      actions.appendChild(save);

      sheet.appendChild(actions);

      setTimeout(() => nameInput.focus(), 100);
    }

    renderListView();

    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      sheet.classList.add('visible');
    });

    activePickerSheet = { backdrop, sheet };
  }

  function closeTabPicker(){
    if (!activePickerSheet) return;
    const { backdrop, sheet } = activePickerSheet;
    backdrop.classList.remove('visible');
    sheet.classList.remove('visible');
    setTimeout(() => {
      backdrop.remove();
      sheet.remove();
    }, 220);
    activePickerSheet = null;
  }

  /* ============================================================
     NOTIFICATIONS
     ============================================================ */

  async function loadAndRenderNotifications(){
    showLoading(true);
    emptyEl.hidden = true;
    listEl.innerHTML = '';

    try {
      notifications = await DB.getNotifications(80);
      await refreshNotifBadge();
    } catch(e) {
      console.error('loadNotifications failed:', e);
      notifications = [];
    }

    showLoading(false);
    renderNotifications();
  }

  function renderNotifications(){
    listEl.innerHTML = '';

    if (!notifications.length) {
      emptyEl.hidden = false;
      emptyTitle.textContent = 'All caught up';
      emptySub.textContent = 'Updates about your Desk, reviews and activity will show up here.';
      emptyBtn.hidden = true;
      return;
    }

    emptyEl.hidden = true;

    const hasUnread = notifications.some(n => !n.read_at);
    if (hasUnread) {
      const bar = document.createElement('div');
      bar.className = 'notif-action-bar';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'notif-mark-all';
      btn.textContent = 'Mark all as read';
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Marking...';
        try {
          await DB.markAllNotificationsRead();
          notifications = notifications.map(n => Object.assign({}, n, { read_at: n.read_at || new Date().toISOString() }));
          await refreshNotifBadge();
          renderNotifications();
        } catch(e) {
          console.error(e);
          btn.disabled = false;
          btn.textContent = 'Mark all as read';
        }
      });

      bar.appendChild(btn);
      listEl.appendChild(bar);
    }

    let lastDay = null;
    notifications.forEach(n => {
      const day = new Date(n.created_at).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        const divider = document.createElement('div');
        divider.className = 'notif-day-divider';
        divider.textContent = formatDateLabel(n.created_at);
        listEl.appendChild(divider);
      }

      listEl.appendChild(buildNotificationCard(n));
    });
  }

  function buildNotificationCard(n){
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'notif-card' + (n.read_at ? ' notif-card-read' : ' notif-card-unread');
    card.setAttribute('data-kind', n.kind || 'default');

    const icon = document.createElement('span');
    icon.className = 'notif-icon';
    icon.innerHTML = notifIcon(n.kind);
    card.appendChild(icon);

    const body = document.createElement('div');
    body.className = 'notif-body';

    const top = document.createElement('div');
    top.className = 'notif-top';

    const title = document.createElement('div');
    title.className = 'notif-title';
    title.textContent = n.title || 'Update';
    top.appendChild(title);

    const time = document.createElement('div');
    time.className = 'notif-time';
    time.textContent = timeAgoShort(n.created_at);
    top.appendChild(time);

    body.appendChild(top);

    if (n.body && n.body.trim()) {
      const preview = document.createElement('div');
      preview.className = 'notif-preview';
      preview.textContent = n.body.trim();
      body.appendChild(preview);
    }

    card.appendChild(body);

    if (!n.read_at) {
      const dot = document.createElement('span');
      dot.className = 'notif-dot';
      card.appendChild(dot);
    }

    card.addEventListener('click', async () => {
      if (!n.read_at) {
        try {
          await DB.markNotificationRead(n.id);
          n.read_at = new Date().toISOString();
          await refreshNotifBadge();
        } catch(e) { /* silent */ }
      }

      if (n.link_url) {
        window.location.href = n.link_url;
      } else {
        renderNotifications();
      }
    });

    let pressTimer = null;
    const start = () => {
      clearTimeout(pressTimer);
      pressTimer = setTimeout(async () => {
        if (!confirm('Delete this update?')) return;
        try {
          await DB.deleteNotification(n.id);
          notifications = notifications.filter(x => x.id !== n.id);
          await refreshNotifBadge();
          renderNotifications();
        } catch(e) {
          console.error(e);
        }
      }, 550);
    };
    const cancel = () => clearTimeout(pressTimer);

    card.addEventListener('touchstart', start, { passive: true });
    card.addEventListener('touchend', cancel);
    card.addEventListener('touchmove', cancel);
    card.addEventListener('touchcancel', cancel);

    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      start();
    });

    return card;
  }

  /* ============================================================
     THREAD ROWS
     ============================================================ */

  function renderList(items, mode){
    listEl.innerHTML = '';

    if (!items || !items.length) {
      emptyEl.hidden = false;
      if (mode === 'requests') {
        emptyTitle.textContent = 'No requests';
        emptySub.textContent = 'When someone messages you for the first time, their request will appear here.';
        emptyBtn.hidden = true;
      } else if (mode === 'sent') {
        emptyTitle.textContent = 'No sent messages';
        emptySub.textContent = 'When you message someone first, it will show up here until they reply.';
        emptyBtn.hidden = false;
      } else if (mode === 'archived') {
        emptyTitle.textContent = 'Nothing archived';
        emptySub.textContent = 'Long-press a chat and tap Archive to hide it here.';
        emptyBtn.hidden = true;
      } else if (mode === 'pinned') {
        emptyTitle.textContent = 'No pinned chats';
        emptySub.textContent = 'Long-press a chat and tap Pin to stick it to the top.';
        emptyBtn.hidden = true;
      } else if (mode === 'muted') {
        emptyTitle.textContent = 'No muted chats';
        emptySub.textContent = 'Long-press a chat and tap Mute to silence it.';
        emptyBtn.hidden = true;
      } else if (mode === 'custom') {
        emptyTitle.textContent = 'Nothing matches yet';
        emptySub.textContent = 'Chats whose last message contains this tab\u2019s word will appear here.';
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
      listEl.appendChild(buildRow(item.thread, item.kind, mode));
    });
  }

  function buildRow(thread, kind, mode){
    const otherId = thread.user_a === currentUser.id ? thread.user_b : thread.user_a;
    const other = userCache[otherId];

    const row = document.createElement('div');
    row.className = 'chat-row';

    if (kind === 'accepted' || kind === 'outgoing') {
      row.classList.add('chat-row-tappable');
      row.addEventListener('click', () => {
        if (openMenu) return;
        window.location.href = 'chat.html?id=' + encodeURIComponent(thread.id);
      });
    }

    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showRowMenu(row, thread, mode);
    });

    let pressTimer = null;
    row.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => {
        showRowMenu(row, thread, mode);
      }, 550);
    }, { passive: true });
    row.addEventListener('touchend', () => {
      if (pressTimer) clearTimeout(pressTimer);
    });
    row.addEventListener('touchmove', () => {
      if (pressTimer) clearTimeout(pressTimer);
    });
    row.addEventListener('touchcancel', () => {
      if (pressTimer) clearTimeout(pressTimer);
    });

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

    if (thread.pinned_at) {
      const pin = document.createElement('span');
      pin.className = 'chat-row-pin';
      pin.innerHTML = ICON_PIN;
      pin.title = 'Pinned';
      top.appendChild(pin);
    }

    if (thread.muted) {
      const mute = document.createElement('span');
      mute.className = 'chat-row-mute';
      mute.innerHTML = ICON_MUTE;
      mute.title = 'Muted';
      top.appendChild(mute);
    }

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

    /* ---- Preview line ---- */
    const preview = document.createElement('div');
    preview.className = 'chat-row-preview';

    const last = lastMsgCache[thread.id];
    if (last && last.photo_url && !last.body) {
      preview.textContent = '📷 Photo';
    } else if (last && last.body && last.body.trim()) {
      const isMe = last.sender_id === currentUser.id;
      preview.textContent = (isMe ? 'You: ' : '') + last.body.trim();
    } else if (last) {
      preview.textContent = 'No text';
      preview.classList.add('chat-row-preview-quiet');
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
    if (unreadCount > 0 && !thread.muted) {
      const pillEl = document.createElement('span');
      pillEl.className = 'chat-row-unread';
      pillEl.textContent = String(unreadCount > 99 ? '99+' : unreadCount);
      row.appendChild(pillEl);
    } else if (unreadCount > 0 && thread.muted) {
      const pillEl = document.createElement('span');
      pillEl.className = 'chat-row-unread chat-row-unread-muted';
      pillEl.textContent = String(unreadCount > 99 ? '99+' : unreadCount);
      row.appendChild(pillEl);
    }

    if (kind === 'incoming' && mode === 'requests') {
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
          if (window.TOAST) TOAST.show(err.message || 'Could not accept.', { kind: 'error' });
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
          if (window.TOAST) TOAST.show(err.message || 'Could not decline.', { kind: 'error' });
        }
      });
      actions.appendChild(declineBtn);

      row.appendChild(actions);
    }

    return row;
  }

  /* ============================================================
     ROW CONTEXT MENU
     ============================================================ */

  function closeRowMenu(){
    if (!openMenu) return;
    openMenu.backdrop.remove();
    openMenu.menu.remove();
    openMenu = null;
  }

  function showRowMenu(row, thread, mode){
    closeRowMenu();

    const backdrop = document.createElement('div');
    backdrop.className = 'chat-row-menu-backdrop';
    backdrop.addEventListener('click', closeRowMenu);

    const menu = document.createElement('div');
    menu.className = 'chat-row-menu';

    const isArchived = mode === 'archived';
    const isPinned = !!thread.pinned_at;
    const isMuted = !!thread.muted;

    const pinItem = document.createElement('button');
    pinItem.type = 'button';
    pinItem.className = 'chat-row-menu-item';
    pinItem.innerHTML = (isPinned ? ICON_UNPIN : ICON_PIN) +
      '<span>' + (isPinned ? 'Unpin' : 'Pin to top') + '</span>';
    pinItem.addEventListener('click', async () => {
      closeRowMenu();
      try {
        await DB.pinThread(thread.id, !isPinned);
        await loadAll();
      } catch(e) {
        console.error(e);
        if (window.TOAST) TOAST.show(e.message || 'Could not ' + (isPinned ? 'unpin' : 'pin') + '.', { kind: 'error' });
      }
    });
    menu.appendChild(pinItem);

    const muteItem = document.createElement('button');
    muteItem.type = 'button';
    muteItem.className = 'chat-row-menu-item';
    muteItem.innerHTML = (isMuted ? ICON_UNMUTE : ICON_MUTE) +
      '<span>' + (isMuted ? 'Unmute' : 'Mute') + '</span>';
    muteItem.addEventListener('click', async () => {
      closeRowMenu();
      try {
        await DB.muteThread(thread.id, !isMuted);
        await loadAll();
      } catch(e) {
        console.error(e);
        if (window.TOAST) TOAST.show(e.message || 'Could not ' + (isMuted ? 'unmute' : 'mute') + '.', { kind: 'error' });
      }
    });
    menu.appendChild(muteItem);

    const archiveItem = document.createElement('button');
    archiveItem.type = 'button';
    archiveItem.className = 'chat-row-menu-item';
    archiveItem.innerHTML = (isArchived ? ICON_UNARCHIVE : ICON_ARCHIVE) +
      '<span>' + (isArchived ? 'Unarchive' : 'Archive') + '</span>';
    archiveItem.addEventListener('click', async () => {
      closeRowMenu();
      try {
        await DB.archiveThread(thread.id, !isArchived);
        await loadAll();
      } catch(e) {
        console.error(e);
        if (window.TOAST) TOAST.show('Could not ' + (isArchived ? 'unarchive' : 'archive') + '.', { kind: 'error' });
      }
    });
    menu.appendChild(archiveItem);

    const deleteItem = document.createElement('button');
    deleteItem.type = 'button';
    deleteItem.className = 'chat-row-menu-item chat-row-menu-item-danger';
    deleteItem.innerHTML = ICON_TRASH + '<span>Delete</span>';
    deleteItem.addEventListener('click', async () => {
      closeRowMenu();
      if (!confirm('Delete this conversation? This cannot be undone.')) return;
      try {
        await DB.deleteThread(thread.id);
        await loadAll();
      } catch(e) {
        console.error(e);
        if (window.TOAST) TOAST.show('Could not delete.', { kind: 'error' });
      }
    });
    menu.appendChild(deleteItem);

    document.body.appendChild(backdrop);
    document.body.appendChild(menu);

    const rect = row.getBoundingClientRect();
    const menuWidth = 220;
    const padding = 8;
    let left = rect.left + 16;
    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }
    let top = rect.top + 20;
    if (top + 260 > window.innerHeight) {
      top = window.innerHeight - 280;
    }

    menu.style.left = left + 'px';
    menu.style.top = top + 'px';

    openMenu = { backdrop, menu };
  }

  /* ============================================================
     TAB SWITCHING + PILL
     ============================================================ */

  function movePill(target){
    if (!pill || !target) return;
    const tabRect = target.getBoundingClientRect();
    const containerRect = tabsEl.getBoundingClientRect();
    const left = tabRect.left - containerRect.left + tabsEl.scrollLeft;
    const width = tabRect.width;

    pill.style.width = width + 'px';
    pill.style.transform = 'translateX(' + left + 'px)';
  }

  function initPill(){
    const active = tabsEl.querySelector('.chats-tab.active');
    if (active) {
      requestAnimationFrame(() => movePill(active));
    }
  }

  tabsEl.addEventListener('click', (e) => {
    const addBtnClick = e.target.closest('.chats-tab-add');
    if (addBtnClick) {
      openTabPicker();
      return;
    }

    const btn = e.target.closest('.chats-tab');
    if (!btn) return;

    tabsEl.querySelectorAll('.chats-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    movePill(btn);

    currentTab = btn.getAttribute('data-tab') || 'chats';
    render();
  });

  window.addEventListener('resize', () => {
    const active = tabsEl.querySelector('.chats-tab.active');
    if (active) movePill(active);
  });

  document.addEventListener('scroll', closeRowMenu, { passive: true });

  setTimeout(initPill, 100);
  window.addEventListener('load', initPill);

  /* ============================================================
     INIT
     ============================================================ */

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
    if (tabParam) {
      const isFixed = ['chats', 'requests', 'updates', 'archived'].indexOf(tabParam) !== -1;
      const isOptional = OPTIONAL_TABS.some(t => t.key === tabParam);
      const isCustom = customTabs.some(t => t.key === tabParam);
      if (isFixed) {
        currentTab = tabParam;
      } else if (isOptional) {
        if (optionalTabs.indexOf(tabParam) === -1) {
          optionalTabs.push(tabParam);
          setOptionalTabs(optionalTabs);
        }
        currentTab = tabParam;
      } else if (isCustom) {
        currentTab = tabParam;
      }
    }

    noAuth.style.display = 'none';
    root.style.display = '';

    renderOptionalTabs();
    applyActiveTab();

    await loadAll();

    startRealtime();
    startPolling();

    if (notifPollTimer) clearInterval(notifPollTimer);
    notifPollTimer = setInterval(() => {
      refreshNotifBadge();
      if (currentTab === 'updates') {
        loadAndRenderNotifications();
      }
    }, 30000);

    window.addEventListener('beforeunload', () => {
      if (pollTimer) clearInterval(pollTimer);
      if (notifPollTimer) clearInterval(notifPollTimer);
      if (realtimeUnsub) {
        try { realtimeUnsub(); } catch(e) {}
      }
    });
  })();

})();
