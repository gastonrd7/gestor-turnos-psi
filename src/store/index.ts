"use client";

import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import sessionsReducer, { hydrate } from "./sessionsSlice";
import type { Specialty, BookedSession, ConfirmedSession } from "@/domain/types";

/* =================== Persistencia =================== */
const PERSIST_KEY = "sessions-persist-v3";

type PersistShape = {
  booked: BookedSession[];
  confirmed: ConfirmedSession[];
  selectedSpecialties: Specialty[];
};

/* =================== Type guards utilitarios (sin any) =================== */
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

const SPECIALTIES: readonly Specialty[] = [
  "Fobias",
  "Relaciones",
  "Depresión",
  "Ansiedad",
  "Autoestima",
  "Estrés",
];

function isSpecialty(v: unknown): v is Specialty {
  return typeof v === "string" && (SPECIALTIES as readonly string[]).includes(v);
}

function hasStringProp<K extends string>(
  o: Record<string, unknown>,
  key: K
): o is { [P in K]: string } & typeof o {
  return typeof o[key] === "string";
}

function isBookedSession(v: unknown): v is BookedSession {
  if (!isObject(v)) return false;
  // specialty puede venir undefined desde persistencia vieja → lo aceptamos
  const specialtyOk =
    !("specialty" in v) || (typeof v.specialty === "string" && isSpecialty(v.specialty));
  return (
    hasStringProp(v, "turnoId") &&
    hasStringProp(v, "professionalId") &&
    hasStringProp(v, "startUtc") &&
    hasStringProp(v, "endUtc") &&
    specialtyOk
  );
}

type PacienteShape = {
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
};

function isPaciente(x: unknown): x is PacienteShape {
  if (!isObject(x)) return false;
  return (
    hasStringProp(x, "nombre") &&
    hasStringProp(x, "apellido") &&
    hasStringProp(x, "email") &&
    hasStringProp(x, "celular")
  );
}

function isConfirmedSession(v: unknown): v is ConfirmedSession {
  if (!isObject(v)) return false;
  if (!isBookedSession(v)) return false;

  const paciente = (v as Record<string, unknown>).paciente;
  // paciente debe existir y confirmedAt debe ser string
  return isPaciente(paciente) && hasStringProp(v, "confirmedAt");
}

/* =================== Load & Save =================== */
function loadPersist(): PersistShape | undefined {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);

    if (!isObject(parsed)) return;

    const booked = Array.isArray(parsed.booked)
      ? (parsed.booked as unknown[]).filter(isBookedSession)
      : [];

    const confirmed = Array.isArray(parsed.confirmed)
      ? (parsed.confirmed as unknown[]).filter(isConfirmedSession)
      : [];

    const selectedSpecialties = Array.isArray(parsed.selectedSpecialties)
      ? (parsed.selectedSpecialties as unknown[]).filter(isSpecialty)
      : [];

    return { booked, confirmed, selectedSpecialties };
  } catch {
    return;
  }
}

function savePersist(state: PersistShape) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
  } catch {
    // ignoramos errores de cuota/serialización
  }
}

/* =================== Store =================== */
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

/* =================== Hooks tipados =================== */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
