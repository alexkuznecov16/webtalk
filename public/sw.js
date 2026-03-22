// self.addEventListener('push', (event) => {
//   if (!event.data) return;

//   let data = {};

//   try {
//     data = event.data.json();
//   } catch {
//     data = {
//       title: 'New message',
//       body: event.data.text(),
//       url: '/home',
//     };
//   }

//   const title = data.title || 'New message';
//   const options = {
//     body: data.body || '',
//     icon: '/favicon.ico',
//     badge: '/og-image.png',
//     tag: data.tag || 'chat-message',
//     data: {
//       url: data.url || '/home',
//       chatId: data.chatId || null,
//     },
//   };

//   event.waitUntil(self.registration.showNotification(title, options));
// });

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();

//   const targetUrl = event.notification.data?.url || '/home';

//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
//       for (const client of clientList) {
//         if ('focus' in client) {
//           client.navigate(targetUrl);
//           return client.focus();
//         }
//       }

//       if (clients.openWindow) {
//         return clients.openWindow(targetUrl);
//       }
//     })
//   );
// });
