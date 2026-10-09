/* ============================================================
   STMDESKLY · TYPING INDICATOR
   Broadcasts "typing" / "stopped" events over Supabase Realtime.
   One channel per thread. Times out after 3 seconds of silence.
   ============================================================ */

window.TYPING = (function(){

  const STOP_DELAY = 3000;      // how long after last keystroke to send "stopped"
  const AUTO_CLEAR = 5000;      // clear the indicator if no "stopped" arrives
  const HEARTBEAT = 2000;       // while typing, re-send "typing" every 2s

  let channel = null;
  let currentThreadId = null;
  let currentUserId = null;

  let stopTimer = null;
  let heartbeatTimer = null;
  let isTyping = false;

  let onOtherTyping = null;
  let otherTypingTimer = null;
  let otherIsTyping = false;

  function wsUrl(){
    const c = window.SUPABASE_CONFIG || {};
    return c.url
      .replace('https://', 'wss://')
      .replace('http://', 'ws://') +
      '/realtime/v1/websocket?apikey=' + encodeURIComponent(c.anonKey) +
      '&vsn=1.0.0';
  }

  function topic(threadId){
    return 'realtime:typing:' + threadId;
  }

  /* ------------------------------------------------------------
     Connect to a thread's typing channel
     ------------------------------------------------------------ */
  function connect(threadId, myUserId, onReceive){
    disconnect();

    if (!threadId || !myUserId) return;
    if (!window.DB || !DB.ready) return;

    currentThreadId = threadId;
    currentUserId = myUserId;
    onOtherTyping = typeof onReceive === 'function' ? onReceive : null;

    let ws;
    try {
      ws = new WebSocket(wsUrl());
    } catch(e) {
      console.error('[typing] connect failed:', e);
      return;
    }

    channel = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        topic: topic(threadId),
        event: 'phx_join',
        payload: {
          config: {
            broadcast: { self: false },
            presence: { key: String(myUserId) }
          }
        },
        ref: '1'
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        /* Incoming broadcast from the other user */
        if (msg.event === 'typing' && msg.payload) {
          const from = msg.payload.user_id;
          if (!from || from === currentUserId) return;
          handleIncoming(msg.payload.state);
        }

        /* Keepalive */
        if (msg.event === 'phx_reply' && msg.ref === 'hb') return;
      } catch(e) { /* ignore */ }
    };

    ws.onerror = (err) => {
      /* silent — typing is best-effort */
    };

    ws.onclose = () => {
      channel = null;
    };
  }

  function disconnect(){
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
    if (otherTypingTimer) { clearTimeout(otherTypingTimer); otherTypingTimer = null; }

    if (channel) {
      try { channel.close(); } catch(e) {}
      channel = null;
    }

    isTyping = false;
    otherIsTyping = false;
    currentThreadId = null;
    onOtherTyping = null;
  }

  /* ------------------------------------------------------------
     Send a typing signal
     ------------------------------------------------------------ */
  function signal(state){
    if (!channel || channel.readyState !== WebSocket.OPEN) return;
    if (!currentThreadId || !currentUserId) return;

    try {
      channel.send(JSON.stringify({
        topic: topic(currentThreadId),
        event: 'typing',
        payload: {
          user_id: currentUserId,
          state: state,
          at: Date.now()
        },
        ref: null
      }));
    } catch(e) { /* silent */ }
  }

  /* Called by chat.js on input events */
  function userIsTyping(){
    if (!currentThreadId || !currentUserId) return;

    if (!isTyping) {
      isTyping = true;
      signal('typing');

      /* Heartbeat — resend "typing" every 2s while active */
      heartbeatTimer = setInterval(() => {
        if (isTyping) signal('typing');
      }, HEARTBEAT);
    }

    /* Reset the stop timer */
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      isTyping = false;
      if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
      signal('stopped');
    }, STOP_DELAY);
  }

  /* Explicit stop (e.g. on send) */
  function stopTyping(){
    if (!isTyping) return;
    isTyping = false;
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
    signal('stopped');
  }

  /* ------------------------------------------------------------
     Receive incoming signals
     ------------------------------------------------------------ */
  function handleIncoming(state){
    if (!onOtherTyping) return;

    if (state === 'typing') {
      otherIsTyping = true;
      onOtherTyping(true);

      /* Auto-clear if no further signal arrives */
      if (otherTypingTimer) clearTimeout(otherTypingTimer);
      otherTypingTimer = setTimeout(() => {
        otherIsTyping = false;
        onOtherTyping(false);
      }, AUTO_CLEAR);
      return;
    }

    if (state === 'stopped') {
      otherIsTyping = false;
      if (otherTypingTimer) { clearTimeout(otherTypingTimer); otherTypingTimer = null; }
      onOtherTyping(false);
      return;
    }
  }

  return {
    connect,
    disconnect,
    userIsTyping,
    stopTyping
  };

})();
