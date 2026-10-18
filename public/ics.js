// Arma un archivo .ics (el formato estándar de los calendarios) con una alarma.
// Lo usan app.js y sw.js, por eso es un script común y no un módulo.

(function () {
  const escapar = (texto) => String(texto)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

  const DIAS_ICS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  // dias: los días de la semana que toca, como "1,2,3,4,5" (0 = domingo).
  function reglaRepeticion(repetir, dias) {
    if (repetir !== 'diario') return [];
    const lista = [...new Set(String(dias ?? '').split(',').map(Number))]
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
    if (!lista.length || lista.length === 7) return ['RRULE:FREQ=DAILY'];
    return [`RRULE:FREQ=WEEKLY;BYDAY=${lista.map((d) => DIAS_ICS[d]).join(',')}`];
  }

  function crearIcs({ titulo, fecha, hora, repetir, dias }) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? '') || !/^\d{2}:\d{2}$/.test(hora ?? '')) {
      throw new Error('Fecha u hora inválida');
    }
    const resumen = escapar(String(titulo ?? '').trim().slice(0, 120) || 'Recordatorio');
    const inicio = `${fecha.replaceAll('-', '')}T${hora.replace(':', '')}00`; // hora local del iPhone
    const ahora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Rodricarabajal//Mi Centro de Control//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}@mi-centro-de-control`,
      `DTSTAMP:${ahora}`,
      `DTSTART:${inicio}`,
      'DURATION:PT15M',
      ...reglaRepeticion(repetir, dias),
      `SUMMARY:${resumen}`,
      'DESCRIPTION:Recordatorio de Mi Centro de Control',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${resumen}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n') + '\r\n';
  }

  self.crearIcs = crearIcs;
})();
