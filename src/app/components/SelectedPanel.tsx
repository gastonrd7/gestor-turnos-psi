"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { confirmTurno, toggleTurno } from "@/store/sessionsSlice";
import type { Professional } from "@/domain/types";
import toast from "react-hot-toast";

function toLocalDate(dIso: string) {
  const d = new Date(dIso);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "2-digit" });
}
function toLocalTime(dIso: string) {
  const d = new Date(dIso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function SelectedPanel() {
  const dispatch = useAppDispatch();
  const { booked, professionals } = useAppSelector(s => s.sessions);

  const [confirmOpen, setConfirmOpen] = useState<null | string>(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", celular: "" });

  return (
    <div className="sticky top-16 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold">Sesiones seleccionadas</h3>

      {!booked.length ? (
        <div className="mt-3 rounded-xl border border-dashed p-4 text-center text-xs text-gray-500">
          Aún no seleccionaste turnos.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {booked.map((b) => {
            const pro = professionals.find(p => p.id === b.professionalId) as Professional | undefined;
            return (
              <li key={b.turnoId} className="rounded-xl border p-3 text-xs">
                <div className="font-medium text-gray-800">{pro?.nombre ?? "Profesional"}</div>
                <div className="text-gray-600">{b.specialty ?? "Especialidad"} · {toLocalDate(b.startUtc)} · {toLocalTime(b.startUtc)}</div>
                <div className="text-sm text-gray-600">
                  Modalidad:{" "}
                  <span className="font-medium capitalize">
                    {b.modalidad === "online" ? "Online" : "Presencial"}
                  </span>
                </div>
                {pro?.direccionConsultorio && (
                  <div className="text-sm text-gray-600">
                    Dirección del consultorio:{" "}
                    <span className="font-medium">{pro?.direccionConsultorio}</span>
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={async () => {
                      const res = await dispatch(toggleTurno({
                        slot: { id: b.turnoId, professionalId: b.professionalId, startUtc: b.startUtc, endUtc: b.endUtc, modalidad: b.modalidad },
                        pro: pro!,
                      }));
                      if (toggleTurno.fulfilled.match(res)) toast("Turno deseleccionado");
                    }}
                    className="rounded-lg border px-2 py-1"
                  >
                    Quitar
                  </button>
                  <button
                    onClick={() => setConfirmOpen(b.turnoId)}
                    className="rounded-lg bg-indigo-600 px-2 py-1 text-white"
                  >
                    Confirmar sesión
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Confirmar sesión</h3>
              <button className="text-gray-500" onClick={() => setConfirmOpen(null)}>✕</button>
            </div>
            <form
              className="mt-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const turnoId = confirmOpen!;
                const res = await dispatch(confirmTurno({ turnoId, ...form }));
                if (confirmTurno.fulfilled.match(res)) {
                  toast.success("Turno confirmado");
                  setConfirmOpen(null);
                  setForm({ nombre: "", apellido: "", email: "", celular: "" });
                } else if (confirmTurno.rejected.match(res)) {
                  toast.error(res.payload as string);
                }
              }}
            >
              <div>
                <label className="block text-xs font-medium text-gray-700">Nombre</label>
                <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Apellido</label>
                <input required value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
              <label className="block text-xs font-medium text-gray-700">Celular</label>
              <input
                required
                inputMode="tel"
                pattern="[\d+()\s-]{6,}"  // validación simple
                value={form.celular}
                onChange={e => setForm(f => ({ ...f, celular: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="+54 11 1234-5678"
              />
            </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="tumail@dominio.com" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setConfirmOpen(null)} className="rounded-lg border px-3 py-2 text-sm">Cancelar</button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}