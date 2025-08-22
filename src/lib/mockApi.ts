import { Professional, Specialty, Turno } from "@/domain/types";

/** Persistencia mock (en memoria del módulo) */
const confirmedDB: Array<{
  turnoId: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
  specialty: string;
  paciente: { nombre: string; apellido: string; email: string; celular: string };
  confirmedAt: string;
}> = [];

const professionals: Professional[] = [
  { id: "p1", nombre: "Dra. Sofía Martínez", especialidades: ["Ansiedad","Estrés","Autoestima"], timezone: "America/Argentina/Buenos_Aires", isLow: true },
  { id: "p2", nombre: "Lic. Tomás Rivas",     especialidades: ["Relaciones","Depresión","Ansiedad"], timezone: "America/Montevideo",  isLow: true },
  { id: "p3", nombre: "Dra. Valentina López", especialidades: ["Fobias","Relaciones","Autoestima"], timezone: "America/Santiago",  isLow: false },
  { id: "p4", nombre: "Lic. Javier Duarte",   especialidades: ["Depresión","Estrés"], timezone: "America/Sao_Paulo",  isLow: false },
];

const allSpecialties: Specialty[] = ["Fobias","Relaciones","Depresión","Ansiedad","Autoestima","Estrés"];

// Matriz de horas (HH:mm) por DOW local del profesional: 0=Dom..6=Sáb
const weeklySlotsByPro: Record<string, string[][]> = {
  p1: [["10:00","12:00"],["09:00","11:00","15:00","18:00"],["11:00","15:00"],["09:00","18:00"],["09:00","11:00"],[],["10:00","12:00"]],
  p2: [["10:00","14:00","17:00"],[],["10:00","14:00","17:00"],[],["14:00","17:00"],[],[]],
  p3: [["08:00","12:00","16:00","19:00"],[],["08:00","12:00","16:00","19:00"],[],["12:00","16:00"],["08:00"],[]],
  p4: [[],[],["09:00","13:00"],[],[],[],["09:00"]],
};

/** Conjunto de slots ocupados (no deben aparecer más como disponibles) */
const takenSlotIds = new Set<string>();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));



function toUtcISOStringFromLocal(tz: string, date: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p: Intl.DateTimeFormatPart) => [p.type, p.value])
  ) as Record<string,string>;

  const localIso = `${parts.year}-${parts.month}-${parts.day}T${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:00`;
  const start = new Date(localIso + "Z");
  const end = new Date(start); end.setMinutes(end.getMinutes() + 45);
  return { startUtc: start.toISOString(), endUtc: end.toISOString() };
}

export async function apiConfirmTurno(payload: {
  turnoId: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
  specialty: string;
  paciente: { nombre: string; apellido: string; email: string; celular: string };
}) {
  await sleep(250);
  const record = {
    ...payload,
    confirmedAt: new Date().toISOString(),
  };
  confirmedDB.push(record);
  takenSlotIds.add(payload.turnoId);
  return record;
}

export async function apiUnconfirmTurno(turnoId: string): Promise<{ removed: boolean; proId?: string }> {
  await sleep(200);
  const idx = confirmedDB.findIndex(c => c.turnoId === turnoId);
  if (idx === -1) return { removed: false };
  const { professionalId } = confirmedDB[idx];
  confirmedDB.splice(idx, 1);
  takenSlotIds.delete(turnoId); // libera el slot
  return { removed: true, proId: professionalId };
}

export async function apiListConfirmed(proId?: string) {
  await sleep(120);
  return proId ? confirmedDB.filter(c => c.professionalId === proId) : confirmedDB.slice();
}

export async function apiFetchProfessionals(): Promise<Professional[]> {
  await new Promise(r => setTimeout(r, 200));
  return professionals;
}

export async function apiFetchSpecialties(): Promise<Specialty[]> {
  await new Promise(r => setTimeout(r, 120));
  return allSpecialties;
}

/** genera slots desde mañana por 30 días. */
export async function apiFetchWeeklySlots(proId: string): Promise<Turno[]> {
  // Pequeño delay para simular red
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  await sleep(200);

  // Buscar profesional
  const pro = professionals.find(p => p.id === proId);
  if (!pro) return [];

  // Matriz de horarios por día de semana para el profesional
  // weeklySlotsByPro[proId][dow] => string[] de horas "HH:mm"
  const matrix: string[][] = weeklySlotsByPro[proId] ?? [];

  // Ventana: MAÑANA (00:00) → +15 días (exclusivo)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() + 1); // mañana
  const end = new Date(start);
  end.setDate(end.getDate() + 15);    // ventana de 15 días desde mañana

  const result: Turno[] = [];
  let idCounter = 0;

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0..6 (Dom..Sáb)
    const hours: string[] = matrix[dow] ?? [];
    for (const hhmm of hours) {
      // Convierte "d + hh:mm (tz del pro)" a ISO UTC de inicio/fin
      const { startUtc, endUtc } = toUtcISOStringFromLocal(pro.timezone, d, hhmm);

      result.push({
        id: `${proId}-${idCounter++}`, // id estable local; si querés, podés usar `${proId}-${d.toISOString().slice(0,10)}-${hhmm}`
        professionalId: proId,
        startUtc,
        endUtc,
      });
    }
  }

  // Filtrar slots ya tomados/confirmados a nivel "servidor" mock
  const available = result.filter(s => !takenSlotIds.has(s.id));

  // Ordenar por fecha/hora por si acaso
  available.sort((a, b) => +new Date(a.startUtc) - +new Date(b.startUtc));

  return available;
}

export async function apiBookTurno(_turnoId: string): Promise<{ ok: true }> {
  await new Promise(r => setTimeout(r, 120));
  return { ok: true };
}