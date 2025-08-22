export type Specialty =
  | "Fobias"
  | "Relaciones"
  | "Depresión"
  | "Ansiedad"
  | "Autoestima"
  | "Estrés";

export interface Professional {
  id: string;
  nombre: string;
  especialidades: Specialty[];
  timezone: string;
  avatar?: string;
  isLow: boolean;
}

export interface Turno {
  id: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
}

export interface BookedSession {
  turnoId: string;
  professionalId: string;
  startUtc: string;
  endUtc: string;
  specialty: Specialty;
}

export interface ConfirmedSession extends BookedSession {
  paciente: {
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
  };
  confirmedAt: string; 
}