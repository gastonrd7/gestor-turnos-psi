import type { Turno } from "@/domain/types";
import { isoDayKeyUTC } from "./date";

/**
 * Agrupa turnos por día (clave YYYY-MM-DD; ordenados por horario).
 * No asume nada del componente.
 */
export function groupSlotsByDate(slots: Turno[]) {
  const map = new Map<string, Turno[]>();
  for (const s of slots) {
    const key = isoDayKeyUTC(new Date(s.startUtc));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => +new Date(a.startUtc) - +new Date(b.startUtc));
  }
  return map;
}