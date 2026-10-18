// Servidor local para desarrollo. Solo usa lo que ya trae Node (sin dependencias).
//   npm start     → solo en esta PC (http://localhost:5173)
//   npm run red   → también en tu Wi-Fi, para abrirla desde el iPhone

import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const enRed = process.argv.includes('--red');
const host = enRed ? '0.0.0.0' : '127.0.0.1';
const puerto = Number(process.env.PORT) || 5173;

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const servidor = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }

  let ruta;
  try {
    ruta = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  } catch {
    res.writeHead(400).end('Ruta inválida');
    return;
  }
  if (ruta.endsWith('/')) ruta += 'index.html';

  // Seguridad: nunca servir archivos de fuera de public/ (ataque "path traversal").
  const archivo = path.join(raiz, path.normalize(ruta));
  if (!archivo.startsWith(raiz + path.sep)) {
    res.writeHead(403).end('Prohibido');
    return;
  }

  try {
    const datos = await readFile(archivo);
    res.writeHead(200, {
      'Content-Type': tipos[path.extname(archivo)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : datos);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
  }
});

servidor.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n  El puerto ${puerto} ya está en uso. ¿Quedó otro servidor abierto?\n`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

servidor.listen(puerto, host, () => {
  console.log('\n  Mi Centro de Control está funcionando');
  console.log(`  En esta PC:  http://localhost:${puerto}`);
  if (enRed) {
    for (const ip of ipsLocales()) {
      console.log(`  En el iPhone (misma Wi-Fi):  http://${ip}:${puerto}`);
    }
  } else {
    console.log('  Para abrirla desde el iPhone: npm run red');
  }
  console.log('  Para frenar el servidor: Ctrl + C\n');
});

function ipsLocales() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}
