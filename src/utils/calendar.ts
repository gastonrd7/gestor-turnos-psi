// utils/agendaUtils.ts
import { addDays, startOfDay, startOfWeekMonday } from "@/utils/date";
import type { Modalidad, Professional, Specialty } from "@/domain/types";

export const getWindowDates = () => {
  const today = startOfDay(new Date());
  const windowStart = addDays(today, 1);
  const windowEnd = addDays(windowStart, 15);
  return { today, windowStart, windowEnd };
};

export const getWeekNavigation = (windowStart: Date, windowEnd: Date) => {
  const minWeekStart = startOfWeekMonday(windowStart);
  const maxWeekStart = startOfWeekMonday(addDays(windowEnd, -1));
  return { minWeekStart, maxWeekStart };
};

export const filterProfessionals = (
  professionals: Professional[],
  selectedSpecialties: Specialty[],
  selectedModalidad: Modalidad | "todas"
): Professional[] => {
  return professionals.filter((p) => {
    const matchesModalidad =
      selectedModalidad === "todas" || p.modalidades.includes(selectedModalidad);
    const matchesSpecialty =
      selectedSpecialties.length === 0 ||
      p.especialidades.some((e) => selectedSpecialties.includes(e));
    return matchesModalidad && matchesSpecialty;
  });
};
