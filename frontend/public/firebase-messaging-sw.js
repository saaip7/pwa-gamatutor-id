// Minimal service worker for Firebase Cloud Messaging
// Handles push events when main Serwist SW is not active (dev mode)
self.addEventListener("push", function (event) {
  var payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) {}

  var title = (payload.notification && payload.notification.title) || "GamaTutor";
  var body = (payload.notification && payload.notification.body) || "";
  var data = payload.data || {};

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: data,
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/dashboard";
  var origin = self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.startsWith(origin) && "focus" in clients[i]) {
          clients[i].navigate(url);
          return clients[i].focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
