/* Instalação sem cache de páginas, sessões, APIs ou dados administrativos.
 * As navegações continuam sendo atendidas pela versão publicada do portal. */
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
