+const CACHE_NAME = 'brivax-cache-v1';
+const ASSETS = [
+  './',
+  './index.html',
+  './style.css',
+  './app.js',
+  './manifest.webmanifest',
+  './icons/icon-192.png',
+  './icons/icon-512.png'
+];
+
+self.addEventListener('install', (event) => {
+  event.waitUntil(
+    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
+  );
+  self.skipWaiting();
+});
+
+self.addEventListener('activate', (event) => {
+  event.waitUntil(
+    caches
+      .keys()
+      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
+  );
+  self.clients.claim();
+});
+
+self.addEventListener('fetch', (event) => {
+  if (event.request.method !== 'GET') {
+    return;
+  }
+
+  event.respondWith(
+    caches.match(event.request).then((cached) => {
+      if (cached) {
+        return cached;
+      }
+      return fetch(event.request)
+        .then((response) => {
+          if (!response || response.status !== 200 || response.type === 'opaque') {
+            return response;
+          }
+          const cloned = response.clone();
+          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
+          return response;
+        })
+        .catch(() => cached);
+    })
+  );
+});
