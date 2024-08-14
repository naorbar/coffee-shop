

'use strict';


// TODO NAOR:
// This is a listener to push notifications:
// For more details: 
// https://developer.mozilla.org/en-US/docs/Web/API/PushEvent
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
// https://web-push-book.gauntface.com/display-a-notification/

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push has this data: "${event.data.text()}"`);
  
  const data = event.data?.json() ?? {}; 
  const options = {
	  // Visual Options:
    data: data,
      body: data.message,
      icon: data.icon,
      image: data.image,
    badge: data.badge,
    // sound: "<URL String>",
    // dir: "<String of 'auto' | 'ltr' | 'rtl'>", (direction)
    
    // Behavioural Options:
    tag: data.tag,
    renotify: data.renotify,
    requireInteraction: data.requireInteraction
    // silent: "<Boolean>",
    // vibrate: "<Array of Integers>",
    
    // Both Visual & Behavioural Options:
    // actions: "<Array of Strings>",
    
    // Information Option. No visual affect:
    // timestamp: "<Long>"  
  };
  event.waitUntil(self.registration.showNotification(data.title, options)); 
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification Click Received.');
  console.log(`[Service Worker] Notification Click has this data: "${event.notification.data.url}"`);
  // Was a normal notification click
  event.notification.close();
  clients.openWindow(
     // E.g. "https://www.urban-vpn.com/",
	 event.notification.data.url,
  );
});