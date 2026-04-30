(function () {
  if (!("serviceWorker" in navigator)) return;

  const reloadKey = "xv-service-worker-cleanup-reloaded";

  async function cleanup() {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (!registrations.length) return;

    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }

    if (navigator.serviceWorker.controller && sessionStorage.getItem(reloadKey) !== "1") {
      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    }
  }

  cleanup().catch(() => {
    sessionStorage.removeItem(reloadKey);
  });
})();
