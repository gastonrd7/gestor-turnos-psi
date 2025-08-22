"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loadInitial,
  loadWeeklySlotsForProfessional,
  toggleTurno,
  toggleSpecialty,
  clearSpecialties,
} from "@/store/sessionsSlice";
import type { Turno } from "@/domain/types";
import toast from "react-hot-toast";

import {
  addDays,
  formatDateLabel,
  formatTime,
  isSameDay,
  isoDayKeyUTC,
  startOfDay,
  startOfWeekMonday,
} from "@/utils/date";
import { groupSlotsByDate } from "@/utils/slots";

export default function AgendaSection() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.sessions);

  // Cargar datos base una vez
  useEffect(() => {
    dispatch(loadInitial());
  }, [dispatch]);

  // Ventana desde MAÑANA por 15 días
  const today = startOfDay(new Date());
  const windowStart = addDays(today, 1); // mañana
  const windowEnd = addDays(windowStart, 15); // exclusivo (mañana + 15)

  // Navegación semanal (anclada a la semana que contiene “mañana”)
  const minWeekStart = startOfWeekMonday(windowStart);
  const maxWeekStart = startOfWeekMonday(addDays(windowEnd, -1));
  const [weekOffset, setWeekOffset] = useState(0);
  const visibleWeekStart = addDays(minWeekStart, weekOffset * 7);
  const visibleDays = Array.from({ length: 7 }, (_, i) => addDays(visibleWeekStart, i));
  const canPrev = visibleWeekStart.getTime() > minWeekStart.getTime();
  const canNext = visibleWeekStart.getTime() < maxWeekStart.getTime();

  useEffect(() => {
    // clamp defensivo
    if (visibleWeekStart < minWeekStart) setWeekOffset(0);
    if (visibleWeekStart > maxWeekStart) setWeekOffset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtro multi-especialidad
  const filteredProfessionals = useMemo(() => {
    if (!state.selectedSpecialties.length) return state.professionals;
    return state.professionals.filter((p) =>
      p.especialidades.some((e) => state.selectedSpecialties.includes(e))
    );
  }, [state.professionals, state.selectedSpecialties]);

  const isBooked = (turnoId: string) => state.booked.some((b) => b.turnoId === turnoId);

  // Toggle visual por profesional (no toca store)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const isExpanded = (proId: string) => !!expanded[proId];
  const toggleExpanded = (proId: string, open?: boolean) =>
    setExpanded((s) => ({ ...s, [proId]: open ?? !s[proId] }));

  return (
    <>
      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-medium text-gray-700">Temáticas:</span>
        {state.specialties.map((t) => {
          const active = state.selectedSpecialties.includes(t);
          return (
            <button
              key={t}
              onClick={() => dispatch(toggleSpecialty(t))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              {t}
            </button>
          );
        })}
        <button
          onClick={() => dispatch(clearSpecialties())}
          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
        >
          Ver todas
        </button>
      </div>

      {/* Controles de semana */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-semibold">Agenda</h2>
        <div className="flex items-center gap-2">
          <button
            disabled={!canPrev}
            onClick={() => setWeekOffset((o) => Math.max(o - 1, 0))}
            className={`rounded-lg border px-2 py-1 text-xs ${
              canPrev ? "bg-white" : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            ◀ Semana anterior
          </button>
          <button
            disabled={!canNext}
            onClick={() =>
              setWeekOffset((o) =>
                addDays(minWeekStart, (o + 1) * 7) <= maxWeekStart ? o + 1 : o
              )
            }
            className={`rounded-lg border px-2 py-1 text-xs ${
              canNext ? "bg-white" : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            Siguiente semana ▶
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Ventana: {formatDateLabel(visibleDays[0])} — {formatDateLabel(visibleDays[6])} (máx 15 días
        desde mañana)
      </div>

      {/* Listado de profesionales */}
      {state.loading ? (
        <div className="mt-4 text-sm text-gray-500">Cargando profesionales…</div>
      ) : filteredProfessionals.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">
          No se encontraron profesionales para esa selección.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {filteredProfessionals.map((pro) => {
            const slots = state.weeklySlots[pro.id];
            const grouped = slots ? groupSlotsByDate(slots) : undefined;

            // Badge “Baja disponibilidad”:
            // - Antes de cargar → visible (posible baja)
            // - Cargado → real si total < 20
            const isLow = slots === undefined ? true : slots.length < 20;

            return (
              <article
                key={pro.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 flex-none rounded-xl bg-gray-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{pro.nombre}</h3>
                        {isLow && (
                          <span
                            title="< 20 turnos en los próximos 15 días"
                            className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200"
                          >
                            Baja disponibilidad
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {pro.especialidades.map((x) => (
                          <span
                            key={x}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 ring-1 ring-gray-200"
                          >
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botón Mostrar/Ocultar (solo UI, no borra store) */}
                  <div className="flex gap-2">
                    {!slots ? (
                      <button
                        onClick={() => {
                          dispatch(loadWeeklySlotsForProfessional(pro.id)).then(() => {
                            toggleExpanded(pro.id, true);
                          });
                        }}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Mostrar horarios
                      </button>
                    ) : isExpanded(pro.id) ? (
                      <button
                        onClick={() => toggleExpanded(pro.id, false)}
                        className="rounded-xl bg-gray-500 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Ocultar horarios
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleExpanded(pro.id, true)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Mostrar horarios
                      </button>
                    )}
                  </div>
                </div>

                {/* Semana visible (solo si expandido) */}
                {isExpanded(pro.id) && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                    {visibleDays.map((date) => {
                      const key = isoDayKeyUTC(date);
                      const daySlots = grouped?.get(key) ?? [];
                      const isPast = date < windowStart;
                      const outOfWindow = date >= windowEnd;
                      const disabledDay = isPast || outOfWindow;

                      return (
                        <div
                          key={`${pro.id}-${key}`}
                          className={`rounded-xl border p-3 ${
                            disabledDay ? "bg-gray-50 opacity-60" : ""
                          }`}
                        >
                          <div className="mb-2 text-xs font-semibold text-gray-700">
                            {formatDateLabel(date)}
                            {isSameDay(date, windowStart) && (
                              <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">
                                Mañana
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 text-[11px]">
                            {!grouped ? (
                              <button
                                onClick={() =>
                                  dispatch(loadWeeklySlotsForProfessional(pro.id))
                                }
                                className="rounded-lg bg-white px-2 py-1 ring-1 ring-gray-200 hover:bg-indigo-50"
                              >
                                Cargar
                              </button>
                            ) : daySlots.length ? (
                              daySlots.map((s: Turno) => {
                                const booked = isBooked(s.id);
                                return (
                                  <button
                                    key={s.id}
                                    disabled={disabledDay}
                                    onClick={async () => {
                                      const res = await dispatch(toggleTurno({ slot: s, pro }));
                                      if (toggleTurno.fulfilled.match(res)) {
                                        if (res.payload.added) toast.success("Turno seleccionado");
                                        if (res.payload.removedId) toast("Turno deseleccionado");
                                      } else if (toggleTurno.rejected.match(res)) {
                                        toast.error(res.payload as string);
                                      }
                                    }}
                                    className={`rounded-lg px-2 py-1 ring-1 transition disabled:cursor-not-allowed ${
                                      booked
                                        ? "bg-green-600 text-white ring-green-600"
                                        : "bg-white ring-gray-200 hover:bg-indigo-50"
                                    }`}
                                    title={`${new Date(s.startUtc).toLocaleString("es-AR")}`}
                                  >
                                    {formatTime(s.startUtc)}
                                  </button>
                                );
                              })
                            ) : (
                              <span className="text-gray-400">Sin turnos</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}