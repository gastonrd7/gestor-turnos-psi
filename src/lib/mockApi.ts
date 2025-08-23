import { Modalidad, Professional, Specialty, Turno } from "@/domain/types";

/** Persistencia mock (en memoria del módulo) */
const confirmedDB: Array<{
  turnoId: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
  specialty: string;
  modalidad: Modalidad;
  paciente: { nombre: string; apellido: string; email: string; celular: string };
  confirmedAt: string;
}> = [];

const professionals: Professional[] = [
  {
    id: "p1",
    nombre: "Dra. Sofía Martínez",
    especialidades: ["Ansiedad", "Estrés", "Autoestima"],
    timezone: "America/Argentina/Buenos_Aires",
    isLow: true,
    modalidades: ["online", "presencial"],
    direccionConsultorio: "Colpayo 760, Caballito, CABA, Argentina"
  },
  {
    id: "p2",
    nombre: "Lic. Tomás Rivas",
    especialidades: ["Relaciones", "Depresión", "Ansiedad"],
    timezone: "America/Argentina/Buenos_Aires",
    isLow: true,
    modalidades: ["online"],
    direccionConsultorio: null
  },
  {
    id: "p3",
    nombre: "Dra. Valentina López",
    especialidades: ["Fobias", "Relaciones", "Autoestima"],
    timezone: "America/Argentina/Buenos_Aires",
    isLow: false,
    modalidades: ["presencial"],
    direccionConsultorio: "Felipe Vallese 761, Caballito, CABA, Argentina"
  },
  {
    id: "p4",
    nombre: "Lic. Javier Duarte",
    especialidades: ["Depresión", "Estrés"],
    timezone: "America/Argentina/Buenos_Aires",
    isLow: false,
    modalidades: ["online", "presencial"],
    direccionConsultorio: "Boyaca 1166, Caballito, CABA, Argentina"
  },
];

const allSpecialties: Specialty[] = [
  "Fobias",
  "Relaciones",
  "Depresión",
  "Ansiedad",
  "Autoestima",
  "Estrés",
];

// Nuevos slots por modalidad
const weeklySlotsByPro: Record<string, Record<Modalidad, string[][]>> = {
  p1: {
    online: [
      [], // Domingo
      ["10:00", "12:00", "15:00"], // Lunes
      [], // Martes
      ["09:00", "11:00", "16:00"], // Miércoles
      [], // Jueves
      ["10:00", "14:00", "17:00"], // Viernes
      [], // Sábado
    ],
    presencial: [
      [], // Domingo
      [], // Lunes
      ["09:00", "11:00", "13:00"], // Martes
      [], // Miércoles
      ["09:00", "12:00", "18:00"], // Jueves
      [], // Viernes
      [], // Sábado
    ],
  },
  p2: {
    online: [
      [], // Domingo
      ["09:00", "10:00", "11:00"], // Lunes
      [], // Martes
      ["14:00", "16:00", "18:00"], // Miércoles
      [], // Jueves
      ["13:00", "15:00", "19:00"], // Viernes
      [], // Sábado
    ],
    presencial: [
      [], // Domingo
      [], // Lunes
      ["09:00", "10:00", "12:00"], // Martes
      [], // Miércoles
      ["10:00", "13:00", "17:00"], // Jueves
      [], // Viernes
      [], // Sábado
    ],
  },
  p3: {
    online: [
      [], // Domingo
      ["11:00", "13:00", "17:00"], // Lunes
      [], // Martes
      ["10:00", "12:00", "14:00"], // Miércoles
      [], // Jueves
      ["09:00", "10:00", "11:00"], // Viernes
      [], // Sábado
    ],
    presencial: [
      [], // Domingo
      [], // Lunes
      ["09:00", "11:00", "15:00"], // Martes
      [], // Miércoles
      ["12:00", "16:00", "19:00"], // Jueves
      [], // Viernes
      [], // Sábado
    ],
  },
  p4: {
    online: [
      [], // Domingo
      ["09:00", "11:00", "13:00"], // Lunes
      [], // Martes
      ["14:00", "16:00", "18:00"], // Miércoles
      [], // Jueves
      ["10:00", "13:00", "15:00"], // Viernes
      [], // Sábado
    ],
    presencial: [
      [], // Domingo
      [], // Lunes
      ["09:00", "12:00", "17:00"], // Martes
      [], // Miércoles
      ["10:00", "14:00", "19:00"], // Jueves
      [], // Viernes
      [], // Sábado
    ],
  },
};



const takenSlotIds = new Set<string>();
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function toUtcISOStringFromLocal(tz: string, date: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p: Intl.DateTimeFormatPart) => [p.type, p.value])
  ) as Record<string, string>;
  const localIso = `${parts.year}-${parts.month}-${parts.day}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  const start = new Date(localIso + "Z");
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 45);
  return { startUtc: start.toISOString(), endUtc: end.toISOString() };
}

export async function apiConfirmTurno(payload: {
  turnoId: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
  specialty: string;
  modalidad: Modalidad;
  paciente: { nombre: string; apellido: string; email: string; celular: string };
}) {
  await sleep(250);
  const record = { ...payload, confirmedAt: new Date().toISOString() };
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
  takenSlotIds.delete(turnoId);
  return { removed: true, proId: professionalId };
}

export async function apiListConfirmed(proId?: string) {
  await sleep(120);
  return proId ? confirmedDB.filter(c => c.professionalId === proId) : confirmedDB.slice();
}

export async function apiFetchProfessionals(): Promise<Professional[]> {
  await sleep(200);
  return professionals;
}

export async function apiFetchSpecialties(): Promise<Specialty[]> {
  await sleep(120);
  return allSpecialties;
}

export async function apiFetchWeeklySlots(proId: string): Promise<Turno[]> {
  await sleep(200);
  const pro = professionals.find(p => p.id === proId);
  if (!pro) return [];

  const result: Turno[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 15);

  const slotMatrix = weeklySlotsByPro[proId];
  let idCounter = 0;

  for (const modalidad of pro.modalidades) {
    const matrix = slotMatrix[modalidad];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      const hours: string[] = matrix[dow] ?? [];
      for (const hhmm of hours) {
        const { startUtc, endUtc } = toUtcISOStringFromLocal(pro.timezone, d, hhmm);
        const id = `${proId}-${modalidad}-${idCounter++}`;
        result.push({ id, professionalId: proId, startUtc, endUtc, modalidad });
      }
    }
  }

  return result.filter(s => !takenSlotIds.has(s.id)).sort((a, b) => +new Date(a.startUtc) - +new Date(b.startUtc));
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function apiBookTurno(_turnoId: string): Promise<{ ok: true }> {
  await sleep(120);
  return { ok: true };
}