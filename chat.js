/* ============================================================
   DESKLY · SINGLE CONVERSATION
   Handles two modes:
   - ?id=<thread>   → existing conversation
   - ?to=<user_id>  → new conversation, thread created on first Send
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
    }

    if (headUser) {
      headUser.href = otherUser.username
        ? 'profile.html?u=' + encodeURIComponent(otherUser.username)
        : '#';
    }
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
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + (mine ? 'chat-bubble-mine' : 'chat-bubble-theirs');
      bubble.dataset.msgId = msg.id;

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

      if (mine) {
        bubble.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (!confirm('Delete this message?')) return;
          deleteMessage(msg.id);
        });
      }

      log.appendChild(bubble);
    });

    if (scrollToBottom !== false) {
      function goBottom(){
        if (log) log.scrollTop = log.scrollHeight;
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      }
      goBottom();
      requestAnimationFrame(goBottom);
      setTimeout(goBottom, 200);
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

      currentMessages.push(record);
      renderMessages(true);

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

      if (input) {
        input.value = '';
        input.style.height = 'auto';
      }
      updateSendState();

      try {
        if (!threadId) {
          const newThread = await DB.startConversation(otherId, body);
          threadId = newThread.id;
          thread = newThread;
          window.history.replaceState({}, '', 'chat.html?id=' + encodeURIComponent(threadId));
          startRealtime();
          startPolling();
          await refreshMessages();
        } else {
          await DB.sendChatMessage(threadId, { body: body });
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

      try {
        if (!threadId) {
          const newThread = await DB.startConversation(otherId, '📷');
          threadId = newThread.id;
          thread = newThread;
          window.history.replaceState({}, '', 'chat.html?id=' + encodeURIComponent(threadId));
          await DB.sendChatMessage(threadId, { photoBlob: pendingPhotoBlob });
          startRealtime();
          startPolling();
          await refreshMessages();
        } else {
          await DB.sendChatMessage(threadId, { photoBlob: pendingPhotoBlob });
          await refreshMessages();
        }

        pendingPhotoBlob = null;
        if (preview) preview.hidden = true;
        if (previewImg) previewImg.src = '';
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
