// Service worker: guarda una copia de la app para que abra sin conexión.
// Estrategia "primero la red": si hay internet usa lo último, si no, la copia.

importScripts('./ics.js');

const CACHE = 'mi-centro-v7';
const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './frases.js',
  './ics.js',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  const url = new URL(pedido.url);
  if (pedido.method !== 'GET' || url.origin !== self.location.origin) return;

  // Recordatorios: el archivo .ics se arma acá mismo, en el teléfono.
  // Así el nombre de la tarea nunca viaja a ningún servidor.
  if (url.pathname.endsWith('/recordatorio.ics')) {
    evento.respondWith(responderRecordatorio(url.searchParams));
    return;
  }

  evento.respondWith(
    fetch(pedido)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(pedido, copia));
        }
        return respuesta;
      })
      .catch(async () => (await caches.match(pedido))
        ?? (pedido.mode === 'navigate' ? caches.match('./index.html') : Response.error())),
  );
});

function responderRecordatorio(parametros) {
  try {
    const ics = self.crearIcs({
      titulo: parametros.get('titulo'),
      fecha: parametros.get('fecha'),
      hora: parametros.get('hora'),
      repetir: parametros.get('repetir'),
      dias: parametros.get('dias'),
    });
    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="recordatorio.ics"',
      },
    });
  } catch {
    return new Response('Recordatorio inválido', { status: 400 });
  }
}
