import { Specialty, Modalidad } from "@/domain/types";

interface AgendaFiltersProps {
  selectedModalidad: Modalidad | "todas";
  onModalidadChange: (value: Modalidad | "todas") => void;
  selectedSpecialties: Specialty[];
  allSpecialties: Specialty[];
  toggleSpecialty: (t: Specialty) => void;
  clearSpecialties: () => void;
}

export default function AgendaFilters({
  selectedModalidad,
  onModalidadChange,
  selectedSpecialties,
  allSpecialties,
  toggleSpecialty,
  clearSpecialties,
}: AgendaFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Modalidad:</label>
      <select
        value={selectedModalidad}
        onChange={(e) => onModalidadChange(e.target.value as Modalidad | "todas")}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
      >
        <option value="todas">Todas</option>
        <option value="online">Online</option>
        <option value="presencial">Presencial</option>
      </select>

      <span className="ml-4 mr-2 text-sm font-medium text-gray-700">Temáticas:</span>
      {allSpecialties.map((t) => {
        const active = selectedSpecialties.includes(t);
        return (
          <button
            key={t}
            onClick={() => toggleSpecialty(t)}
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
        onClick={clearSpecialties}
        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
      >
        Ver todas
      </button>
    </div>
  );
}
