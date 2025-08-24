import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  loadInitial,
  loadWeeklySlotsForProfessional,
} from "@/store/sessionsSlice";
import * as mockApi from "@/lib/mockApi";
import { Turno } from "@/domain/types";

describe("[Integración] sessionsSlice + mockApi", () => {
  it("debería cargar especialidades y profesionales correctamente", async () => {
    jest.spyOn(mockApi, "apiFetchProfessionals").mockResolvedValueOnce([
      {
        id: "pro1",
        nombre: "Lic. Test",
        especialidades: ["Ansiedad"],
        timezone: "America/Argentina/Buenos_Aires",
        isLow: false,
        modalidades: ["online"],
        direccionConsultorio: null,
      },
    ]);

    jest.spyOn(mockApi, "apiFetchSpecialties").mockResolvedValueOnce([
      "Ansiedad",
    ]);

    const store = configureStore({
      reducer: { sessions: reducer },
    });

    await store.dispatch<unknown>(loadInitial());
    const state = store.getState().sessions;

    expect(state.loading).toBe(false);
    expect(state.specialties).toEqual(["Ansiedad"]);
    expect(state.professionals).toHaveLength(1);
    expect(state.professionals[0].nombre).toBe("Lic. Test");
  });

  it("debería cargar los turnos del profesional y guardarlos en el store", async () => {
    const mockTurnos: Turno[] = [
      {
        id: "p1-online-0",
        professionalId: "p1",
        startUtc: "2025-01-06T13:00:00Z",
        endUtc: "2025-01-06T14:00:00Z",
        modalidad: "online",
      },
    ];

    const apiSpy = jest
      .spyOn(mockApi, "apiFetchWeeklySlots")
      .mockResolvedValueOnce(mockTurnos);

    const store = configureStore({
      reducer: { sessions: reducer },
    });

    await store.dispatch(loadWeeklySlotsForProfessional("p1"));
    const state = store.getState().sessions;

    expect(state.weeklySlots["p1"]).toEqual(mockTurnos);
    expect(apiSpy).toHaveBeenCalledWith("p1");
  });
});