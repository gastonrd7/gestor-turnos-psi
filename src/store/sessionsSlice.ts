"use client";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Specialty,
  Professional,
  Turno,
  BookedSession,
  ConfirmedSession,
} from "@/domain/types";
import {
  apiBookTurno,
  apiFetchProfessionals,
  apiFetchSpecialties,
  apiFetchWeeklySlots,
  apiConfirmTurno,
  apiUnconfirmTurno,
} from "@/lib/mockApi";
import type { RootState } from ".";

export interface SessionsState {
  loading: boolean;
  error?: string;
  specialties: Specialty[];
  selectedSpecialties: Specialty[];
  professionals: Professional[];
  weeklySlots: Record<string, Turno[]>;
  booked: BookedSession[];
  confirmed: ConfirmedSession[];
}

const initialState: SessionsState = {
  loading: false,
  specialties: [],
  selectedSpecialties: [],
  professionals: [],
  weeklySlots: {},
  booked: [],
  confirmed: [],
};

/* ================= Thunks ================ */

export const loadInitial = createAsyncThunk(
  "sessions/loadInitial",
  async () => {
    const [specialties, professionals] = await Promise.all([
      apiFetchSpecialties(),
      apiFetchProfessionals(),
    ]);
    return { specialties, professionals };
  }
);

export const loadWeeklySlotsForProfessional = createAsyncThunk(
  "sessions/loadWeeklySlotsForProfessional",
  async (proId: string) => {
    const slots = await apiFetchWeeklySlots(proId);
    return { proId, slots };
  }
);

/**
 * toggleTurno
 * - Si ya está seleccionado → lo quita (y reinyecta el slot a weeklySlots[proId] en orden)
 * - Si no está → lo agrega (y remueve el slot de weeklySlots[proId])
 * - Regla: máx. 1 turno por profesional (considera booked + confirmed)
 */
export const toggleTurno = createAsyncThunk<
  { added?: BookedSession; removedId?: string },
  { slot: Turno; pro: Professional },
  { state: RootState; rejectValue: string }
>(
  "sessions/toggleTurno",
  async ({ slot, pro }, { getState, rejectWithValue }) => {
    const { sessions } = getState();

    // ¿Ya está seleccionado? -> quitar
    const exists = sessions.booked.find((b) => b.turnoId === slot.id);
    if (exists) {
      await apiBookTurno(slot.id); // simulación
      return { removedId: slot.id };
    }

    // Regla: ¿ya hay otro turno de este profesional en booked o confirmed?
    const hasSamePro =
      sessions.booked.some((b) => b.professionalId === pro.id) ||
      sessions.confirmed.some((c) => c.professionalId === pro.id);

    if (hasSamePro) {
      return rejectWithValue("Solo puedes agendar 1 turno por profesional.");
    }

    await apiBookTurno(slot.id); // simulación
    const chosen =
      sessions.selectedSpecialties.find((s) => pro.especialidades.includes(s)) ??
      pro.especialidades[0];

    const added: BookedSession = {
      turnoId: slot.id,
      professionalId: slot.professionalId,
      startUtc: slot.startUtc,
      endUtc: slot.endUtc,
      specialty: chosen,
      modalidad: slot.modalidad
    };
    return { added };
  }
);

/**
 * confirmTurno
 * - Inserta en el “backend” mock (apiConfirmTurno)
 * - Refresca disponibilidades del profesional (apiFetchWeeklySlots)
 * - Mueve de booked → confirmed
 */
export const confirmTurno = createAsyncThunk<
  { confirmed: ConfirmedSession; proId: string; slots: Turno[] },
  { turnoId: string; nombre: string; apellido: string; email: string; celular: string },
  { state: RootState; rejectValue: string }
>(
  "sessions/confirmTurno",
  async ({ turnoId, nombre, apellido, email, celular }, { getState, rejectWithValue }) => {
    const { sessions } = getState();
    const b = sessions.booked.find((x) => x.turnoId === turnoId);
    if (!b) return rejectWithValue("Turno no encontrado en seleccionados.");

    if (sessions.confirmed.some((c) => c.professionalId === b.professionalId)) {
      return rejectWithValue("Ya tienes un turno confirmado con este profesional.");
    }

    // 1) Insert en mock "servidor"
    await apiConfirmTurno({
      turnoId: b.turnoId,
      professionalId: b.professionalId,
      startUtc: b.startUtc,
      endUtc: b.endUtc,
      specialty: b.specialty,
      paciente: { nombre, apellido, email, celular },
      modalidad: b.modalidad
    });

    const pro = getState().sessions.professionals.find(p => p.id === b.professionalId);

    // 2) Refetch de slots del profesional (ya sin ese turno)
    const refreshedSlots = await apiFetchWeeklySlots(b.professionalId);

    const mockGoogleMeetUrl = "https://meet.google.com/abc-defg-hij";

    // 3) Armado del objeto ConfirmedSession
    const confirmed: ConfirmedSession = {
      ...b,
      paciente: { nombre, apellido, email, celular },
      confirmedAt: new Date().toISOString(),
      meetUrl: b.modalidad === "online" ? mockGoogleMeetUrl : null,
      direccionConsultorio: b.modalidad === "presencial" ? pro?.direccionConsultorio ?? null : null,
    };

    console.log('confirmed', confirmed)

    return { confirmed, proId: b.professionalId, slots: refreshedSlots };
  }
);

// des-confirmar turno (los vuelve a disponibilidad)
export const unconfirmTurno = createAsyncThunk<
  { turnoId: string; proId: string; slots: Turno[] },
  { turnoId: string },
  { state: RootState; rejectValue: string }
>(
  "sessions/unconfirmTurno",
  async ({ turnoId }, { getState, rejectWithValue }) => {
    const { sessions } = getState();
    const c = sessions.confirmed.find(x => x.turnoId === turnoId);
    if (!c) return rejectWithValue("Turno no está confirmado.");

    // 1) Cancelar en el “backend” mock
    const res = await apiUnconfirmTurno(turnoId);
    if (!res.removed || !res.proId) return rejectWithValue("No se pudo cancelar el turno.");

    // 2) Refetch de slots del profesional (ya con el slot liberado)
    const refreshed = await apiFetchWeeklySlots(res.proId);

    return { turnoId, proId: res.proId, slots: refreshed };
  }
);


/* ================= Slice ================ */

const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    toggleSpecialty(state, action: PayloadAction<Specialty>) {
      const s = action.payload;
      if (state.selectedSpecialties.includes(s)) {
        state.selectedSpecialties = state.selectedSpecialties.filter((x) => x !== s);
      } else {
        state.selectedSpecialties = [...state.selectedSpecialties, s];
      }
    },
    clearSpecialties(state) {
      state.selectedSpecialties = [];
    },
    removeConfirmed(state, action: PayloadAction<string>) {
      state.confirmed = state.confirmed.filter((c) => c.turnoId !== action.payload);
      // Si querés que al eliminar un confirmado vuelva el slot disponible:
      // acá podríamos llamar a un thunk que haga "unconfirm" + refetch.
    },
    hydrate(state, action: PayloadAction<Partial<SessionsState>>) {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInitial.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(loadInitial.fulfilled, (s, a) => {
        s.loading = false;
        s.specialties = a.payload.specialties;
        s.professionals = a.payload.professionals;
      })
      .addCase(loadInitial.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Error";
      });

    builder.addCase(loadWeeklySlotsForProfessional.fulfilled, (s, a) => {
      s.weeklySlots[a.payload.proId] = a.payload.slots;
    });

    // === Selección/deselección: ocultar/reponer el slot en weeklySlots ===
    builder
      .addCase(toggleTurno.fulfilled, (s, a) => {
        const { added, removedId } = a.payload;

        // Helper para insertar ordenado por hora
        const insertSorted = (arr: Turno[], item: Turno) => {
          const idx = arr.findIndex(
            (t) => new Date(t.startUtc).getTime() > new Date(item.startUtc).getTime()
          );
          if (idx === -1) arr.push(item);
          else arr.splice(idx, 0, item);
        };

        if (removedId) {
          // Reinsertar slot a disponibilidades
          const b = s.booked.find((x) => x.turnoId === removedId);
          s.booked = s.booked.filter((b0) => b0.turnoId !== removedId);
          if (b) {
            const proId = b.professionalId;
            const list = s.weeklySlots[proId];
            if (list) {
              const slot: Turno = {
                id: b.turnoId,
                professionalId: proId,
                startUtc: b.startUtc,
                endUtc: b.endUtc,
                modalidad: b.modalidad
              };
              if (!list.some((t) => t.id === slot.id)) {
                insertSorted(list, slot);
              }
            }
          }
        } else if (added) {
          // Agregar a booked y quitar slot de disponibilidades
          s.booked.push(added);
          const proId = added.professionalId;
          const list = s.weeklySlots[proId];
          if (list) {
            s.weeklySlots[proId] = list.filter((t) => t.id !== added.turnoId);
          }
        }
      })
      .addCase(toggleTurno.rejected, (s, a) => {
        s.error = (a.payload as string) || a.error.message || "Error";
      });

    // === Confirmación: mover a confirmed y refrescar slots del profesional ===
    builder
      .addCase(confirmTurno.fulfilled, (s, a) => {
        const { confirmed, proId, slots } = a.payload;
        s.booked = s.booked.filter((b) => b.turnoId !== confirmed.turnoId);
        s.confirmed.push(confirmed);
        s.weeklySlots[proId] = slots; // refetch desde mock "servidor"
      })
      .addCase(confirmTurno.rejected, (s, a) => {
        s.error = (a.payload as string) || a.error.message || "Error";
      });

    builder
      .addCase(unconfirmTurno.fulfilled, (s, a) => {
        const { turnoId, proId, slots } = a.payload;
        // quitar de confirmados
        s.confirmed = s.confirmed.filter(c => c.turnoId !== turnoId);
        // refrescar disponibilidades del profesional
        s.weeklySlots[proId] = slots;
      })
      .addCase(unconfirmTurno.rejected, (s, a) => {
        s.error = (a.payload as string) || a.error.message || "Error";
      });
    
  },
});

export const { toggleSpecialty, clearSpecialties, removeConfirmed, hydrate } =
  sessionsSlice.actions;

export default sessionsSlice.reducer;