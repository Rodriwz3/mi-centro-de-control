// Mi Centro de Control · by Rodricarabajal
// La lógica de la app. Los datos se guardan solo en este dispositivo (localStorage).

import { FRASES, VERSION_FRASES } from './frases.js';

const CLAVE = 'mi-centro-de-control:v1';
// El fondo de pantalla va aparte: es pesado y no entra en la copia de seguridad.
const CLAVE_FONDO = 'mi-centro-de-control:fondo';
const TEMAS = { apple: 'Clásico', onepiece: 'One Piece', naruto: 'Naruto', blackclover: 'Black Clover' };
const ETIQUETA_FRASE = { onepiece: 'SE BUSCA', naruto: 'PERGAMINO DEL DÍA', blackclover: 'GRIMORIO DEL DÍA' };
const VISTAS = { hoy: 'Hoy', tareas: 'Tareas', habitos: 'Hábitos', objetivos: 'Objetivos', frases: 'Frases', ajustes: 'Ajustes' };
const DIAS_SIN_COPIA_PARA_AVISAR = 14;
const PRIORIDADES = { alta: 'Alta', media: 'Media', baja: 'Baja' };
const ORDEN_PRIORIDAD = { alta: 0, media: 1, baja: 2 };
const EXCLAMACIONES = { alta: '!!!', media: '!!', baja: '!' };
const CATEGORIAS = {
  onepiece: 'One Piece 🏴‍☠️',
  naruto: 'Naruto 🍥',
  blackclover: 'Black Clover 🍀',
  anime: 'Otros animes',
  motivacion: 'Motivación',
  deporte: 'Deporte',
  centro: 'Mi Centro',
  mias: 'Mías',
};
const ICONO_CHECK = 'M5 12.5l4.5 4.5L19 7.5';
const ICONO_BORRAR = 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3';
const ICONO_CAMPANA = 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0';
const ICONO_RELOJ = 'M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 9v4l2.5 2M9 2h6';

const TITULO_ENFOQUE = {
  apple: 'Modo enfoque',
  onepiece: 'Entrenamiento en el Grand Line 🏴‍☠️',
  naruto: 'Entrenamiento ninja 🍥',
  blackclover: 'Entrenamiento de magia 🍀',
};

// Berries que suma cada cosa a tu recompensa (como el cartel de "Se busca").
const PUNTOS = { tarea: { alta: 30_000, media: 20_000, baja: 10_000 }, diaDeHabito: 5_000, objetivo: 100_000, minuto: 1_000 };

// Días de la semana como los cuenta JavaScript: 0 = domingo, 1 = lunes … 6 = sábado.
const TODOS_LOS_DIAS = [0, 1, 2, 3, 4, 5, 6];
const LETRAS_DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Hábitos básicos para arrancar. Se pueden borrar o agregar otros.
const HABITOS_INICIALES = [
  { nombre: 'Lavarme los dientes', meta: 2, diasSemana: TODOS_LOS_DIAS },
  { nombre: 'Bañarme', meta: 1, diasSemana: TODOS_LOS_DIAS },
  { nombre: 'Leer 20 minutos', meta: 1, diasSemana: TODOS_LOS_DIAS },
  { nombre: 'Ir al gimnasio', meta: 1, diasSemana: [1, 2, 3, 4, 5] },
];

const $ = (selector) => document.querySelector(selector);

let filtroTareas = 'pendientes';
let otraFrase = 0;

// ---------- Fechas (siempre en hora local, nunca en UTC) ----------

const dos = (n) => String(n).padStart(2, '0');
const claveDia = (f = new Date()) => `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}`;

function sumarDias(fecha, dias) {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function desdeClave(clave) {
  const [anio, mes, dia] = clave.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

const fechaCorta = (clave) => desdeClave(clave).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

// ---------- Datos ----------

const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esFecha = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const buscar = (lista, id) => lista.find((x) => x.id === id);

// Revisa y limpia los datos (guardados o importados) para que un archivo
// roto o manipulado no pueda romper la app.
function normalizar(datos) {
  const lista = (v) => (Array.isArray(v) ? v : []);
  // Frases: la primera vez se cargan todas. Si ya tenías frases de una versión
  // anterior, se suman solo las nuevas (las que borraste no vuelven).
  let frases = FRASES;
  let versionFrases = VERSION_FRASES;
  if (Array.isArray(datos?.frases)) {
    const anterior = Math.max(1, Math.round(Number(datos.versionFrases) || 1));
    const existentes = new Set(datos.frases.map((f) => f?.texto));
    frases = [...datos.frases, ...FRASES.filter((f) => f.desde > anterior && !existentes.has(f.texto))];
    versionFrases = Math.max(anterior, VERSION_FRASES);
  }
  const habitos = Array.isArray(datos?.habitos) ? datos.habitos : HABITOS_INICIALES;
  return {
    tareas: lista(datos?.tareas).map((t) => ({
      id: texto(t?.id, 40) || nuevoId(),
      titulo: texto(t?.titulo, 120),
      prioridad: Object.hasOwn(PRIORIDADES, t?.prioridad) ? t.prioridad : 'media',
      fecha: esFecha(t?.fecha) ? t.fecha : '',
      hecha: t?.hecha === true,
      hechaEn: t?.hecha === true ? Number(t?.hechaEn) || 0 : 0, // cuándo se completó
      creada: Number(t?.creada) || Date.now(),
    })).filter((t) => t.titulo),
    habitos: habitos.map((h) => {
      const meta = Math.min(10, Math.max(1, Math.round(Number(h?.meta) || 1)));
      const diasSemana = [...new Set(lista(h?.diasSemana).map(Number))]
        .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6).sort();
      // registro: cuántas veces se hizo cada día, por ejemplo { "2026-10-18": 2 }
      const registro = {};
      if (h?.registro && typeof h.registro === 'object') {
        for (const [dia, veces] of Object.entries(h.registro)) {
          const n = Math.round(Number(veces));
          if (esFecha(dia) && n > 0) registro[dia] = Math.min(meta, n);
        }
      }
      // Versión anterior: solo guardaba la lista de días cumplidos.
      for (const dia of lista(h?.dias).filter(esFecha)) registro[dia] = meta;
      return {
        id: texto(h?.id, 40) || nuevoId(),
        nombre: texto(h?.nombre, 60),
        meta,
        diasSemana: diasSemana.length ? diasSemana : TODOS_LOS_DIAS,
        registro,
        creado: Number(h?.creado) || Date.now(),
      };
    }).filter((h) => h.nombre),
    objetivos: lista(datos?.objetivos).map((o) => ({
      id: texto(o?.id, 40) || nuevoId(),
      titulo: texto(o?.titulo, 120),
      fecha: esFecha(o?.fecha) ? o.fecha : '',
      progreso: Math.min(100, Math.max(0, Math.round(Number(o?.progreso) || 0))),
      creado: Number(o?.creado) || Date.now(),
    })).filter((o) => o.titulo),
    frases: frases.map((f) => ({
      id: texto(f?.id, 40) || nuevoId(),
      texto: texto(f?.texto, 240),
      autor: texto(f?.autor, 80),
      categoria: categoriaDe(f),
    })).filter((f) => f.texto),
    versionFrases,
    enfoque: normalizarEnfoque(datos?.enfoque),
    ajustes: {
      tema: Object.hasOwn(TEMAS, datos?.ajustes?.tema) ? datos.ajustes.tema : 'apple',
      // Fechas (en milisegundos) para saber cuándo recordar hacer una copia.
      ultimaCopia: Number(datos?.ajustes?.ultimaCopia) || 0,
      primerUso: Number(datos?.ajustes?.primerUso) || Date.now(),
    },
  };
}

// Modo enfoque: minutos estudiados por día y la sesión en curso (si hay una).
function normalizarEnfoque(enfoque) {
  const registro = {};
  if (enfoque?.registro && typeof enfoque.registro === 'object') {
    for (const [dia, minutos] of Object.entries(enfoque.registro)) {
      const n = Math.round(Number(minutos));
      if (esFecha(dia) && n > 0) registro[dia] = Math.min(1440, n);
    }
  }
  const a = enfoque?.actual;
  const duracion = Math.round(Number(a?.duracion));
  const fin = Number(a?.fin) || 0;
  const restante = Math.max(0, Number(a?.restante) || 0);
  // fin: cuándo termina si está corriendo. restante: milisegundos que faltan si está en pausa.
  const actual = duracion >= 1 && duracion <= 180 && (fin || restante)
    ? { duracion, fin, restante, tareaId: texto(a?.tareaId, 40) }
    : null;
  return { registro, actual };
}

// Las frases de la versión 1 estaban todas en "anime"; ahora cada anime tiene la suya.
function categoriaDe(frase) {
  const autor = String(frase?.autor ?? '');
  if (frase?.categoria === 'anime' && autor.includes('One Piece')) return 'onepiece';
  if (frase?.categoria === 'anime' && autor.includes('· Naruto')) return 'naruto';
  return Object.hasOwn(CATEGORIAS, frase?.categoria) ? frase.categoria : 'mias';
}

function cargar() {
  try {
    return normalizar(JSON.parse(localStorage.getItem(CLAVE)) ?? {});
  } catch (error) {
    console.error('No se pudieron leer los datos guardados:', error);
    return normalizar({});
  }
}

// Se carga recién acá, cuando ya existen todas las funciones de arriba.
let estado = cargar();

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    avisar('No se pudo guardar. Revisá el espacio del dispositivo.');
  }
}

function cambiar(modificar) {
  modificar();
  guardar();
  render();
}

// ---------- Hábitos: veces por día, días que tocan y rachas ----------

const vecesDelDia = (habito, clave = claveDia()) => habito.registro[clave] ?? 0;
const cumplido = (habito, clave) => vecesDelDia(habito, clave) >= habito.meta;
const tocaElDia = (habito, fecha = new Date()) => habito.diasSemana.includes(fecha.getDay());

// Días seguidos cumplidos. Los días que no tocan (ej.: gimnasio el sábado)
// se saltean y no cortan la racha. Si hoy todavía no lo cumpliste, tampoco la corta.
function racha(habito) {
  let cuenta = 0;
  let dia = new Date();
  for (let i = 0; i < 3660; i++, dia = sumarDias(dia, -1)) {
    if (!tocaElDia(habito, dia)) continue;
    if (cumplido(habito, claveDia(dia))) cuenta++;
    else if (i > 0) break;
  }
  return cuenta;
}

function mejorRacha(habito) {
  const fechas = Object.keys(habito.registro).sort();
  if (!fechas.length) return 0;
  const hoy = claveDia();
  let mejor = 0;
  let actual = 0;
  for (let dia = desdeClave(fechas[0]); claveDia(dia) <= hoy; dia = sumarDias(dia, 1)) {
    const clave = claveDia(dia);
    if (!tocaElDia(habito, dia)) continue;
    if (cumplido(habito, clave)) mejor = Math.max(mejor, ++actual);
    else if (clave !== hoy) actual = 0;
  }
  return mejor;
}

// Rango ninja según los días de racha, como en Naruto.
function rangoNinja(dias) {
  if (dias >= 30) return 'Hokage 🍥';
  if (dias >= 14) return 'Jōnin 🍥';
  if (dias >= 7) return 'Chūnin 🍥';
  if (dias >= 3) return 'Genin 🍥';
  return '';
}

const alAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const FESTEJOS_HABITO = ['¡No rendirse es mi magia! 🍀', '¡Dattebayo! 🍥', '¡Superaste tus límites! 🍀', '¡Ese es tu camino ninja! 🍥'];
const FESTEJOS_TAREA = ['¡Una isla más en tu Grand Line! 🏴‍☠️', '¡Tarea tachada, capitán! 🏴‍☠️', '¡Un paso más hacia el One Piece! 🏴‍☠️'];

function describirDias(dias) {
  const clave = dias.join(',');
  if (dias.length === 7) return 'Todos los días';
  if (clave === '1,2,3,4,5') return 'Lunes a viernes';
  if (clave === '0,6') return 'Fines de semana';
  return [...dias.filter((d) => d !== 0), ...dias.filter((d) => d === 0)]
    .map((d) => new Date(2026, 0, 4 + d).toLocaleDateString('es-AR', { weekday: 'short' }))
    .join(', ');
}

function ordenarTareas(tareas) {
  return [...tareas].sort((a, b) =>
    Number(a.hecha) - Number(b.hecha)
    || ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad]
    || (a.fecha || '9999').localeCompare(b.fecha || '9999')
    || a.creada - b.creada);
}

// La frase cambia sola cada día; "Otra frase" muestra la siguiente.
// Recorre todas las frases saltando de a varias (así se mezclan los animes y
// las categorías) y no repite ninguna hasta haber mostrado todas.
// Con un tema de anime, un día sí y uno no la frase es de ese anime.
function fraseDelDia() {
  const total = estado.frases.length;
  if (!total) return null;
  const paso = Math.round(desdeClave(claveDia()).getTime() / 86_400_000) + otraFrase;
  const delTema = estado.frases.filter((f) => f.categoria === estado.ajustes.tema);
  if (delTema.length && paso % 2 === 0) return delTema[Math.floor(paso / 2) % delTema.length];
  const mcd = (a, b) => (b ? mcd(b, a % b) : a);
  const salto = [37, 41, 43, 47, 53].find((p) => mcd(p, total) === 1) ?? 1;
  return estado.frases[((paso * salto) % total + total) % total];
}

// ---------- Construcción de la pantalla ----------

// Crea elementos de forma segura: el texto del usuario se agrega como texto,
// nunca como HTML, así no se puede "inyectar" código (ataque XSS).
function el(etiqueta, props = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(props)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (clave === 'class') nodo.className = valor;
    else if (clave === 'dataset') Object.assign(nodo.dataset, valor);
    else if (clave in nodo) nodo[clave] = valor;
    else nodo.setAttribute(clave, valor);
  }
  nodo.append(...hijos.flat().filter((h) => h !== null && h !== undefined && h !== false));
  return nodo;
}

function svg(etiqueta, atributos = {}, ...hijos) {
  const nodo = document.createElementNS('http://www.w3.org/2000/svg', etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) nodo.setAttribute(clave, valor);
  nodo.append(...hijos);
  return nodo;
}

const icono = (trazo, grosor = 2) => svg('svg', {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': grosor,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
}, svg('path', { d: trazo }));

// Anillo de progreso, como los de la app Actividad del iPhone.
function anillo(fraccion, color) {
  const porcentaje = Math.round(Math.min(1, Math.max(0, fraccion)) * 100);
  return svg('svg', { class: 'anillo', viewBox: '0 0 36 36', 'aria-hidden': 'true' },
    svg('circle', { class: 'pista', cx: 18, cy: 18, r: 15.915, stroke: color }),
    // En 0 % se oculta, si no el borde redondeado deja un puntito.
    svg('circle', { cx: 18, cy: 18, r: 15.915, stroke: color, 'stroke-dasharray': `${porcentaje} 100`, 'stroke-opacity': porcentaje ? 1 : 0 }));
}

const vacio = (mensaje) => el('li', { class: 'vacio' }, mensaje);

// Zona de la fila que abre la hoja de edición al tocarla.
function editable(tipo, id, nombre, ...hijos) {
  return el('div', {
    class: 'editable', role: 'button', tabIndex: 0, 'aria-label': `Editar "${nombre}"`,
    dataset: { accion: 'editar', tipo, id },
  }, ...hijos);
}

function botonCheck(accion, id, marcado, etiqueta) {
  return el('button', {
    type: 'button', class: 'check', 'aria-pressed': String(marcado), 'aria-label': etiqueta,
    dataset: { accion, id },
  }, icono(ICONO_CHECK, 3));
}

function botonIcono(accion, id, trazo, etiqueta, clase) {
  return el('button', {
    type: 'button', class: `icono-boton ${clase}`, 'aria-label': etiqueta, dataset: { accion, id },
  }, icono(trazo, 1.8));
}

function itemTarea(tarea, conAcciones = true) {
  const hoy = claveDia();
  const detalles = [el('span', {}, `Prioridad ${PRIORIDADES[tarea.prioridad].toLowerCase()}`)];
  if (tarea.fecha) {
    let textoFecha = fechaCorta(tarea.fecha);
    let clase = '';
    if (!tarea.hecha && tarea.fecha < hoy) [textoFecha, clase] = [`Vencida · ${textoFecha}`, 'vence-vencida'];
    else if (!tarea.hecha && tarea.fecha === hoy) [textoFecha, clase] = ['Hoy', 'vence-hoy'];
    else if (!tarea.hecha && tarea.fecha === claveDia(sumarDias(new Date(), 1))) textoFecha = 'Mañana';
    detalles.push(' · ', el('span', { class: clase }, textoFecha));
  }

  return el('li', { class: `item${tarea.hecha ? ' hecho' : ''}` },
    botonCheck('tarea-alternar', tarea.id, tarea.hecha, tarea.hecha ? 'Marcar como pendiente' : 'Marcar como hecha'),
    el('div', { class: 'item-linea' },
      el('div', { class: 'item-cuerpo' },
        editable('tarea', tarea.id, tarea.titulo,
          el('p', { class: 'item-titulo' },
            el('span', { class: 'excl', 'aria-hidden': 'true' }, EXCLAMACIONES[tarea.prioridad]),
            tarea.titulo),
          el('p', { class: 'item-sub' }, detalles))),
      conAcciones && !tarea.hecha
        ? botonIcono('recordar-tarea', tarea.id, ICONO_CAMPANA, `Recordatorio para "${tarea.titulo}"`, 'campana')
        : null));
}

// Botón contador: cada toque suma 1. Con 2 veces por día muestra "1/2",
// y al llegar a la meta se pone verde con un tilde.
function botonContador(habito) {
  const veces = vecesDelDia(habito);
  const listo = veces >= habito.meta;
  const toca = tocaElDia(habito);
  const etiqueta = !toca
    ? `"${habito.nombre}": hoy no toca`
    : listo ? `"${habito.nombre}": cumplido hoy` : `Sumar 1 a "${habito.nombre}" (${veces} de ${habito.meta})`;
  const boton = el('button', {
    type: 'button', class: `contador${listo ? ' listo' : ''}`, 'aria-label': etiqueta,
    disabled: !toca, dataset: { accion: 'habito-sumar', id: habito.id },
  });
  if (listo) {
    boton.append(icono(ICONO_CHECK, 3));
  } else {
    const verde = getComputedStyle(document.documentElement).getPropertyValue('--verde').trim();
    boton.append(anillo(veces / habito.meta, verde));
    if (habito.meta > 1) boton.append(el('span', { class: 'contador-texto' }, `${veces}/${habito.meta}`));
  }
  return boton;
}

function itemHabito(habito, completo) {
  const hoy = claveDia();
  const toca = tocaElDia(habito);
  const dias = racha(habito);
  const mejor = mejorRacha(habito);
  const veces = vecesDelDia(habito);

  const detalles = [
    habito.meta > 1 ? `${habito.meta} veces por día` : 'Una vez por día',
    habito.diasSemana.length < 7 ? describirDias(habito.diasSemana) : null,
  ].filter(Boolean).join(' · ');

  const rango = rangoNinja(dias);
  let estadoRacha = dias ? `Racha: ${dias} ${dias === 1 ? 'día' : 'días'}${rango ? ` · ${rango}` : ''}` : 'Sin racha todavía';
  if (completo && mejor > dias) estadoRacha += ` · Mejor: ${mejor}`;
  if (!toca) estadoRacha = `Hoy descansás${dias ? ` · Racha: ${dias}` : ''}`;

  const semana = completo
    ? el('div', { class: 'semana', 'aria-label': 'Últimos 7 días' },
      Array.from({ length: 7 }, (_, i) => {
        const fecha = sumarDias(new Date(), i - 6);
        const clave = claveDia(fecha);
        const n = vecesDelDia(habito, clave);
        let clase = '';
        let estadoDia = 'no hecho';
        if (!tocaElDia(habito, fecha)) [clase, estadoDia] = [' libre', 'no toca'];
        else if (n >= habito.meta) [clase, estadoDia] = [' lleno', 'cumplido'];
        else if (n > 0) [clase, estadoDia] = [' parcial', `${n} de ${habito.meta}`];
        return el('span', {
          class: `dia${clase}${clave === hoy ? ' hoy' : ''}`,
          title: `${fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}: ${estadoDia}`,
        }, LETRAS_DIAS[fecha.getDay()]);
      }))
    : null;

  return el('li', { class: `item${toca ? '' : ' descanso'}` },
    botonContador(habito),
    el('div', { class: 'item-linea' },
      el('div', { class: 'item-cuerpo' },
        editable('habito', habito.id, habito.nombre,
          el('p', { class: 'item-titulo' }, habito.nombre),
          el('p', { class: 'item-sub' }, completo ? `${detalles} — ${estadoRacha}` : estadoRacha)),
        semana),
      completo && veces > 0
        ? botonIcono('habito-restar', habito.id, 'M6 12h12', `Restar 1 a "${habito.nombre}"`, 'restar')
        : null,
      completo ? botonIcono('recordar-habito', habito.id, ICONO_CAMPANA, `Recordatorio para "${habito.nombre}"`, 'campana') : null));
}

function itemObjetivo(objetivo) {
  const hoy = claveDia();
  const logrado = objetivo.progreso === 100;
  const relleno = el('div', { class: 'progreso-relleno' });
  relleno.style.width = `${objetivo.progreso}%`;

  return el('li', { class: `item item-objetivo${logrado ? ' logrado' : ''}` },
    el('div', { class: 'item-linea' },
      el('div', { class: 'item-cuerpo' },
        editable('objetivo', objetivo.id, objetivo.titulo,
          el('p', { class: 'item-titulo' }, objetivo.titulo),
          objetivo.fecha
            ? el('p', { class: 'item-sub' }, `Meta: ${fechaCorta(objetivo.fecha)}${objetivo.fecha < hoy && !logrado ? ' · ya pasó' : ''}`)
            : null),
        el('div', { class: 'progreso' }, relleno),
        el('label', { class: 'deslizador' },
          el('span', {}, 'Avance'),
          el('input', {
            type: 'range', min: 0, max: 100, step: 5, value: objetivo.progreso,
            'aria-label': `Avance de "${objetivo.titulo}"`, dataset: { progreso: objetivo.id },
          }),
          el('output', { class: 'porcentaje' }, `${objetivo.progreso}%`)),
        logrado ? el('p', { class: 'logrado-texto' }, '¡Objetivo logrado! Tesoro encontrado 🏴‍☠️') : null)));
}

function itemFrase(frase) {
  return el('li', { class: 'item item-objetivo' },
    el('div', { class: 'item-linea' },
      el('div', { class: 'item-cuerpo' },
        el('p', { class: 'frase-texto' }, `“${frase.texto}”`),
        frase.autor ? el('p', { class: 'item-sub' }, frase.autor) : null),
      botonIcono('frase-borrar', frase.id, ICONO_BORRAR, 'Borrar frase', 'borrar')));
}

function tarjeta(etiqueta, valor, fraccion, color, enlace) {
  return el('a', { class: 'tarjeta', href: enlace },
    anillo(fraccion, color),
    el('span', { class: 'tarjeta-valor' }, String(valor)),
    el('span', { class: 'tarjeta-etiqueta' }, etiqueta));
}

// ---------- Vistas ----------

function renderHoy() {
  const hoy = claveDia();
  const pendientes = estado.tareas.filter((t) => !t.hecha);
  const hechasTareas = estado.tareas.length - pendientes.length;
  const habitosDeHoy = estado.habitos.filter((h) => tocaElDia(h));
  const hechosHoy = habitosDeHoy.filter((h) => cumplido(h, hoy)).length;
  const totalObjetivos = estado.objetivos.length;
  const promedio = totalObjetivos
    ? Math.round(estado.objetivos.reduce((suma, o) => suma + o.progreso, 0) / totalObjetivos)
    : 0;
  const colores = getComputedStyle(document.documentElement);

  const frase = fraseDelDia();
  $('#frase-del-dia').replaceChildren(...(frase
    ? [
      el('p', { class: 'frase-etiqueta' }, ETIQUETA_FRASE[estado.ajustes.tema] ?? ''),
      el('blockquote', {}, `“${frase.texto}”`),
      frase.autor ? el('figcaption', { class: 'frase-autor' }, `— ${frase.autor}`) : null,
      el('div', { class: 'frase-pie' },
        el('span', { class: 'tarjeta-etiqueta' }, `Frase del día · ${CATEGORIAS[frase.categoria]}`),
        estado.frases.length > 1 ? el('button', { type: 'button', class: 'boton-texto', dataset: { accion: 'otra-frase' } }, 'Otra frase') : null),
    ].filter(Boolean)
    : [el('p', { class: 'frase-vacia' }, 'Agregá frases que te inspiren en la pestaña Frases.')]));

  $('#resumen').replaceChildren(
    tarjeta('Tareas pendientes', pendientes.length, estado.tareas.length ? hechasTareas / estado.tareas.length : 0, colores.getPropertyValue('--rosa').trim(), '#tareas'),
    tarjeta('Hábitos hoy', `${hechosHoy}/${habitosDeHoy.length}`, habitosDeHoy.length ? hechosHoy / habitosDeHoy.length : 0, colores.getPropertyValue('--verde').trim(), '#habitos'),
    tarjeta('Objetivos', totalObjetivos ? `${promedio}%` : '—', promedio / 100, colores.getPropertyValue('--azul').trim(), '#objetivos'),
  );

  const importantes = ordenarTareas(pendientes).slice(0, 3);
  $('#hoy-tareas').replaceChildren(...(importantes.length
    ? importantes.map((t) => itemTarea(t, false))
    : [vacio(estado.tareas.length ? 'No tenés tareas pendientes. ¡Hasta Luffy se tomaría una siesta! 🏴‍☠️' : 'Agregá tu primera tarea en la pestaña Tareas.')]));

  // Primero los que tocan hoy; los de descanso (ej.: gimnasio el domingo) van al final.
  const habitosOrdenados = [...habitosDeHoy, ...estado.habitos.filter((h) => !tocaElDia(h))];
  $('#hoy-habitos').replaceChildren(...(habitosOrdenados.length
    ? habitosOrdenados.map((h) => itemHabito(h, false))
    : [vacio('Todavía no tenés hábitos. Creá uno en la pestaña Hábitos.')]));

  renderTarjetaEnfoque();
  renderSemana();
  renderAvisoCopia();
}

// ---------- Tu semana y recompensa ----------

function formatoMinutos(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const resto = minutos % 60;
  return `${Math.floor(minutos / 60)} h${resto ? ` ${resto} min` : ''}`;
}

function recompensa() {
  const tareas = estado.tareas.filter((t) => t.hecha).reduce((suma, t) => suma + PUNTOS.tarea[t.prioridad], 0);
  const habitos = estado.habitos.reduce((suma, h) =>
    suma + Object.keys(h.registro).filter((dia) => cumplido(h, dia)).length * PUNTOS.diaDeHabito, 0);
  const objetivos = estado.objetivos.filter((o) => o.progreso === 100).length * PUNTOS.objetivo;
  const minutos = Object.values(estado.enfoque.registro).reduce((suma, m) => suma + m, 0) * PUNTOS.minuto;
  return tareas + habitos + objetivos + minutos;
}

const dato = (etiqueta, valor) => el('div', { class: 'dato' },
  el('span', { class: 'dato-valor' }, String(valor)),
  el('span', { class: 'dato-etiqueta' }, etiqueta));

function renderSemana() {
  const hoy = claveDia();
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(new Date(), i - 6));
  const barras = dias.map((fecha) => {
    const clave = claveDia(fecha);
    const tocan = estado.habitos.filter((h) => tocaElDia(h, fecha));
    const hechos = tocan.filter((h) => cumplido(h, clave)).length;
    const relleno = el('span', { class: 'barra-relleno' });
    relleno.style.height = `${tocan.length ? Math.round((hechos / tocan.length) * 100) : 0}%`;
    return el('div', {
      class: `barra-dia${clave === hoy ? ' hoy' : ''}`,
      title: `${fecha.toLocaleDateString('es-AR', { weekday: 'long' })}: ${hechos} de ${tocan.length} hábitos`,
    }, el('div', { class: 'barra-pista' }, relleno), el('span', { class: 'barra-letra' }, LETRAS_DIAS[fecha.getDay()]));
  });

  const inicioSemana = desdeClave(claveDia(dias[0])).getTime();
  const tareasHechas = estado.tareas.filter((t) => t.hecha && t.hechaEn >= inicioSemana).length;
  const minutos = dias.reduce((suma, fecha) => suma + (estado.enfoque.registro[claveDia(fecha)] ?? 0), 0);
  const sombrero = svg('svg', { viewBox: '0 0 40 30', 'aria-hidden': 'true' },
    svg('ellipse', { cx: 20, cy: 22, rx: 19, ry: 6, fill: '#e9c46a', stroke: '#b8893b' }),
    svg('path', { d: 'M8 22q0-18 12-18t12 18z', fill: '#f4d58d', stroke: '#b8893b' }),
    svg('path', { d: 'M8.5 17q11.5 4 23 0v4q-11.5 4-23 0z', fill: '#d62828' }));

  $('#tu-semana').replaceChildren(
    el('div', { class: 'barras', role: 'img', 'aria-label': 'Hábitos cumplidos cada día de los últimos 7 días' }, barras),
    el('div', { class: 'estadisticas' },
      dato('Tareas hechas', tareasHechas),
      dato('Minutos de enfoque', formatoMinutos(minutos))),
    el('div', { class: 'recompensa' },
      sombrero,
      el('div', { class: 'recompensa-textos' },
        el('span', { class: 'recompensa-etiqueta' }, 'TU RECOMPENSA'),
        el('span', { class: 'recompensa-valor' }, `฿ ${recompensa().toLocaleString('es-AR')}`))),
    el('p', { class: 'nota' }, 'La recompensa sube con cada tarea, día de hábito cumplido, objetivo logrado y minuto de enfoque.'),
  );
}

// ---------- Modo enfoque (temporizador de estudio) ----------

const mmss = (ms) => {
  const segundos = Math.ceil(ms / 1000);
  return `${dos(Math.floor(segundos / 60))}:${dos(segundos % 60)}`;
};

function restanteMs() {
  const actual = estado.enfoque.actual;
  if (!actual) return 0;
  return actual.fin ? Math.max(0, actual.fin - Date.now()) : actual.restante;
}

function renderTarjetaEnfoque() {
  const actual = estado.enfoque.actual;
  const minutosHoy = estado.enfoque.registro[claveDia()] ?? 0;
  let titulo = TITULO_ENFOQUE[estado.ajustes.tema];
  let detalle = minutosHoy ? `Hoy llevás ${formatoMinutos(minutosHoy)} de enfoque` : 'Estudiá 25 minutos sin distracciones';
  if (actual) {
    titulo = actual.fin ? `Quedan ${mmss(restanteMs())}` : `En pausa · faltan ${mmss(restanteMs())}`;
    detalle = buscar(estado.tareas, actual.tareaId)?.titulo ?? 'Tocá para ver el temporizador';
  }
  $('#tarjeta-enfoque').replaceChildren(el('button', { type: 'button', class: 'tarjeta-enfoque', dataset: { accion: 'abrir-enfoque' } },
    icono(ICONO_RELOJ, 2),
    el('span', { class: 'tarjeta-enfoque-textos' },
      el('span', { class: 'tarjeta-enfoque-titulo' }, titulo),
      el('span', { class: 'tarjeta-enfoque-sub' }, detalle)),
    el('span', { class: 'tarjeta-enfoque-accion' }, actual ? 'Ver' : 'Empezar')));
}

// Actualiza solo el reloj (no toda la pantalla) para no interrumpir lo que estés haciendo.
function actualizarReloj() {
  const actual = estado.enfoque.actual;
  const total = (actual?.duracion ?? Number($('#enfoque-duracion').value)) * 60_000;
  const falta = actual ? restanteMs() : total;
  $('#reloj-tiempo').textContent = mmss(falta);
  $('#reloj-progreso').style.strokeDashoffset = String(339.29 * (1 - falta / total));
}

function renderDialogoEnfoque() {
  const actual = estado.enfoque.actual;
  $('#enfoque-titulo').textContent = TITULO_ENFOQUE[estado.ajustes.tema];
  $('#enfoque-config').hidden = Boolean(actual);
  const tarea = actual && buscar(estado.tareas, actual.tareaId);
  let subtitulo = 'Elegí cuánto tiempo y en qué. Sin celular, sin distracciones.';
  if (actual) subtitulo = tarea ? `Trabajando en: ${tarea.titulo}` : 'Concentrate en una sola cosa.';
  if (actual && !actual.fin) subtitulo = `En pausa. ${subtitulo}`;
  $('#enfoque-sub').textContent = subtitulo;
  const selectorTarea = $('#enfoque-tarea');
  selectorTarea.replaceChildren(el('option', { value: '' }, 'Nada en particular'),
    ...ordenarTareas(estado.tareas.filter((t) => !t.hecha)).map((t) => el('option', { value: t.id }, t.titulo)));
  const boton = (texto, accion, secundario) => el('button', {
    type: 'button', class: `boton${secundario ? ' boton-secundario' : ''}`, dataset: { accion },
  }, texto);
  let acciones = [boton('Cerrar', 'cerrar-dialogo', true), boton('Empezar', 'enfoque-empezar')];
  if (actual?.fin) acciones = [boton('Pausar', 'enfoque-pausar', true), boton('Terminar', 'enfoque-terminar')];
  else if (actual) acciones = [boton('Seguir', 'enfoque-seguir'), boton('Terminar', 'enfoque-terminar', true)];
  $('#enfoque-acciones').replaceChildren(...acciones);
  actualizarReloj();
}

let bloqueoPantalla = null;
async function mantenerPantallaEncendida() {
  try {
    bloqueoPantalla = await navigator.wakeLock?.request('screen');
  } catch {
    bloqueoPantalla = null; // el navegador no lo permite: no pasa nada
  }
}
function liberarPantalla() {
  bloqueoPantalla?.release().catch(() => {});
  bloqueoPantalla = null;
}

function completarEnfoque(minutos) {
  const hoy = claveDia();
  cambiar(() => {
    if (minutos > 0) estado.enfoque.registro[hoy] = (estado.enfoque.registro[hoy] ?? 0) + minutos;
    estado.enfoque.actual = null;
  });
  liberarPantalla();
  if ($('#dialogo-enfoque').open) renderDialogoEnfoque();
  avisar(minutos > 0 ? `¡Entrenamiento completo! +${formatoMinutos(minutos)} 🔥` : 'Enfoque cancelado');
}

// Se revisa una vez por segundo mientras hay una sesión en curso.
setInterval(() => {
  const actual = estado.enfoque.actual;
  if (!actual) return;
  if (actual.fin && Date.now() >= actual.fin) {
    completarEnfoque(actual.duracion);
    return;
  }
  if ($('#dialogo-enfoque').open) actualizarReloj();
  if (vistaActual() === 'hoy') renderTarjetaEnfoque();
}, 1000);

function renderTareas() {
  const visibles = estado.tareas.filter((t) =>
    filtroTareas === 'todas' || (filtroTareas === 'hechas') === t.hecha);
  const cuenta = {
    pendientes: estado.tareas.filter((t) => !t.hecha).length,
    hechas: estado.tareas.filter((t) => t.hecha).length,
    todas: estado.tareas.length,
  };
  for (const boton of document.querySelectorAll('[data-filtro]')) {
    const filtro = boton.dataset.filtro;
    boton.setAttribute('aria-pressed', String(filtro === filtroTareas));
    boton.textContent = `${filtro[0].toUpperCase()}${filtro.slice(1)} (${cuenta[filtro]})`;
  }
  const mensajes = {
    pendientes: estado.tareas.length ? 'No hay tareas pendientes.' : 'Agregá tu primera tarea arriba.',
    hechas: 'Todavía no completaste ninguna tarea.',
    todas: 'Agregá tu primera tarea arriba.',
  };
  $('#lista-tareas').replaceChildren(...(visibles.length
    ? ordenarTareas(visibles).map((t) => itemTarea(t))
    : [vacio(mensajes[filtroTareas])]));
  const botonBorrarHechas = $('#boton-borrar-hechas');
  botonBorrarHechas.hidden = !cuenta.hechas || filtroTareas === 'pendientes';
  botonBorrarHechas.textContent = `Borrar tareas hechas (${cuenta.hechas})`;
}

function diasDesde(milisegundos) {
  return Math.floor((Date.now() - milisegundos) / 86_400_000);
}

// ¿Hay algo que valga la pena respaldar?
const hayDatosPropios = () => estado.tareas.length > 0 || estado.objetivos.length > 0
  || estado.habitos.some((h) => Object.keys(h.registro).length > 0);

function renderAvisoCopia() {
  const { ultimaCopia, primerUso } = estado.ajustes;
  const dias = diasDesde(ultimaCopia || primerUso);
  const contenedor = $('#aviso-copia');
  if (!hayDatosPropios() || dias < DIAS_SIN_COPIA_PARA_AVISAR) {
    contenedor.replaceChildren();
    return;
  }
  contenedor.replaceChildren(el('div', { class: 'aviso-copia' },
    el('p', {}, ultimaCopia
      ? `Hace ${dias} días que no guardás una copia de tus datos.`
      : 'Todavía no guardaste ninguna copia de tus datos.'),
    el('button', { type: 'button', class: 'boton-texto', dataset: { accion: 'exportar' } }, 'Guardar')));
}

async function renderAjustes() {
  const { ultimaCopia } = estado.ajustes;
  const estadoCopia = $('#estado-copia');
  const dias = ultimaCopia ? diasDesde(ultimaCopia) : null;
  if (dias === null) estadoCopia.textContent = 'Todavía no guardaste ninguna copia.';
  else if (dias === 0) estadoCopia.textContent = 'Última copia: hoy.';
  else estadoCopia.textContent = `Última copia: hace ${dias} ${dias === 1 ? 'día' : 'días'}.`;
  estadoCopia.classList.toggle('alerta', dias === null || dias >= DIAS_SIN_COPIA_PARA_AVISAR);

  const persistente = await navigator.storage?.persisted?.().catch(() => false);
  $('#estado-almacenamiento').textContent = persistente
    ? 'Almacenamiento protegido: el navegador no va a borrar tus datos por falta de espacio.'
    : 'El navegador podría borrar tus datos si el teléfono se queda sin espacio. Hacé copias seguido.';
}

function renderHabitos() {
  $('#lista-habitos').replaceChildren(...(estado.habitos.length
    ? estado.habitos.map((h) => itemHabito(h, true))
    : [vacio('Agregá un hábito que quieras repetir todos los días.')]));
}

function renderObjetivos() {
  $('#lista-objetivos').replaceChildren(...(estado.objetivos.length
    ? estado.objetivos.map(itemObjetivo)
    : [vacio('Agregá un objetivo y andá marcando cuánto avanzaste.')]));
}

function renderFrases() {
  const grupos = Object.entries(CATEGORIAS)
    .map(([clave, nombre]) => [nombre, estado.frases.filter((f) => f.categoria === clave)])
    .filter(([, frases]) => frases.length);
  $('#lista-frases').replaceChildren(...(grupos.length
    ? grupos.flatMap(([nombre, frases]) => [el('h2', {}, nombre), el('ul', { class: 'lista' }, frases.map(itemFrase))])
    : [el('h2', {}, 'Mis frases'), el('ul', { class: 'lista' }, vacio('Todavía no hay frases. Escribí la primera arriba.'))]));
}

const RENDERS = {
  hoy: renderHoy, tareas: renderTareas, habitos: renderHabitos, objetivos: renderObjetivos, frases: renderFrases, ajustes: renderAjustes,
};

function vistaActual() {
  const vista = location.hash.slice(1);
  return Object.hasOwn(VISTAS, vista) ? vista : 'hoy';
}

function saludo() {
  const hora = new Date().getHours();
  if (hora < 6 || hora >= 20) return 'Buenas noches';
  if (hora < 13) return 'Buen día';
  return 'Buenas tardes';
}

// ---------- Apariencia: tema y fondo de pantalla ----------

function leerFondo() {
  try {
    const fondo = localStorage.getItem(CLAVE_FONDO) ?? '';
    // Seguridad: solo se acepta una imagen JPEG generada por la app, nada que pueda
    // "romper" el CSS e inyectar otras cosas.
    return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(fondo) ? fondo : '';
  } catch {
    return '';
  }
}

function aplicarApariencia() {
  const raiz = document.documentElement;
  const tema = estado.ajustes.tema;
  if (tema === 'apple') delete raiz.dataset.tema;
  else raiz.dataset.tema = tema;
  for (const boton of document.querySelectorAll('[data-accion="tema"]')) {
    boton.setAttribute('aria-pressed', String(boton.dataset.tema === tema));
  }
  const fondo = leerFondo();
  document.body.classList.toggle('con-fondo', Boolean(fondo));
  if (fondo) document.body.style.setProperty('--imagen-fondo', `url("${fondo}")`);
  else document.body.style.removeProperty('--imagen-fondo');
  $('#boton-quitar-fondo').hidden = !fondo;
}

// Achica la foto (máximo 1200 px) y la pasa a JPEG para que entre en el teléfono.
async function prepararFondo(archivo) {
  const url = URL.createObjectURL(archivo);
  try {
    const imagen = new Image();
    imagen.src = url;
    await imagen.decode();
    const escala = Math.min(1, 1200 / Math.max(imagen.naturalWidth, imagen.naturalHeight));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(imagen.naturalWidth * escala);
    lienzo.height = Math.round(imagen.naturalHeight * escala);
    lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    return lienzo.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

$('#archivo-fondo').addEventListener('change', async (evento) => {
  const archivo = evento.target.files?.[0];
  evento.target.value = '';
  if (!archivo) return;
  try {
    localStorage.setItem(CLAVE_FONDO, await prepararFondo(archivo));
    render();
    avisar('Fondo actualizado');
  } catch {
    avisar('No se pudo usar esa imagen. Probá con otra.');
  }
});

function render() {
  aplicarApariencia();
  const vista = vistaActual();
  for (const seccion of document.querySelectorAll('.vista')) seccion.hidden = seccion.dataset.vista !== vista;
  for (const enlace of document.querySelectorAll('.barra a, #boton-ajustes')) {
    if (enlace.dataset.vista === vista) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  }
  $('#fecha-hoy').textContent = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#titulo-vista').textContent = vista === 'hoy' ? saludo() : VISTAS[vista];
  document.title = vista === 'hoy' ? 'Mi Centro de Control' : `${VISTAS[vista]} · Mi Centro de Control`;
  RENDERS[vista]();
}

// ---------- Avisos ----------

let temporizadorAviso;
// alDeshacer: si se pasa, el mensaje muestra un botón "Deshacer" durante 6 segundos.
function avisar(mensaje, alDeshacer) {
  const aviso = $('#aviso');
  const boton = alDeshacer ? el('button', { type: 'button' }, 'Deshacer') : null;
  boton?.addEventListener('click', () => {
    aviso.hidden = true;
    alDeshacer();
  }, { once: true });
  aviso.replaceChildren(el('span', {}, mensaje), boton ?? '');
  aviso.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { aviso.hidden = true; }, alDeshacer ? 6000 : 2500);
}

// ---------- Recordatorios (Calendario del iPhone) ----------

let recordatorioTitulo = '';
let recordatorioDias = TODOS_LOS_DIAS;

function abrirRecordatorio(titulo, { fecha = claveDia(), hora = '09:00', repetir = 'no', dias = TODOS_LOS_DIAS } = {}) {
  const form = $('#form-recordatorio');
  recordatorioTitulo = titulo;
  recordatorioDias = dias;
  $('#rec-titulo').textContent = titulo;
  form.elements.repetir.querySelector('[value="diario"]').textContent = dias.length === 7 ? 'Todos los días' : describirDias(dias);
  form.elements.fecha.value = fecha < claveDia() ? claveDia() : fecha;
  form.elements.hora.value = hora;
  form.elements.repetir.value = repetir;
  $('#dialogo-recordatorio').showModal();
}

function agregarAlCalendario(datos) {
  // Con el service worker activo, el .ics se arma en el mismo teléfono y el
  // iPhone lo abre directo en el Calendario. Si no, se descarga el archivo.
  if (navigator.serviceWorker?.controller) {
    location.href = `./recordatorio.ics?${new URLSearchParams(datos)}`;
    return;
  }
  const url = URL.createObjectURL(new Blob([self.crearIcs(datos)], { type: 'text/calendar' }));
  const enlace = el('a', { href: url, download: 'recordatorio.ics' });
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$('#form-recordatorio').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const { fecha, hora, repetir } = evento.currentTarget.elements;
  if (repetir.value === 'no' && new Date(`${fecha.value}T${hora.value}`) < new Date()) {
    avisar('Esa fecha y hora ya pasaron');
    return;
  }
  $('#dialogo-recordatorio').close();
  try {
    agregarAlCalendario({
      titulo: recordatorioTitulo, fecha: fecha.value, hora: hora.value, repetir: repetir.value, dias: recordatorioDias.join(','),
    });
    avisar('Abrí el archivo para agregarlo al Calendario');
  } catch {
    avisar('No se pudo crear el recordatorio');
  }
});

// ---------- Acciones ----------

// Borra al instante y ofrece "Deshacer" (como en las apps de Apple),
// en vez de preguntar "¿Estás seguro?" cada vez.
function borrarConDeshacer(coleccion, ids, mensaje) {
  const lista = estado[coleccion];
  const borrados = lista.map((item, indice) => ({ item, indice })).filter(({ item }) => ids.includes(item.id));
  if (!borrados.length) return;
  cambiar(() => { estado[coleccion] = lista.filter((x) => !ids.includes(x.id)); });
  avisar(mensaje, () => cambiar(() => {
    for (const { item, indice } of borrados) estado[coleccion].splice(indice, 0, item);
  }));
}

// ---------- Editar tareas, hábitos y objetivos ----------

const EDICION = {
  tarea: { coleccion: 'tareas', titulo: 'Editar tarea', nombre: 'titulo', campos: ['prioridad', 'fecha'], fecha: 'Fecha', borrado: 'Tarea borrada' },
  habito: { coleccion: 'habitos', titulo: 'Editar hábito', nombre: 'nombre', campos: ['meta', 'dias'], borrado: 'Hábito borrado' },
  objetivo: { coleccion: 'objetivos', titulo: 'Editar objetivo', nombre: 'titulo', campos: ['fecha'], fecha: 'Fecha meta', borrado: 'Objetivo borrado' },
};
let enEdicion = null; // { tipo, id }

function abrirEdicion(tipo, id) {
  const config = EDICION[tipo];
  const item = config && buscar(estado[config.coleccion], id);
  if (!item) return;
  enEdicion = { tipo, id };
  const form = $('#form-editar');
  $('#editar-titulo').textContent = config.titulo;
  $('#editar-etiqueta-fecha').textContent = config.fecha ?? 'Fecha';
  for (const campo of form.querySelectorAll('[data-campo]')) campo.hidden = !config.campos.includes(campo.dataset.campo);
  form.elements.nombre.value = item[config.nombre];
  form.elements.nombre.maxLength = tipo === 'habito' ? 60 : 120;
  if (item.prioridad) form.elements.prioridad.value = item.prioridad;
  form.elements.fecha.value = item.fecha ?? '';
  if (item.meta) form.elements.meta.value = String(Math.min(5, item.meta));
  for (const casilla of form.querySelectorAll('[name="dias"]')) {
    casilla.checked = item.diasSemana?.includes(Number(casilla.value)) ?? false;
  }
  $('#dialogo-editar').showModal();
}

$('#form-editar').addEventListener('submit', (evento) => {
  evento.preventDefault();
  if (!enEdicion) return;
  const { tipo, id } = enEdicion;
  const config = EDICION[tipo];
  const item = buscar(estado[config.coleccion], id);
  const form = evento.currentTarget;
  const nombre = texto(form.elements.nombre.value, tipo === 'habito' ? 60 : 120);
  if (!item || !nombre) return;
  const dias = [...form.querySelectorAll('[name="dias"]:checked')].map((c) => Number(c.value)).sort();
  if (tipo === 'habito' && !dias.length) {
    avisar('Elegí al menos un día');
    return;
  }
  const fecha = esFecha(form.elements.fecha.value) ? form.elements.fecha.value : '';
  cambiar(() => {
    item[config.nombre] = nombre;
    if (tipo === 'tarea' && Object.hasOwn(PRIORIDADES, form.elements.prioridad.value)) item.prioridad = form.elements.prioridad.value;
    if (tipo !== 'habito') item.fecha = fecha;
    if (tipo === 'habito') {
      item.meta = Math.min(10, Math.max(1, Number(form.elements.meta.value) || 1));
      item.diasSemana = dias;
    }
  });
  $('#dialogo-editar').close();
  avisar('Cambios guardados');
});

// Tocar fuera de una hoja la cierra, como en el iPhone.
for (const dialogo of document.querySelectorAll('dialog')) {
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
}

const ACCIONES = {
  'tarea-alternar': (id) => {
    const tarea = buscar(estado.tareas, id);
    if (!tarea) return;
    cambiar(() => {
      tarea.hecha = !tarea.hecha;
      tarea.hechaEn = tarea.hecha ? Date.now() : 0;
    });
    if (tarea.hecha) avisar(alAzar(FESTEJOS_TAREA));
  },
  editar: (id, zona) => abrirEdicion(zona.dataset.tipo, id),
  'eliminar-editado': () => {
    if (!enEdicion) return;
    const config = EDICION[enEdicion.tipo];
    $('#dialogo-editar').close();
    borrarConDeshacer(config.coleccion, [enEdicion.id], config.borrado);
    enEdicion = null;
  },
  'borrar-hechas': () => {
    const hechas = estado.tareas.filter((t) => t.hecha).map((t) => t.id);
    borrarConDeshacer('tareas', hechas, `${hechas.length} ${hechas.length === 1 ? 'tarea borrada' : 'tareas borradas'}`);
  },
  'recordar-tarea': (id) => {
    const tarea = buscar(estado.tareas, id);
    if (tarea) abrirRecordatorio(tarea.titulo, { fecha: tarea.fecha || claveDia() });
  },
  'habito-sumar': (id) => {
    const habito = buscar(estado.habitos, id);
    if (!habito || !tocaElDia(habito)) return;
    const hoy = claveDia();
    if (cumplido(habito, hoy)) {
      avisar('Ya está cumplido hoy');
      return;
    }
    cambiar(() => { habito.registro[hoy] = vecesDelDia(habito) + 1; });
    if (cumplido(habito, hoy)) {
      const dias = racha(habito);
      const todos = estado.habitos.filter((h) => tocaElDia(h)).every((h) => cumplido(h, hoy));
      avisar(todos
        ? '¡Todos los hábitos de hoy! Nivel Hokage 🍥'
        : `${alAzar(FESTEJOS_HABITO)} Racha: ${dias} ${dias === 1 ? 'día' : 'días'}`);
    }
  },
  'habito-restar': (id) => cambiar(() => {
    const habito = buscar(estado.habitos, id);
    if (!habito) return;
    const hoy = claveDia();
    const veces = vecesDelDia(habito) - 1;
    if (veces > 0) habito.registro[hoy] = veces;
    else delete habito.registro[hoy];
  }),
  'recordar-habito': (id) => {
    const habito = buscar(estado.habitos, id);
    if (!habito) return;
    // Arranca el primer día que toca (por ejemplo, el lunes para el gimnasio).
    let fecha = new Date();
    while (!tocaElDia(habito, fecha)) fecha = sumarDias(fecha, 1);
    abrirRecordatorio(habito.nombre, { fecha: claveDia(fecha), hora: '21:00', repetir: 'diario', dias: habito.diasSemana });
  },
  'frase-borrar': (id) => borrarConDeshacer('frases', [id], 'Frase borrada'),
  'abrir-enfoque': () => {
    renderDialogoEnfoque();
    $('#dialogo-enfoque').showModal();
    if (estado.enfoque.actual?.fin) mantenerPantallaEncendida();
  },
  'enfoque-empezar': () => {
    const duracion = Number($('#enfoque-duracion').value) || 25;
    cambiar(() => {
      estado.enfoque.actual = { duracion, fin: Date.now() + duracion * 60_000, restante: 0, tareaId: $('#enfoque-tarea').value };
    });
    mantenerPantallaEncendida();
    renderDialogoEnfoque();
  },
  'enfoque-pausar': () => {
    cambiar(() => {
      const actual = estado.enfoque.actual;
      if (actual?.fin) Object.assign(actual, { restante: restanteMs(), fin: 0 });
    });
    liberarPantalla();
    renderDialogoEnfoque();
  },
  'enfoque-seguir': () => {
    cambiar(() => {
      const actual = estado.enfoque.actual;
      if (actual && !actual.fin) Object.assign(actual, { fin: Date.now() + actual.restante, restante: 0 });
    });
    mantenerPantallaEncendida();
    renderDialogoEnfoque();
  },
  'enfoque-terminar': () => {
    const actual = estado.enfoque.actual;
    if (!actual) return;
    // Cuenta solo los minutos completos que llegaste a hacer.
    completarEnfoque(Math.floor((actual.duracion * 60_000 - restanteMs()) / 60_000));
  },
  'otra-frase': () => {
    otraFrase++;
    render();
  },
  'cerrar-dialogo': (_, boton) => boton.closest('dialog')?.close(),
  tema: (_, boton) => {
    if (!Object.hasOwn(TEMAS, boton.dataset.tema)) return;
    cambiar(() => { estado.ajustes.tema = boton.dataset.tema; });
    avisar(`Tema ${TEMAS[boton.dataset.tema]}`);
  },
  'elegir-fondo': () => $('#archivo-fondo').click(),
  'quitar-fondo': () => {
    try { localStorage.removeItem(CLAVE_FONDO); } catch { /* sin almacenamiento: no hay nada que quitar */ }
    render();
  },
  filtro: (_, boton) => {
    filtroTareas = boton.dataset.filtro;
    render();
  },
  exportar: () => exportar(),
  importar: () => $('#archivo-importar').click(),
};

document.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton || !Object.hasOwn(ACCIONES, boton.dataset.accion)) return;
  ACCIONES[boton.dataset.accion](boton.dataset.id, boton);
});

// Las zonas editables también responden al teclado (Enter o espacio).
document.addEventListener('keydown', (evento) => {
  if ((evento.key === 'Enter' || evento.key === ' ') && evento.target.matches('[role="button"][data-accion]')) {
    evento.preventDefault();
    evento.target.click();
  }
});

// Deslizador de avance: se ve en vivo mientras lo movés y se guarda al soltar.
document.addEventListener('input', (evento) => {
  const deslizador = evento.target.closest('[data-progreso]');
  if (!deslizador) return;
  const item = deslizador.closest('.item');
  item.querySelector('.porcentaje').textContent = `${deslizador.value}%`;
  item.querySelector('.progreso-relleno').style.width = `${deslizador.value}%`;
});

document.addEventListener('change', (evento) => {
  const deslizador = evento.target.closest('[data-progreso]');
  if (!deslizador) return;
  cambiar(() => {
    const objetivo = buscar(estado.objetivos, deslizador.dataset.progreso);
    if (objetivo) objetivo.progreso = Math.min(100, Math.max(0, Number(deslizador.value) || 0));
  });
});

$('#form-tarea').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const form = evento.currentTarget;
  const titulo = texto(form.elements.titulo.value, 120);
  if (!titulo) return;
  const prioridad = form.elements.prioridad.value;
  const fecha = form.elements.fecha.value;
  const horaAviso = form.elements.aviso.value;
  const diaAviso = esFecha(fecha) ? fecha : claveDia();
  if (horaAviso && new Date(`${diaAviso}T${horaAviso}`) < new Date()) {
    avisar('La hora del aviso ya pasó');
    return;
  }
  cambiar(() => estado.tareas.push({
    id: nuevoId(),
    titulo,
    prioridad: Object.hasOwn(PRIORIDADES, prioridad) ? prioridad : 'media',
    fecha: esFecha(fecha) ? fecha : '',
    hecha: false,
    creada: Date.now(),
  }));
  form.reset();
  if (!horaAviso) {
    avisar('Tarea agregada');
    return;
  }
  // Con hora de aviso: se agrega también al Calendario del iPhone.
  try {
    agregarAlCalendario({ titulo, fecha: diaAviso, hora: horaAviso, repetir: 'no', dias: '' });
    avisar('Tarea agregada. Abrí el archivo para sumar el aviso al Calendario');
  } catch {
    avisar('Tarea agregada, pero no se pudo crear el aviso');
  }
});

// Festejo cuando un objetivo llega al 100 %.
document.addEventListener('change', (evento) => {
  if (evento.target.closest('[data-progreso]')?.value === '100') avisar('¡Tesoro encontrado! Objetivo logrado 🏴‍☠️');
});

$('#form-habito').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const form = evento.currentTarget;
  const nombre = texto(form.elements.nombre.value, 60);
  if (!nombre) return;
  const diasSemana = [...form.querySelectorAll('[name="dias"]:checked')].map((c) => Number(c.value)).sort();
  if (!diasSemana.length) {
    avisar('Elegí al menos un día');
    return;
  }
  const meta = Math.min(10, Math.max(1, Number(form.elements.meta.value) || 1));
  cambiar(() => estado.habitos.push({ id: nuevoId(), nombre, meta, diasSemana, registro: {}, creado: Date.now() }));
  form.reset();
  avisar('Hábito agregado');
});

$('#form-objetivo').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const form = evento.currentTarget;
  const titulo = texto(form.elements.titulo.value, 120);
  if (!titulo) return;
  const fecha = form.elements.fecha.value;
  cambiar(() => estado.objetivos.push({
    id: nuevoId(), titulo, fecha: esFecha(fecha) ? fecha : '', progreso: 0, creado: Date.now(),
  }));
  form.reset();
  avisar('Objetivo agregado');
});

$('#form-frase').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const form = evento.currentTarget;
  const textoFrase = texto(form.elements.texto.value, 240).replace(/^["“”]+|["“”]+$/g, '');
  if (!textoFrase) return;
  const categoria = form.elements.categoria.value;
  cambiar(() => estado.frases.push({
    id: nuevoId(),
    texto: textoFrase,
    autor: texto(form.elements.autor.value, 80),
    categoria: Object.hasOwn(CATEGORIAS, categoria) ? categoria : 'mias',
  }));
  form.reset();
  avisar('Frase guardada');
});

// ---------- Copia de seguridad ----------

function exportar() {
  const contenido = JSON.stringify({ app: 'mi-centro-de-control', version: 1, exportado: new Date().toISOString(), ...estado }, null, 2);
  const url = URL.createObjectURL(new Blob([contenido], { type: 'application/json' }));
  const enlace = el('a', { href: url, download: `mi-centro-${claveDia()}.json` });
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  cambiar(() => { estado.ajustes.ultimaCopia = Date.now(); });
  avisar('Copia descargada. Guardala en Archivos o iCloud.');
}

$('#archivo-importar').addEventListener('change', async (evento) => {
  const archivo = evento.target.files?.[0];
  evento.target.value = '';
  if (!archivo) return;
  if (archivo.size > 1_000_000) {
    avisar('El archivo es demasiado grande');
    return;
  }
  try {
    const datos = normalizar(JSON.parse(await archivo.text()));
    const resumen = `${datos.tareas.length} tareas, ${datos.habitos.length} hábitos, ${datos.objetivos.length} objetivos y ${datos.frases.length} frases`;
    if (!confirm(`Se van a reemplazar tus datos actuales por los de la copia (${resumen}). ¿Seguir?`)) return;
    estado = datos;
    guardar();
    render();
    avisar('Copia restaurada');
  } catch {
    avisar('No se pudo leer el archivo');
  }
});

// ---------- Arranque ----------

// Al cambiar de pestaña se arranca desde arriba, no donde quedó la anterior.
window.addEventListener('hashchange', () => {
  window.scrollTo(0, 0);
  render();
});
$('#enfoque-duracion').addEventListener('change', actualizarReloj);
$('#dialogo-enfoque').addEventListener('close', liberarPantalla);
// El iPhone suelta el "no apagar pantalla" al salir de la app: se pide de nuevo al volver.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && $('#dialogo-enfoque').open && estado.enfoque.actual?.fin) mantenerPantallaEncendida();
});
// Le pide al navegador que no borre los datos de la app por falta de espacio.
navigator.storage?.persist?.().catch(() => {});
// Al volver a la app (por ejemplo, al día siguiente) se actualizan fecha y hábitos.
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
render();

// Funcionamiento sin conexión. El iPhone solo lo permite en sitios con HTTPS
// (o en localhost), así que por la red de casa no se activa: es normal.
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
