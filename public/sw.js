// public/sw.js

self.addEventListener("push", function (event) {
  let payload = { 
    title: "New Notification", 
    body: "You have a new message", 
    icon: "/icons/pkdmart-192.png",
    badge: "/icons/pkdmart-96.png",
    data: {}
  }

  try {
    if (event.data) {
      payload = event.data.json()
    }
  } catch (err) {
    payload.body = event.data ? event.data.text() : payload.body
  }

  const title = payload.title || "Notification"

  const options = {
    body: payload.body,
    icon: payload.icon || "/icons/pkdmart-192.png",     // 🔥 proper notification icon
    badge: payload.badge || "/icons/pkdmart-96.png",   // 🔥 status bar icon
    vibrate: [200, 100, 200],                        // 🔥 shows vibration popup
    requireInteraction: true,                        // 🔥 keeps notification visible
    renotify: true,
    tag: "pkd-admin-notification",
    data: payload.data || {},
    actions: [
      {
        action: "open_app",
        title: "Open",
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// 🔥 Open page when tapped
self.addEventListener("notificationclick", function (event) {
  event.notification.close()

  const urlToOpen = event.notification?.data?.url || "/orders"

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
