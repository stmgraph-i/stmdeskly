/* ============================================================
   STMDESKLY · PRESENCE
   Heartbeat: updates last_seen_at every 30s while the user is
   on the site. Respects their privacy setting.
   Also exposes helpers for other pages to check presence.
   ============================================================ */

window.PRESENCE = (function(){

  const HEARTBEAT_MS = 30000;   // 30 seconds
  const ONLINE_WINDOW_MS = 2 * 60 * 1000;  // 2 minutes = "online"
  const CONTACTS_KEY_CACHE = {};  // memoize contact checks per session

  let heartbeatTimer = null;
  let lastPrivacy = null;

  /* ---- Heartbeat ---- */
  async function beat(){
    try {
      if (!window.DB || !DB.ready) return;
      if (!DB.currentUser()) return;
      if (document.hidden) return;

      /* Don't beat if user chose "nobody" */
      const privacy = await getMyPrivacy();
      if (privacy === 'nobody') return;

      await DB.updateLastSeen();
    } catch(e) {
      /* silent — presence failures should never disrupt the app */
    }
  }

  function startHeartbeat(){
    if (heartbeatTimer) return;

    /* Fire once quickly, then on interval */
    setTimeout(beat, 2000);
    heartbeatTimer = setInterval(beat, HEARTBEAT_MS);

    /* Resume when tab becomes visible, pause when hidden */
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) beat();
    });

    /* Beat once more before unload */
    window.addEventListener('pagehide', () => { beat(); });
  }

  function stopHeartbeat(){
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  /* ---- Privacy ---- */
  async function getMyPrivacy(){
    if (lastPrivacy) return lastPrivacy;
    try {
      const desk = await DB.getMyDesk();
      lastPrivacy = (desk && desk.presence_privacy) || 'everyone';
      return lastPrivacy;
    } catch(e) {
      return 'everyone';
    }
  }

  function clearPrivacyCache(){
    lastPrivacy = null;
  }

  /* ---- Presence lookup ---- */
  async function getPresence(userId){
    if (!userId) return { online: false, lastSeen: null, visible: false };

    try {
      const me = DB.currentUser();
      const myPrivacy = await getMyPrivacy();

      /* If I hide mine, I can't see anyone else's */
      if (myPrivacy === 'nobody') {
        return { online: false, lastSeen: null, visible: false, hiddenReason: 'self' };
      }

      const other = await DB.getPresence(userId);
      if (!other) {
        return { online: false, lastSeen: null, visible: false };
      }

      /* Their privacy setting */
      if (other.presence_privacy === 'nobody') {
        return { online: false, lastSeen: null, visible: false, hiddenReason: 'other' };
      }

      if (other.presence_privacy === 'contacts') {
        /* Allow only if we have a conversation */
        const isContact = await checkContact(userId);
        if (!isContact) {
          return { online: false, lastSeen: null, visible: false, hiddenReason: 'not_contact' };
        }
      }

      const lastSeen = other.last_seen_at ? new Date(other.last_seen_at) : null;
      const online = lastSeen && (Date.now() - lastSeen.getTime()) < ONLINE_WINDOW_MS;

      return {
        online: !!online,
        lastSeen: lastSeen,
        visible: true
      };
    } catch(e) {
      return { online: false, lastSeen: null, visible: false };
    }
  }

  /* ---- Contact check: any accepted thread between us? ---- */
  async function checkContact(otherUserId){
    if (CONTACTS_KEY_CACHE[otherUserId] !== undefined) {
      return CONTACTS_KEY_CACHE[otherUserId];
    }
    try {
      const threads = await DB.getMyThreads();
      const accepted = threads.accepted || [];
      const found = accepted.some(t =>
        t.user_a === otherUserId || t.user_b === otherUserId
      );
      CONTACTS_KEY_CACHE[otherUserId] = found;
      return found;
    } catch(e) {
      return false;
    }
  }

  /* ---- Format last seen as human text ---- */
  function formatLastSeen(lastSeen){
    if (!lastSeen) return 'Offline';
    const diff = Date.now() - lastSeen.getTime();
    if (diff < ONLINE_WINDOW_MS) return 'Online';

    const min = Math.floor(diff / 60000);
    if (min < 60) return 'Active ' + min + 'm ago';

    const hr = Math.floor(min / 60);
    if (hr < 24) return 'Active ' + hr + 'h ago';

    const day = Math.floor(hr / 24);
    if (day === 1) return 'Active yesterday';
    if (day < 7) return 'Active ' + day + 'd ago';

    return 'Offline';
  }

  return {
    startHeartbeat,
    stopHeartbeat,
    getPresence,
    getMyPrivacy,
    clearPrivacyCache,
    formatLastSeen
  };

})();
