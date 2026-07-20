// Service worker mínimo: cache do app shell para abertura offline básica.
// Sem push, sem estratégias complexas — os dados vêm do Supabase/localStorage em runtime.
const CACHE = 'habitos-shell-v1'
const BASE = '/Dashboard/'
const ASSETS = [BASE, BASE + 'index.html', BASE + 'manifest.webmanifest', BASE + 'icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Nunca cachear chamadas ao Supabase — dados sempre da rede.
  if (url.hostname.endsWith('supabase.co')) return

  // Navegação: network-first com fallback ao shell (funciona offline).
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(BASE + 'index.html')))
    return
  }

  // Demais assets: cache-first, atualizando o cache em background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok && url.origin === self.location.origin) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
