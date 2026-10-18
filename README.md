# Mi Centro de Control

*by Rodricarabajal*

App web personal para el iPhone: tareas con prioridades, hábitos diarios y objetivos.
Funciona en el navegador y se puede agregar a la pantalla de inicio como si fuera una app.

## Cómo arrancarla

Abrí una terminal en esta carpeta (en VS Code: menú **Terminal → Nueva terminal**) y escribí:

```bash
npm start
```

Después abrí http://localhost:5173 en el navegador. Para frenar el servidor: `Ctrl + C`.

> Si PowerShell dice que "la ejecución de scripts está deshabilitada", usá `npm.cmd start`.
> No hace falta cambiar ninguna configuración de Windows.

## Qué hay en cada archivo

| Archivo | Para qué sirve |
|---|---|
| `public/index.html` | La estructura de la pantalla (las 4 secciones y la barra de abajo) |
| `public/styles.css` | El diseño: colores, modo oscuro, tamaños pensados para el dedo |
| `public/app.js` | La lógica: agregar, marcar, borrar, guardar, calcular rachas |
| `public/manifest.webmanifest` | Nombre e ícono cuando se instala en el celular |
| `public/sw.js` | Permite abrirla sin internet (solo en HTTPS o localhost) |
| `public/icons/` | Íconos generados con `npm run iconos` |
| `server.js` | Servidor local para desarrollo, sin dependencias |

## Hábitos y rachas

- Vienen cargados: lavarse los dientes (2 por día), bañarse, leer 20 minutos e ir al
  gimnasio (solo de lunes a viernes). Se pueden borrar o agregar otros.
- Cada toque en el círculo suma 1. Al llegar a la meta del día queda cumplido.
- La **racha** cuenta los días seguidos cumplidos. Los días que no tocan (ej.: el gimnasio
  el sábado) no la cortan. También se muestra la **mejor racha**.

## Frases y recordatorios

- **Frases:** más de 100 en `public/frases.js` (One Piece, Naruto, Black Clover, otros animes,
  motivación, deporte y originales). La pantalla Hoy muestra una distinta cada día y no repite
  hasta haber pasado por todas. Al agregar frases nuevas en `frases.js`, subí `VERSION_FRASES`
  y marcalas con ese número en `desde`: se suman a las que ya tenés sin pisar nada.
- **Rangos ninja:** las rachas de hábitos dan rango Genin (3 días), Chūnin (7), Jōnin (14) y Hokage (30).
- **Aviso al crear una tarea:** si completás "Avisarme a las", se agrega al Calendario del iPhone.
- **Recordatorios:** la campana de cada tarea o hábito crea un evento con alarma para el
  **Calendario del iPhone** (archivo `.ics`). El que avisa es el iPhone, así que funciona
  aunque la app esté cerrada, sin servidores y gratis. El archivo se arma en `public/ics.js`.

## Modo enfoque, Tu semana y recompensa

- **Modo enfoque** (pantalla Hoy): temporizador de estudio de 15, 25, 45 o 60 minutos, con
  pausa. Se puede elegir una tarea. Mientras corre, la pantalla del iPhone no se apaga, y si
  cerrás la app el tiempo sigue contando. Los minutos se suman al día.
- **Tu semana:** gráfico de hábitos cumplidos en los últimos 7 días, tareas hechas y minutos
  de enfoque.
- **Recompensa ฿:** berries que suben con cada tarea hecha (más si es de prioridad alta), día
  de hábito cumplido, objetivo logrado y minuto de enfoque. Los valores están en `PUNTOS`,
  dentro de `app.js`.

## Editar, borrar y deshacer

- Tocá una tarea, un hábito o un objetivo para **editarlo** (nombre, prioridad, fechas, veces
  por día, días de la semana) o **eliminarlo**.
- Al borrar algo aparece **Deshacer** durante 6 segundos, en vez de pedir confirmación.
- En Tareas → Hechas hay un botón para borrar todas las tareas hechas de una vez.

## Ajustes

El botón de arriba a la derecha abre **Ajustes**: apariencia, fondo de pantalla, copias de
seguridad (con la fecha de la última) y la información de la app. Si pasan 14 días sin copia,
la pantalla Hoy te lo recuerda.

## Temas y fondo de pantalla

En **Ajustes → Apariencia** se elige el tema: Clásico, One Piece, Naruto o
Black Clover. Cada uno cambia los colores, la ilustración de arriba y la tarjeta de la frase
(cartel de "Se busca", pergamino o grimorio). Las ilustraciones son dibujos propios en SVG
(dentro de `index.html`), no imágenes oficiales.

**Elegir imagen** usa una foto de la galería como fondo. Se achica a 1200 px, se guarda solo
en ese dispositivo y no entra en la copia de seguridad.

## Dónde se guardan los datos

En el `localStorage` del navegador, **solo en ese dispositivo**. Lo que cargues en la PC
no aparece en el iPhone, y al revés. Usá **Descargar copia** y **Restaurar copia**
(en la pestaña Hoy) para hacer copias de seguridad o pasar datos de un lado a otro.

## Seguridad aplicada

- El texto que escribís se muestra como texto, nunca como HTML (evita ataques XSS).
- Una política de seguridad (CSP) impide cargar código de otros sitios.
- Las copias importadas se revisan y limpian antes de usarlas.
- El servidor no entrega archivos de fuera de `public/` (evita el *path traversal*).

## Próximos pasos

1. Probarla desde el iPhone en la red de casa (`npm run red`).
2. Publicarla con HTTPS para instalarla como app y usarla sin conexión.
