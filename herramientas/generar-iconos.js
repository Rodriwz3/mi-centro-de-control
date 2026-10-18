// Genera los íconos PNG de la app (fondo violeta con un tilde blanco)
// sin usar programas externos. Se corre con: npm run iconos

import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const carpeta = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(carpeta, { recursive: true });

const arriba = [99, 102, 241]; // #6366f1
const abajo = [124, 58, 237]; // #7c3aed
const tilde = [[0.29, 0.52], [0.44, 0.67], [0.72, 0.37]];
const grosor = 0.055;

function distanciaASegmento(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function crearPng(lado) {
  const filas = Buffer.alloc((lado * 4 + 1) * lado);
  for (let y = 0; y < lado; y++) {
    const inicio = y * (lado * 4 + 1);
    filas[inicio] = 0; // filtro PNG "ninguno"
    const v = y / (lado - 1);
    for (let x = 0; x < lado; x++) {
      const px = (x + 0.5) / lado;
      const py = (y + 0.5) / lado;
      const d = Math.min(
        distanciaASegmento(px, py, tilde[0], tilde[1]),
        distanciaASegmento(px, py, tilde[1], tilde[2]),
      );
      const alfa = Math.max(0, Math.min(1, (grosor - d) * lado + 0.5)); // borde suavizado
      const i = inicio + 1 + x * 4;
      for (let c = 0; c < 3; c++) {
        const fondo = arriba[c] + (abajo[c] - arriba[c]) * v;
        filas[i + c] = Math.round(fondo + (255 - fondo) * alfa);
      }
      filas[i + 3] = 255;
    }
  }

  const bloque = (tipo, datos) => {
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const tipoYDatos = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
    const control = Buffer.alloc(4);
    control.writeUInt32BE(crc32(tipoYDatos));
    return Buffer.concat([largo, tipoYDatos, control]);
  };

  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(lado, 0);
  cabecera.writeUInt32BE(lado, 4);
  cabecera.set([8, 6, 0, 0, 0], 8); // 8 bits, RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera),
    bloque('IDAT', deflateSync(filas)),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

for (const [nombre, lado] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  writeFileSync(path.join(carpeta, nombre), crearPng(lado));
  console.log(`  Creado public/icons/${nombre} (${lado}×${lado})`);
}
