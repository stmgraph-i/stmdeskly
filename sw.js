/* ============================================================
   STMDESKLY · SERVICE WORKER
   Receives push events and shows notifications.
   Supports quick-reply from the notification shade.
   ============================================================ */

const CACHE_NAME = 'stmdeskly-v1';

/* Install */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

/* Activate */
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/* Push received */
self.addEventListener('push', (event) => {
  let data = {
    title: 'STMDeskly',
    body: 'New message',
    url: 'chats.html',
    tag: 'stmdeskly',
    icon: '/icon-192.png',
    threadId: null
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      if (parsed.title) data.title = parsed.title;
      if (parsed.body) data.body = parsed.body;
      if (parsed.url) data.url = parsed.url;
      if (parsed.tag) data.tag = parsed.tag;
      if (parsed.icon) data.icon = parsed.icon;
      if (parsed.threadId) data.threadId = parsed.threadId;
    }
  } catch (e) {
    /* fallback to defaults */
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/badge-96.png',
    tag: data.tag,
    renotify: true,
    data: { url: data.url, threadId: data.threadId },
    silent: false,
    requireInteraction: false,
    actions: [
      {
        action: 'reply',
        type: 'text',
        title: 'Reply',
        placeholder: 'Type a message...'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* Notification clicked */
self.addEventListener('notificationclick', (event) => {
  /* Quick reply tapped */
  if (event.action === 'reply') {
    const replyText = (event.reply || '').trim();
    const threadId = event.notification.data && event.notification.data.threadId;

    event.notification.close();

    if (!replyText || !threadId) return;

    event.waitUntil(sendReply(threadId, replyText));
    return;
  }

  /* Default click — open the chat */
  event.notification.close();

  const url = (event.notification.data && event.notification.data.url) || 'chats.html';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(fullUrl);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })
  );
});

/* Send a reply directly from the notification */
async function sendReply(threadId, body) {
  try {
    /* The service worker doesn't have access to the session,
       so we ask an open client (a browser tab) to do the send.
       If none is open, we open one and hand it the reply. */
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const origin = self.location.origin;

    const target = clientList.find(c => c.url.startsWith(origin));

    if (target) {
      target.postMessage({
        type: 'quick-reply',
        threadId: threadId,
        body: body
      });
      return;
    }

    /* No tab open — open one and queue the reply */
    if (self.clients.openWindow) {
      const newClient = await self.clients.openWindow('/chat.html?id=' + encodeURIComponent(threadId));
      if (newClient) {
        newClient.postMessage({
          type: 'quick-reply',
          threadId: threadId,
          body: body
        });
      }
    }
  } catch (e) {
    /* swallow */
  }
}