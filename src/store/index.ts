"use client";

import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import sessionsReducer, { hydrate } from "./sessionsSlice";
import type { Specialty, BookedSession, ConfirmedSession } from "@/domain/types";

const PERSIST_KEY = "sessions-persist-v3";

type PersistShape = {
  booked: BookedSession[];
  confirmed: ConfirmedSession[];
  selectedSpecialties: Specialty[];
};

function isSpecialty(v: unknown): v is Specialty {
  return typeof v === "string" && ["Fobias","Relaciones","Depresión","Ansiedad","Autoestima","Estrés"].includes(v);
}
function isBookedSession(v: unknown): v is BookedSession {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.turnoId === "string" && typeof o.professionalId === "string" && typeof o.startUtc === "string" && typeof o.endUtc === "string" && (o.specialty === undefined || isSpecialty(o.specialty));
}
function isConfirmedSession(v: unknown): v is ConfirmedSession {
  if (!v || typeof v !== "object") return false;
  const o = v as any;
  return (
    isBookedSession(o) &&
    o.paciente &&
    typeof o.paciente.nombre === "string" &&
    typeof o.paciente.apellido === "string" &&
    typeof o.paciente.email === "string" &&
    typeof o.paciente.celular === "string" &&
    typeof o.confirmedAt === "string"
  );
}


function loadPersist(): PersistShape | undefined {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<PersistShape>;
    const booked = Array.isArray(parsed.booked) ? parsed.booked.filter(isBookedSession) : [];
    const confirmed = Array.isArray(parsed.confirmed) ? parsed.confirmed.filter(isConfirmedSession) : [];
    const selectedSpecialties = Array.isArray(parsed.selectedSpecialties) ? parsed.selectedSpecialties.filter(isSpecialty) : [];
    return { booked, confirmed, selectedSpecialties };
  } catch { return; }
}
function savePersist(state: PersistShape) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(PERSIST_KEY, JSON.stringify(state)); } catch {}
}

export const store = configureStore({
  reducer: { sessions: sessionsReducer },
});

if (typeof window !== "undefined") {
  const data = loadPersist();
  if (data) {
    store.dispatch(hydrate(data));
  }
  store.subscribe(() => {
    const s = store.getState().sessions;
    savePersist({
      booked: s.booked,
      confirmed: s.confirmed,
      selectedSpecialties: s.selectedSpecialties,
    });
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;