"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { unconfirmTurno } from "@/store/sessionsSlice";
import toast from "react-hot-toast";

export default function TurnosSection() {
  const dispatch = useAppDispatch();
  const { confirmed, professionals } = useAppSelector(s => s.sessions);

  return (
    <section id="turnos">
      <h2 className="text-base font-semibold mb-3">Turnos</h2>
      {!confirmed.length ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">
          No hay turnos confirmados aún.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {confirmed.map((c) => {
            const pro = professionals.find(p => p.id === c.professionalId);
            return (
              <li key={c.turnoId} className="rounded-xl border bg-white p-4 text-sm">
                <div className="font-semibold">{pro?.nombre}</div>
                <div className="text-gray-600 text-xs">
                  {c.specialty} · {new Date(c.startUtc).toLocaleDateString("es-AR", { weekday:"short", day:"2-digit", month:"2-digit" })} ·
                  {" "}{new Date(c.startUtc).toLocaleTimeString("es-AR", { hour:"2-digit", minute:"2-digit" })}
                </div>
                <div className="text-gray-600 text-xs">
                  Paciente: {c.paciente.nombre} {c.paciente.apellido} · {c.paciente.email} · {c.paciente.celular}
                </div>
                <div className="mt-3">
                  <button
                    onClick={async () => {
                      const res = await dispatch(unconfirmTurno({ turnoId: c.turnoId }));
                      if (unconfirmTurno.fulfilled.match(res)) {
                        toast.success("Turno cancelado. Disponibilidad actualizada.");
                      } else {
                        toast.error((res.payload as string) ?? "No se pudo cancelar el turno.");
                      }
                    }}
                    className="rounded-lg border px-3 py-1 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}