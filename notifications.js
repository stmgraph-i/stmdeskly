/* ============================================================
   DESKLY · NOTIFICATIONS
   Level 2 (in-browser) + Level 3 (push)
   ============================================================ */

window.NOTIFY = (function(){

  const PERM_KEY = 'fd_notify_permission_asked';
  const ENABLED_KEY = 'fd_notify_enabled';

  /* ---- Capability checks ---- */

  function isSupported(){
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  function isPushSupported(){
    return isSupported()
      && 'serviceWorker' in navigator
      && 'PushManager' in window;
  }

  function permissionState(){
    if (!isSupported()) return 'unsupported';
    return Notification.permission;
  }

  function hasAsked(){
    try { return localStorage.getItem(PERM_KEY) === '1'; } catch(e) { return false; }
  }

  function markAsked(){
    try { localStorage.setItem(PERM_KEY, '1'); } catch(e) {}
  }

  function isEnabled(){
    try { return localStorage.getItem(ENABLED_KEY) === '1'; } catch(e) { return false; }
  }

  function setEnabled(on){
    try {
      if (on) localStorage.setItem(ENABLED_KEY, '1');
      else localStorage.removeItem(ENABLED_KEY);
    } catch(e) {}
  }

  /* ---- In-browser permission ---- */

  async function requestPermission(){
    if (!isSupported()) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';

    try {
      const result = await Notification.requestPermission();
      markAsked();
      if (result === 'granted') setEnabled(true);
      return result;
    } catch(e) {
      return 'denied';
    }
  }

  /* ---- VAPID public key ---- */
  /* IMPORTANT: replace this with your actual public VAPID key */
  const VAPID_PUBLIC_KEY = 'BEEDpPMOtWPHTyUi3dMrkn1Xmisic9k1a-l7VdXcuuMpDdFB916HtURHYwFpQj8dQQQ8euqlD2rZ0hbviZQUIyo';

  function urlBase64ToUint8Array(base64String){
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /* ---- Service worker + push subscription ---- */

  async function registerServiceWorker(){
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      return reg;
    } catch(e) {
      console.error('SW registration failed:', e);
      return null;
    }
  }

  async function subscribeToPush(){
    if (!isPushSupported()) return null;
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.includes('PASTE')) {
      console.error('VAPID public key not set in notifications.js');
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.ready;

      /* Check if already subscribed */
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }
      return subscription;
    } catch(e) {
      console.error('Push subscribe failed:', e);
      return null;
    }
  }

  async function unsubscribeFromPush(){
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      return true;
    } catch(e) {
      return false;
    }
  }

  /* Save subscription to Supabase */
  async function saveSubscription(subscription){
    if (!window.DB || !DB.ready) return false;
    try {
      const c = window.SUPABASE_CONFIG;
      const session = DB.getSession();
      const token = session?.access_token || c.anonKey;
      const user = DB.currentUser();
      if (!user) return false;

      const json = subscription.toJSON();
      const payload = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth
      };

      const url = c.url + '/rest/v1/push_subscriptions?on_conflict=user_id,endpoint';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error('saveSubscription failed:', await res.text());
        return false;
      }
      return true;
    } catch(e) {
      console.error('saveSubscription error:', e);
      return false;
    }
  }

  async function deleteSubscription(endpoint){
    if (!window.DB || !DB.ready) return false;
    try {
      const c = window.SUPABASE_CONFIG;
      const session = DB.getSession();
      const token = session?.access_token || c.anonKey;
      const url = c.url + '/rest/v1/push_subscriptions?endpoint=eq.' +
                  encodeURIComponent(endpoint);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + token,
          'Prefer': 'return=minimal'
        }
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  }

  /* Full flow: ask permission, subscribe, save */
  async function enablePush(){
    if (!isPushSupported()) {
      return { ok: false, reason: 'unsupported' };
    }

    const perm = await requestPermission();
    if (perm !== 'granted') {
      return { ok: false, reason: perm };
    }

    const reg = await registerServiceWorker();
    if (!reg) {
      return { ok: false, reason: 'sw_failed' };
    }

    const sub = await subscribeToPush();
    if (!sub) {
      return { ok: false, reason: 'subscribe_failed' };
    }

    const saved = await saveSubscription(sub);
    if (!saved) {
      return { ok: false, reason: 'save_failed' };
    }

    setEnabled(true);
    return { ok: true, subscription: sub };
  }

  /* Full flow: disable push */
  async function disablePush(){
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await deleteSubscription(endpoint);
      }
      setEnabled(false);
      return { ok: true };
    } catch(e) {
      setEnabled(false);
      return { ok: false, reason: e.message };
    }
  }

  /* ---- In-browser notification (fallback for when tab is hidden) ---- */

  function show(title, body, onClickData){
    if (!isSupported()) return null;
    if (Notification.permission !== 'granted') return null;
    if (!isEnabled()) return null;
    if (!document.hidden) return null;

    try {
      const opts = {
        body: body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: onClickData && onClickData.threadId ? ('chat-' + onClickData.threadId) : 'deskly',
        data: onClickData || {},
        silent: false
      };

      const n = new Notification(title, opts);

      n.onclick = function(){
        try { window.focus(); } catch(e) {}
        if (onClickData && onClickData.threadId) {
          window.location.href = 'chat.html?id=' + encodeURIComponent(onClickData.threadId);
        } else {
          window.location.href = 'chats.html';
        }
        n.close();
      };

      return n;
    } catch(e) {
      console.error('Notification failed:', e);
      return null;
    }
  }

  return {
    isSupported,
    isPushSupported,
    permissionState,
    hasAsked,
    isEnabled,
    setEnabled,
    requestPermission,
    enablePush,
    disablePush,
    show,
    registerServiceWorker
  };

})();