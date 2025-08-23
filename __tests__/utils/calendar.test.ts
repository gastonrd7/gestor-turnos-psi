// __tests__/utils/agendaUtils.test.ts

import { getWindowDates, getWeekNavigation, filterProfessionals } from "@/utils/calendar";
import { addDays, startOfWeekMonday } from "@/utils/date";
import type { Professional } from "@/domain/types";

describe("agendaUtils", () => {
  describe("getWindowDates", () => {
    it("Deberia devolver hoy, Comienzo de ventaja (mañana) y finalizacion de ventana (dentro de 15 días desde mañana)", () => {
      const { today, windowStart, windowEnd } = getWindowDates();
      const expectedStart = addDays(today, 1);
      const expectedEnd = addDays(expectedStart, 15);

      expect(windowStart.toISOString()).toBe(expectedStart.toISOString());
      expect(windowEnd.toISOString()).toBe(expectedEnd.toISOString());
    });
  });

  describe("getWeekNavigation", () => {
    it("debería devolver minWeekStart y maxWeekStart alineados al lunes", () => {
      const { windowStart, windowEnd } = getWindowDates();
      const { minWeekStart, maxWeekStart } = getWeekNavigation(windowStart, windowEnd);
      const expectedMin = startOfWeekMonday(windowStart);
      const expectedMax = startOfWeekMonday(addDays(windowEnd, -1));

      expect(minWeekStart.toISOString()).toBe(expectedMin.toISOString());
      expect(maxWeekStart.toISOString()).toBe(expectedMax.toISOString());
    });
  });

  describe("filterProfessionals", () => {
    const mockProfessionals: Professional[] = [
      {
        id: "p1",
        nombre: "Sofía",
        especialidades: ["Ansiedad", "Estrés"],
        modalidades: ["online", "presencial"],
        timezone: "America/Argentina/Buenos_Aires",
        isLow: false,
        direccionConsultorio: "Direccion 1"
      },
      {
        id: "p2",
        nombre: "Juan",
        especialidades: ["Autoestima"],
        modalidades: ["online"],
        timezone: "America/Argentina/Buenos_Aires",
        isLow: false,
        direccionConsultorio: null
      },
    ];

    it("debería devolver todos los profesionales si no hay filtros", () => {
      const result = filterProfessionals(mockProfessionals, [], "todas");
      expect(result).toHaveLength(2);
    });

    it("debería filtrar por modalidad", () => {
      const result = filterProfessionals(mockProfessionals, [], "presencial");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("p1");
    });

    it("debería filtrar por especialidad", () => {
      const result = filterProfessionals(mockProfessionals, ["Autoestima"], "todas");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("p2");
    });

    it("debería filtrar por modalidad y especialidad", () => {
      const result = filterProfessionals(mockProfessionals, ["Ansiedad"], "online");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("p1");
    });

    it("debería devolver un array vacío si no hay coincidencias", () => {
      const result = filterProfessionals(mockProfessionals, ["Depresión"], "presencial");
      expect(result).toHaveLength(0);
    });
  });
});
