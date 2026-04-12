const CACHE = 'learncrib-v1'
const PRECACHE = [
  '/',
  '/index.html',
  '/assets/img/logo_icon.png',
  '/assets/img/logo_b.png',
  '/assets/img/math.svg',
  '/assets/img/file-searching.svg',
  '/assets/img/message-sent.svg',
  '/assets/img/personal-information.svg',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return // never cache API calls

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      return cached || fresh
    })
  )
})
