const serveShareTarget = async (event) => {
  event.waitUntil(
    (async function () {
      // The page sends this message to tell the service worker it's ready to receive the file.
      await nextMessage('share-ready');
      const client = await self.clients.get(event.resultingClientId);
      const data = await event.request.formData();
      const file = data.get('externalMedia');
      client.postMessage({ file, action: 'load-image' });
    })(),
  );
}

self.addEventListener("fetch", (event) => {
  // Regular requests not related to Web Share Target.
  if (event.request.method !== "POST") {
    event.respondWith(fetch(event.request));
    return;
  }

  serveShareTarget(event);
  return;
});
