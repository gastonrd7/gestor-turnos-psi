// Helpers de fecha y formato (sin dependencias de React)
export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeekMonday(d: Date) {
  const x = startOfDay(d);
  const diff = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Etiqueta corta en español: "jue 21/08" */
/** Etiqueta corta en español: "jue 21/08", sin conversión horaria si es Argentina */
export function formatDateLabel(d: Date, locale: string = "es-AR") {
  console.log(d, )
  if (locale === "es-AR") {
    // Mostramos la fecha en base a la instancia Date sin modificar el huso horario
    const weekday = d.toLocaleString("es-AR", { weekday: "short" });
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${weekday} ${day}/${month}`;
  }

  // Para otros locales sí usamos la conversión automática
  const weekday = d.toLocaleDateString(locale, { weekday: "short" });
  const dm = d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  return `${weekday} ${dm}`;
}


/** Hora local HH:mm en español */
/** Hora local HH:mm en español, con manejo especial para Argentina */
export function formatTime(isoUtc: string, locale: string = "es-AR") {
  const d = new Date(isoUtc);

  if (locale === "es-AR") {
    // Asumimos que el horario ya está en hora Argentina y no queremos convertir nada
    return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
  }

  // Para otros locales, se formatea con conversión horaria real
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}


/** YYYY-MM-DD (UTC) para usar como key estable de día */
export function isoDayKeyUTC(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}