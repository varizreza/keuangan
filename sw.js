/* Service worker Keuangan Keluarga.
   Tugas: menyimpan "kerangka" aplikasi (halaman, ikon, Bootstrap, Chart.js) agar aplikasi terbuka tanpa internet.
   Data keuangan TIDAK disimpan di sini: data memakai IndexedDB di dalam aplikasi, dan permintaan ke server
   Apps Script tidak pernah dicegat. Naikkan VERSION setiap kali index.html berubah supaya HP memuat versi baru. */
const VERSION = 'v1';
const SHELL_CACHE = 'keu-shell-' + VERSION;
const CDN_CACHE = 'keu-cdn-v1';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js'
];
const CDN_HOSTS = ['cdn.jsdelivr.net'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    const cdn = await caches.open(CDN_CACHE);
    for (const url of CDN) {
      try {
        if (await cdn.match(url)) continue;
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) continue;
        await cdn.put(url, res.clone());
        if (/\.css(\?|$)/.test(url)) {
          const css = await res.text();
          const fonts = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => new URL(m[1], url).href).filter(u => /\.(woff2?|ttf)(\?|$)/.test(u));
          for (const f of fonts) { try { if (!(await cdn.match(f))) { const r = await fetch(f, { mode: 'cors' }); if (r.ok) await cdn.put(f, r); } } catch (e) {} }
        }
      } catch (e) { /* dilengkapi saat dipakai pertama kali */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, CDN_CACHE];
    for (const k of await caches.keys()) if (k.startsWith('keu-') && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

function timeout(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)); }

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Halaman utama: coba jaringan dulu (agar versi baru cepat terpakai), jika gagal/lambat pakai salinan.
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        const res = await Promise.race([fetch(req), timeout(4000)]);
        if (res && res.ok) { const c = await caches.open(SHELL_CACHE); c.put('index.html', res.clone()); }
        return res;
      } catch (e) {
        return (await caches.match('index.html', { ignoreSearch: true })) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Pustaka CDN: simpan lalu pakai salinan.
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const c = await caches.open(CDN_CACHE);
      const hit = await c.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }
      catch (e) { return Response.error(); }
    })());
    return;
  }

  // File sendiri (config.js, ikon, manifest): salinan dulu, perbarui di belakang layar.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const c = await caches.open(SHELL_CACHE);
      const hit = await c.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then(res => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await fresh) || Response.error();
    })());
  }
  // Selain itu (server Apps Script, dsb.) tidak dicegat.
});
