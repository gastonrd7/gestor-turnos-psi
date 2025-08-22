// Helpers de fecha y formato (sin dependencias de React)
export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeekMonday(d: Date) {
  const x = startOfDay(d);
  const diff = (x.getDay() + 6) % 7; // 0=Dom → 6; 1=Lun → 0; ... 6=Sáb → 5
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
export function formatDateLabel(d: Date, locale: string = "es-AR") {
  const weekday = d.toLocaleDateString(locale, { weekday: "short" });
  const dm = d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  return `${weekday} ${dm}`;
}

/** Hora local HH:mm en español */
export function formatTime(isoUtc: string, locale: string = "es-AR") {
  const d = new Date(isoUtc);
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

/** YYYY-MM-DD (UTC) para usar como key estable de día */
export function isoDayKeyUTC(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}