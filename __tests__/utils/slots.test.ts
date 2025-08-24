import { groupSlotsByDate } from "@/utils/slots";
import { Turno } from "@/domain/types";

describe("groupSlotsByDate", () => {
  const turnoBase: Turno = {
    id: "t1",
    professionalId: "p1",
    startUtc: "",
    endUtc: "",
    modalidad: "online",
  };

  it("debería agrupar los turnos por fecha (YYYY-MM-DD)", () => {
    const slots: Turno[] = [
      { ...turnoBase, startUtc: "2025-08-23T10:00:00Z", endUtc: "2025-08-23T11:00:00Z" },
      { ...turnoBase, startUtc: "2025-08-23T15:00:00Z", endUtc: "2025-08-23T16:00:00Z" },
      { ...turnoBase, startUtc: "2025-08-24T10:00:00Z", endUtc: "2025-08-24T11:00:00Z" },
    ];

    const result = groupSlotsByDate(slots);
    expect(result.size).toBe(2);
    expect(result.get("2025-08-23")?.length).toBe(2);
    expect(result.get("2025-08-24")?.length).toBe(1);
  });

  it("debería ordenar los turnos dentro del mismo día por horario", () => {
    const slots: Turno[] = [
      { ...turnoBase, id: "t2", startUtc: "2025-08-23T15:00:00Z", endUtc: "2025-08-23T16:00:00Z" },
      { ...turnoBase, id: "t1", startUtc: "2025-08-23T10:00:00Z", endUtc: "2025-08-23T11:00:00Z" },
    ];

    const result = groupSlotsByDate(slots);
    const grouped = result.get("2025-08-23");

    expect(grouped?.[0].id).toBe("t1");
    expect(grouped?.[1].id).toBe("t2");
  });
});
