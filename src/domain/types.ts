export type Specialty =
  | "Fobias"
  | "Relaciones"
  | "Depresión"
  | "Ansiedad"
  | "Autoestima"
  | "Estrés";

export type Slot = { id: string; startUtc: string };

export type Modalidad = "online" | "presencial";

export interface Professional {
  id: string;
  nombre: string;
  especialidades: Specialty[];
  timezone: string;
  avatar?: string;
  isLow: boolean;
  modalidades: Modalidad[]; // NUEVO: para saber qué tipo de sesiones ofrece
  direccionConsultorio: string | null;
}

export interface Turno {
  id: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
  modalidad: Modalidad;
}

// types.ts o domain/types.ts


export interface BookedSession {
  turnoId: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
  specialty: Specialty;
  modalidad: Modalidad; // NUEVO: el paciente también guarda la modalidad elegida
}

export interface ConfirmedSession extends BookedSession {
  paciente: {
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
  };
  confirmedAt: string;
  meetUrl: string | null;
  direccionConsultorio: string | null;
}