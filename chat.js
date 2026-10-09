/* ============================================================
   DESKLY · SINGLE CONVERSATION
   Includes: presence, typing, reply, reactions
   ============================================================ */

(function initChat(){

  const $ = (id) => document.getElementById(id);

  const params   = new URLSearchParams(location.search);
  let threadId   = params.get('id');
  const toUserId = params.get('to');

  /* Quick reply from notification */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (!event.data || event.data.type !== 'quick-reply') return;

      const replyThreadId = event.data.threadId;
      const replyBody = event.data.body;

      const currentId = new URLSearchParams(location.search).get('id');
      if (!currentId || currentId !== replyThreadId) return;

      try {
        await DB.sendChatMessage(replyThreadId, { body: replyBody });
        await refreshMessages();
      } catch (e) {
        console.error('Quick reply failed:', e);
      }
    });
  }

  const head        = $('chatHead');
  const headUser    = $('chatHeadUser');
  const headAvatar  = $('chatHeadAvatar');
  const headName    = $('chatHeadName');
  const headStatus  = $('chatHeadStatus');
  const menuBtn     = $('chatMenuBtn');
  const menu        = $('chatMenu');
  const menuProfile = $('menuViewProfile');
  const menuReport  = $('menuReport');
  const menuBlock   = $('menuBlock');
  const loading     = $('chatLoading');
  const log         = $('chatLog');
  const form        = $('chatForm');
  const input       = $('chatInput');
  const sendBtn     = $('chatSend');
  const attachBtn   = $('chatAttachBtn');
  const photoInput  = $('chatPhotoInput');
  const preview     = $('chatPhotoPreview');
  const previewImg  = $('chatPhotoPreviewImg');
  const previewRm   = $('chatPhotoRemove');
  const previewSend = $('chatPhotoSend');
  const missing     = $('chatMissing');

  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  if (!threadId && !toUserId) { showMissing(); return; }

  let me = null;
  let thread = null;
  let otherUser = null;
  let otherId = null;
  let currentMessages = [];
  let pendingPhotoBlob = null;
  let pollTimer = null;
  let realtimeUnsub = null;
  let lastMessageId = null;
  let presenceTimer = null;
  let typingConnected = false;
  let replyToId = null;

  /* ============================================================
     HELPERS
     ============================================================ */

  function showMissing(){
    if (loading) loading.style.display = 'none';
    if (head) head.style.display = 'none';
    if (form) form.style.display = 'none';
    if (missing) missing.style.display = 'block';
  }

  function formatTime(iso){
    const d = new Date(iso);
    return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
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

  function openFull(url){
    const overlay = document.createElement('div');
    overlay.className = 'photo-full';
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    overlay.appendChild(img);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'photo-full-close';
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = ICON_CLOSE;
    close.addEventListener('click', () => overlay.remove());
    overlay.appendChild(close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }

  function escapeText(s){
    return String(s || '').slice(0, 120);
  }

  /* ============================================================
     HEADER
     ============================================================ */

  function renderHeader(){
    if (!head) return;
    if (!otherUser) return;

    if (headName) headName.textContent = otherUser.name || 'Someone';
    if (headStatus) headStatus.textContent = otherUser.role || '';

    if (headAvatar) {
      if (otherUser.avatar_url) {
        headAvatar.textContent = '';
        headAvatar.style.backgroundImage = 'url("' + otherUser.avatar_url + '")';
        headAvatar.style.backgroundSize = 'cover';
        headAvatar.style.backgroundPosition = 'center';
      } else {
        const initials = otherUser.initials || (otherUser.name || '?').charAt(0);
        headAvatar.textContent = String(initials).toUpperCase().slice(0, 2);
      }

      headAvatar.classList.add('presence-avatar');
      let dot = headAvatar.querySelector('.presence-dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'presence-dot';
        headAvatar.appendChild(dot);
      }
      dot.style.display = 'none';
    }

    if (headUser) {
      headUser.href = otherUser.username
        ? 'profile.html?u=' + encodeURIComponent(otherUser.username)
        : '#';
    }

    renderPresenceInHeader();
  }

  async function renderPresenceInHeader(){
    if (!otherId || !window.PRESENCE) return;
    if (!headAvatar || !headStatus) return;

    try {
      const p = await PRESENCE.getPresence(otherId);
      const dot = headAvatar.querySelector('.presence-dot');

      if (!p.visible) {
        if (dot) dot.style.display = 'none';
        headStatus.textContent = otherUser.role || '';
        headStatus.classList.remove('presence-text', 'offline');
        return;
      }

      if (p.online) {
        if (dot) dot.style.display = '';
        headStatus.textContent = 'Online';
        headStatus.classList.add('presence-text');
        headStatus.classList.remove('offline');
      } else {
        if (dot) dot.style.display = 'none';
        headStatus.textContent = PRESENCE.formatLastSeen(p.lastSeen);
        headStatus.classList.add('presence-text', 'offline');
      }
    } catch(e) { /* silent */ }
  }

  function startPresencePolling(){
    if (presenceTimer) clearInterval(presenceTimer);
    if (!otherId) return;
    presenceTimer = setInterval(renderPresenceInHeader, 20000);
  }

  function startTypingChannel(){
    if (typingConnected) return;
    if (!threadId || !me) return;
    if (!window.TYPING) return;

    typingConnected = true;

    TYPING.connect(threadId, me.id, (isTyping) => {
      renderTypingIndicator(isTyping);
    });
  }

  function renderTypingIndicator(isTyping){
    if (!headStatus) return;

    if (isTyping) {
      headStatus.textContent = 'typing...';
      headStatus.classList.add('presence-text');
      headStatus.classList.remove('offline');
    } else {
      renderPresenceInHeader();
    }
  }

  /* ============================================================
     REPLY QUOTE BAR
     ============================================================ */

  function showReplyBar(msg){
    replyToId = msg.id;

    let bar = $('chatReplyBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'chatReplyBar';
      bar.className = 'chat-reply-bar';
      bar.innerHTML =
        '<div class="chat-reply-bar-accent"></div>' +
        '<div class="chat-reply-bar-text">' +
          '<div class="chat-reply-bar-name" id="chatReplyBarName"></div>' +
          '<div class="chat-reply-bar-body" id="chatReplyBarBody"></div>' +
        '</div>' +
        '<button type="button" class="chat-reply-bar-close" id="chatReplyBarClose" aria-label="Cancel reply">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>';

      const composer = $('chatForm');
      if (composer && composer.parentNode) {
        composer.parentNode.insertBefore(bar, composer);
      } else {
        document.body.appendChild(bar);
      }

      $('chatReplyBarClose').addEventListener('click', hideReplyBar);
    }

    const nameEl = $('chatReplyBarName');
    const bodyEl = $('chatReplyBarBody');

    if (nameEl) {
      nameEl.textContent = msg.sender_id === me.id ? 'You' : (otherUser.name || 'Them');
    }
    if (bodyEl) {
      bodyEl.textContent = msg.photo_url && !msg.body ? '📷 Photo' : escapeText(msg.body || '');
    }

    if (input) input.focus();
  }

  function hideReplyBar(){
    replyToId = null;
    const bar = $('chatReplyBar');
    if (bar) bar.remove();
  }

  /* ============================================================
     RENDER MESSAGES
     ============================================================ */

  function renderMessages(scrollToBottom){
    if (!log) return;
    log.innerHTML = '';

    if (!currentMessages.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty';
      empty.innerHTML = '<p>Say hi 👋</p>';
      log.appendChild(empty);
      return;
    }

    let lastDay = null;

    currentMessages.forEach(msg => {
      const day = new Date(msg.created_at).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        const divider = document.createElement('div');
        divider.className = 'chat-day-divider';
        divider.textContent = formatDateLabel(msg.created_at);
        log.appendChild(divider);
      }

      const mine = msg.sender_id === me.id;
      const wrap = document.createElement('div');
      wrap.className = 'chat-bubble-wrap ' + (mine ? 'chat-bubble-wrap-mine' : 'chat-bubble-wrap-theirs');

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + (mine ? 'chat-bubble-mine' : 'chat-bubble-theirs');
      bubble.dataset.msgId = msg.id;

      if (msg.reply_to) {
        const quote = document.createElement('button');
        quote.type = 'button';
        quote.className = 'chat-bubble-quote';
        const qName = msg.reply_to.sender_id === me.id ? 'You' : (otherUser.name || 'Them');
        const qBody = msg.reply_to.photo_url && !msg.reply_to.body ? '📷 Photo' : escapeText(msg.reply_to.body || '');
        quote.innerHTML =
          '<div class="chat-bubble-quote-name">' + qName + '</div>' +
          '<div class="chat-bubble-quote-body">' + qBody + '</div>';
        quote.addEventListener('click', () => jumpToMessage(msg.reply_to.id));
        bubble.appendChild(quote);
      }

      if (msg.photo_url) {
        const img = document.createElement('img');
        img.className = 'chat-bubble-photo';
        img.src = msg.photo_url;
        img.alt = '';
        img.loading = 'lazy';
        img.addEventListener('click', () => openFull(msg.photo_url));
        bubble.appendChild(img);
      }

      if (msg.body) {
        const text = document.createElement('div');
        text.className = 'chat-bubble-text';
        text.textContent = msg.body;
        bubble.appendChild(text);
      }

      const meta = document.createElement('div');
      meta.className = 'chat-bubble-meta';
      meta.textContent = formatTime(msg.created_at);
      if (mine && msg.read_at) meta.textContent += ' ✓✓';
      bubble.appendChild(meta);

      attachLongPress(bubble, msg);

      wrap.appendChild(bubble);

      if (msg.reactions && msg.reactions.length) {
        const reactionsBar = renderReactionsBar(msg);
        wrap.appendChild(reactionsBar);
      }

      log.appendChild(wrap);
    });

    if (scrollToBottom !== false) {
      function goBottom(){
        if (!log) return;
        log.scrollTop = log.scrollHeight + 9999;
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      }
      goBottom();
      requestAnimationFrame(goBottom);
      setTimeout(goBottom, 100);
      setTimeout(goBottom, 300);
    }
  }

  function renderReactionsBar(msg){
    const bar = document.createElement('div');
    bar.className = 'chat-reactions-bar';

    const counts = {};
    const mine = {};
    for (const r of msg.reactions) {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      if (r.user_id === me.id) mine[r.emoji] = true;
    }

    const emojiMap = {
      heart:    '❤️',
      thumbsup: '👍',
      fire:     '🔥',
      wow:      '😮',
      pray:     '🙏',
      like:     '💯'
    };

    Object.keys(counts).forEach(emoji => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-reaction-pill' + (mine[emoji] ? ' mine' : '');
      btn.textContent = emojiMap[emoji] + ' ' + counts[emoji];
      btn.addEventListener('click', async () => {
        try {
          await DB.toggleChatReaction(msg.id, emoji);
          await refreshMessages();
        } catch(e) {
          console.error(e);
        }
      });
      bar.appendChild(btn);
    });

    return bar;
  }

  function jumpToMessage(msgId){
    if (!log) return;
    const target = log.querySelector('[data-msg-id="' + msgId + '"]');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('chat-bubble-highlight');
    setTimeout(() => target.classList.remove('chat-bubble-highlight'), 1500);
  }

  /* ============================================================
     LONG PRESS + CONTEXT MENU
     ============================================================ */

  let pressTimer = null;
  let activeMenu = null;

  function attachLongPress(el, msg){
    const start = () => {
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        openContextMenu(el, msg);
      }, 500);
    };
    const cancel = () => clearTimeout(pressTimer);

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchmove', cancel);
    el.addEventListener('touchcancel', cancel);

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openContextMenu(el, msg);
    });
  }

  function openContextMenu(el, msg){
    closeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'chat-ctx-menu';

    /* Reply */
    const replyBtn = document.createElement('button');
    replyBtn.type = 'button';
    replyBtn.className = 'chat-ctx-item';
    replyBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>' +
      '<span>Reply</span>';
    replyBtn.addEventListener('click', () => {
      closeContextMenu();
      showReplyBar(msg);
    });
    menu.appendChild(replyBtn);

    /* Reactions row */
    const reactWrap = document.createElement('div');
    reactWrap.className = 'chat-ctx-reactions';
    const emojiMap = {
      heart:    '❤️',
      thumbsup: '👍',
      fire:     '🔥',
      wow:      '😮',
      pray:     '🙏',
      like:     '💯'
    };
    Object.keys(emojiMap).forEach(emoji => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-ctx-emoji';
      b.textContent = emojiMap[emoji];
      b.addEventListener('click', async () => {
        closeContextMenu();
        try {
          await DB.toggleChatReaction(msg.id, emoji);
          await refreshMessages();
        } catch(e) {
          console.error(e);
        }
      });
      reactWrap.appendChild(b);
    });
    menu.appendChild(reactWrap);

    /* Copy */
    if (msg.body) {
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'chat-ctx-item';
      copyBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
        '<span>Copy</span>';
      copyBtn.addEventListener('click', async () => {
        closeContextMenu();
        try {
          await navigator.clipboard.writeText(msg.body);
        } catch(e) { /* silent */ }
      });
      menu.appendChild(copyBtn);
    }

    /* Delete (only own) */
    if (msg.sender_id === me.id) {
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'chat-ctx-item chat-ctx-item-danger';
      delBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14"/></svg>' +
        '<span>Delete</span>';
      delBtn.addEventListener('click', async () => {
        closeContextMenu();
        if (!confirm('Delete this message?')) return;
        await deleteMessage(msg.id);
      });
      menu.appendChild(delBtn);
    }

    document.body.appendChild(menu);

    const rect = el.getBoundingClientRect();
    const menuW = 220;
    let left = rect.left + (rect.width / 2) - (menuW / 2);
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));

    menu.style.left = left + 'px';
    menu.style.top = (rect.top - 10) + 'px';

    requestAnimationFrame(() => {
      const mh = menu.offsetHeight;
      if (rect.top - mh - 10 < 0) {
        menu.style.top = (rect.bottom + 10) + 'px';
      } else {
        menu.style.top = (rect.top - mh - 10) + 'px';
      }
    });

    activeMenu = menu;

    setTimeout(() => {
      document.addEventListener('click', closeContextMenuOnOutside, { once: true });
      document.addEventListener('touchstart', closeContextMenuOnOutside, { once: true });
    }, 50);
  }

  function closeContextMenuOnOutside(e){
    if (!activeMenu) return;
    if (activeMenu.contains(e.target)) {
      document.addEventListener('click', closeContextMenuOnOutside, { once: true });
      return;
    }
    closeContextMenu();
  }

  function closeContextMenu(){
    if (activeMenu) {
      activeMenu.remove();
      activeMenu = null;
    }
  }

  async function deleteMessage(msgId){
    try {
      const c = window.SUPABASE_CONFIG;
      const session = DB.getSession();
      const token = session?.access_token || c.anonKey;
      const url = c.url + '/rest/v1/chat_messages?id=eq.' + encodeURIComponent(msgId);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + token,
          'Prefer': 'return=minimal'
        }
      });
      if (!res.ok) throw new Error('Could not delete.');
      currentMessages = currentMessages.filter(m => m.id !== msgId);
      renderMessages(false);
    } catch(e) {
      console.error(e);
      alert('Could not delete that message.');
    }
  }

  /* ============================================================
     LOAD THREAD / RECIPIENT
     ============================================================ */

  async function loadExistingThread(){
    try {
      const result = await DB.getThread(threadId);
      if (!result) return false;
      thread = result.thread;
      otherId = result.otherId;
      otherUser = await DB.getPublicUser(otherId);
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  async function loadNewRecipient(){
    try {
      otherUser = await DB.getPublicUser(toUserId);
      if (!otherUser) return false;
      otherId = toUserId;

      const meId = me.id;
      const [a, b] = meId < otherId ? [meId, otherId] : [otherId, meId];
      const c = window.SUPABASE_CONFIG;
      const session = DB.getSession();
      const token = session?.access_token || c.anonKey;
      const url = c.url + '/rest/v1/chat_threads' +
                  '?user_a=eq.' + encodeURIComponent(a) +
                  '&user_b=eq.' + encodeURIComponent(b) +
                  '&select=id&limit=1';
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + token
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length) {
          threadId = rows[0].id;
          return await loadExistingThread();
        }
      }
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  /* ============================================================
     FETCH / POLL / REALTIME
     ============================================================ */

  async function fetchMessages(){
    if (!threadId) return [];
    try {
      /* Try the meta version first (includes reactions + replies) */
      if (typeof DB.getChatMessagesWithMeta === 'function') {
        try {
          const metaMsgs = await DB.getChatMessagesWithMeta(threadId);
          if (Array.isArray(metaMsgs) && metaMsgs.length) {
            return metaMsgs;
          }
        } catch(e) {
          console.warn('getChatMessagesWithMeta failed, falling back:', e);
        }
      }
      /* Fallback to the plain version */
      const msgs = await DB.getChatMessages(threadId);
      return msgs || [];
    } catch(e) {
      return [];
    }
  }

  async function refreshMessages(){
    if (!threadId) return;
    const msgs = await fetchMessages();
    const lastId = msgs.length ? msgs[msgs.length - 1].id : null;
    const changed = (lastId !== lastMessageId) || (msgs.length !== currentMessages.length);

    if (changed) {
      lastMessageId = lastId;
      currentMessages = msgs;
      renderMessages(true);
    }

    try { await DB.markThreadRead(threadId); } catch(e) {}
  }

  function startPolling(){
    if (pollTimer) clearInterval(pollTimer);
    if (!threadId) return;
    pollTimer = setInterval(() => { refreshMessages(); }, 8000);
  }

  function startRealtime(){
    if (!threadId) return;
    if (!DB.subscribeToThreadMessages) return;

    if (realtimeUnsub) {
      try { realtimeUnsub(); } catch(e) {}
      realtimeUnsub = null;
    }

    realtimeUnsub = DB.subscribeToThreadMessages(threadId, (record) => {
      if (!record || !record.id) return;
      if (currentMessages.some(m => m.id === record.id)) return;
      if (record.sender_id === me.id) return;

      refreshMessages();

      if (window.NOTIFY && document.hidden) {
        const name = (otherUser && otherUser.name) || 'New message';
        const body = record.photo_url && !record.body
          ? '📷 Photo'
          : (record.body || '');
        NOTIFY.show(
          'New message from ' + name,
          body,
          { threadId: threadId }
        );
      }

      try { DB.markThreadRead(threadId); } catch(e) {}
    });
  }

  /* ============================================================
     SEND
     ============================================================ */

  function updateSendState(){
    if (!input || !sendBtn) return;
    const hasText = input.value.trim().length > 0;
    sendBtn.disabled = !hasText;
  }

  if (input) {
    input.addEventListener('input', () => {
      updateSendState();
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 140) + 'px';

      if (window.TYPING && threadId) {
        if (input.value.trim().length > 0) {
          TYPING.userIsTyping();
        } else {
          TYPING.stopTyping();
        }
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (form) form.requestSubmit();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = input ? input.value.trim() : '';
      if (!body) return;

      if (window.TYPING) TYPING.stopTyping();

      const capturedReplyTo = replyToId;

      if (input) {
        input.value = '';
        input.style.height = 'auto';
      }
      updateSendState();
      hideReplyBar();

      try {
        if (!threadId) {
          const newThread = await DB.startConversation(otherId, body);
          threadId = newThread.id;
          thread = newThread;
          window.history.replaceState({}, '', 'chat.html?id=' + encodeURIComponent(threadId));
          startRealtime();
          startPolling();
          startPresencePolling();
          startTypingChannel();
          await refreshMessages();
        } else {
          const sendFn = DB.sendChatMessageWithReply || DB.sendChatMessage;
          await sendFn(threadId, {
            body: body,
            replyToId: capturedReplyTo
          });
          await refreshMessages();
        }
      } catch(err) {
        console.error(err);
        alert(err.message || 'Could not send.');
        if (input) {
          input.value = body;
          updateSendState();
        }
      }
    });
  }

  /* ============================================================
     PHOTO ATTACH
     ============================================================ */

  if (attachBtn && photoInput) {
    attachBtn.addEventListener('click', () => photoInput.click());
  }

  if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        let blob = file;
        if (window.PHOTOS && PHOTOS.compress) {
          blob = await PHOTOS.compress(file);
        }
        pendingPhotoBlob = blob;
        if (previewImg) previewImg.src = URL.createObjectURL(blob);
        if (preview) preview.hidden = false;
      } catch(err) {
        console.error(err);
        alert('Could not read that photo.');
      } finally {
        photoInput.value = '';
      }
    });
  }

  if (previewRm) {
    previewRm.addEventListener('click', () => {
      pendingPhotoBlob = null;
      if (preview) preview.hidden = true;
      if (previewImg) previewImg.src = '';
    });
  }

  if (previewSend) {
    previewSend.addEventListener('click', async () => {
      if (!pendingPhotoBlob) return;
      previewSend.disabled = true;
      previewSend.textContent = 'Sending...';

      const capturedReplyTo = replyToId;

      try {
        if (!threadId) {
          const newThread = await DB.startConversation(otherId, '📷');
          threadId = newThread.id;
          thread = newThread;
          window.history.replaceState({}, '', 'chat.html?id=' + encodeURIComponent(threadId));
          const sendFn = DB.sendChatMessageWithReply || DB.sendChatMessage;
          await sendFn(threadId, {
            photoBlob: pendingPhotoBlob,
            replyToId: capturedReplyTo
          });
          startRealtime();
          startPolling();
          startPresencePolling();
          startTypingChannel();
          await refreshMessages();
        } else {
          const sendFn = DB.sendChatMessageWithReply || DB.sendChatMessage;
          await sendFn(threadId, {
            photoBlob: pendingPhotoBlob,
            replyToId: capturedReplyTo
          });
          await refreshMessages();
        }

        pendingPhotoBlob = null;
        if (preview) preview.hidden = true;
        if (previewImg) previewImg.src = '';
        hideReplyBar();
      } catch(err) {
        console.error(err);
        alert(err.message || 'Could not send photo.');
      } finally {
        previewSend.disabled = false;
        previewSend.textContent = 'Send';
      }
    });
  }

  /* ============================================================
     MENU
     ============================================================ */

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    });

    document.addEventListener('click', (e) => {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== menuBtn) {
        menu.hidden = true;
      }
    });
  }

  if (menuProfile) {
    menuProfile.addEventListener('click', () => {
      if (menu) menu.hidden = true;
      if (otherUser && otherUser.username) {
        window.location.href = 'profile.html?u=' + encodeURIComponent(otherUser.username);
      }
    });
  }

  if (menuReport) {
    menuReport.addEventListener('click', async () => {
      if (menu) menu.hidden = true;
      if (!otherId) return;
      const reason = prompt('Why are you reporting this person?\n\nOptions: spam, abuse, scam, other');
      if (reason === null) return;
      try {
        await DB.reportUser(otherId, reason || 'other', threadId);
        alert('Report sent. Thank you.');
      } catch(e) {
        console.error(e);
        alert('Could not send report.');
      }
    });
  }

  if (menuBlock) {
    menuBlock.addEventListener('click', async () => {
      if (menu) menu.hidden = true;
      if (!otherId) return;
      if (!confirm('Block this person?\n\nThey won\'t be able to message you again.')) return;
      try {
        await DB.blockUser(otherId);
        alert('Blocked.');
        window.location.replace('chats.html');
      } catch(e) {
        console.error(e);
        alert(e.message || 'Could not block.');
      }
    });
  }

  /* ============================================================
     INIT
     ============================================================ */

  (async function init(){
    try {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      if (!window.DB || !DB.ready) { showMissing(); return; }

      if (!DB.currentUser()) {
        await new Promise(r => setTimeout(r, 400));
      }
      if (!DB.currentUser()) {
        window.location.replace('login.html');
        return;
      }

      me = DB.currentUser();

      if (threadId) {
        const ok = await loadExistingThread();
        if (!ok) { showMissing(); return; }
        if (thread.status === 'blocked') { showMissing(); return; }

        renderHeader();

        currentMessages = await fetchMessages();
        lastMessageId = currentMessages.length
          ? currentMessages[currentMessages.length - 1].id
          : null;
        renderMessages(true);

        try { await DB.markThreadRead(threadId); } catch(e) {}

        if (loading) loading.style.display = 'none';
        if (head) head.style.display = '';
        if (form) form.style.display = '';

        startRealtime();
        startPolling();
        startPresencePolling();
        startTypingChannel();
      }
      else if (toUserId) {
        const ok = await loadNewRecipient();
        if (!ok) { showMissing(); return; }

        renderHeader();

        if (threadId) {
          currentMessages = await fetchMessages();
          lastMessageId = currentMessages.length
            ? currentMessages[currentMessages.length - 1].id
            : null;
          renderMessages(true);
          try { await DB.markThreadRead(threadId); } catch(e) {}
          startRealtime();
          startPolling();
          startPresencePolling();
          startTypingChannel();
        } else {
          renderMessages(true);
        }

        if (loading) loading.style.display = 'none';
        if (head) head.style.display = '';
        if (form) form.style.display = '';
      }
      else {
        showMissing();
      }

      window.addEventListener('beforeunload', () => {
        if (pollTimer) clearInterval(pollTimer);
        if (presenceTimer) clearInterval(presenceTimer);
        if (window.TYPING) TYPING.disconnect();
        if (realtimeUnsub) {
          try { realtimeUnsub(); } catch(e) {}
        }
      });

    } catch(e) {
      console.error('chat init failed:', e);
      showMissing();
    }
  })();

})();
