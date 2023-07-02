const nextMessageResolveMap = new Map();

function nextMessage(dataVal) {
  return new Promise((resolve) => {
    if (!nextMessageResolveMap.has(dataVal)) {
      nextMessageResolveMap.set(dataVal, []);
    }
    nextMessageResolveMap.get(dataVal).push(resolve);
  });
}

self.addEventListener('message', (event) => {
  const resolvers = nextMessageResolveMap.get(event.data);
  if (!resolvers) return;
  nextMessageResolveMap.delete(event.data);
  for (const resolve of resolvers) resolve();
});

const serveShareTarget = async (event) => {
  event.waitUntil(
    (async function () {
      // The page sends this message to tell the service worker it's ready to receive the file.
      await nextMessage('share-ready');
      const client = await self.clients.get(event.resultingClientId || event.clientId)
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
