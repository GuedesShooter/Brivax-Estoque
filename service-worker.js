diff --git a/service-worker.js b/service-worker.js
index 497993797d99dc045a6f9df9a4294cc0f0f7ed7a..58c6f6eff519a0f0eee18f50232b9168a1e9a2f3 100644
--- a/service-worker.js
+++ b/service-worker.js
@@ -1 +1,50 @@
-self.addEventListener('fetch',()=>{});
\ No newline at end of file
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
