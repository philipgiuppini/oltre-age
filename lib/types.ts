// OltreAge — domain types (demo)

export type Role = "senior" | "giovane";

/** Big Five semplificato, valori 0..1 */
export interface TraitProfile {
  apertura: number;        // openness
  socievolezza: number;    // extraversion
  pazienza: number;        // agreeableness
  organizzazione: number;  // conscientiousness
  energia: number;         // activity level
}

export interface Person {
  id: string;
  role: Role;
  nome: string;
  eta: number;
  zona: string;
  bio: string;
  /** interessi normalizzati, es. ["musica","giardinaggio"] */
  interessi: string[];
  /** competenze offerte (per banca del tempo) */
  offre: string[];
  /** cosa cerca / vuole imparare */
  cerca: string[];
  tratti: TraitProfile;
  /** fasce orarie disponibili: "mattina" | "pomeriggio" | "sera" */
  disponibilita: string[];
  lingue: string[];
  avatarColor: string;
}

export interface MatchExplanation {
  label: string;
  weight: number; // contributo al punteggio (0..100)
}

export interface MatchResult {
  person: Person;
  score: number; // 0..100
  spiegazioni: MatchExplanation[];
  complementarieta: string[]; // offre↔cerca incroci
}

export interface TimeBankEntry {
  id: string;
  daId: string;
  aId: string;
  attivita: string;
  crediti: number;
  data: string;
  stato: "completato" | "pianificato";
}

export interface ServiceBooking {
  id: string;
  servizio: string;
  categoria: "telemedicina" | "fisioterapia" | "bistro" | "coworking";
  personId: string;
  data: string;
  ora: string;
  stato: "confermato" | "in attesa";
}

export interface VitalReading {
  personId: string;
  battito: number;       // bpm
  passi: number;
  sonnoOre: number;
  saturazione: number;   // %
  ultimoAggiornamento: string;
  alert?: string;
}

export interface MobilityRide {
  id: string;
  mezzo: "shuttle" | "e-bike";
  da: string;
  a: string;
  ora: string;
  stato: "disponibile" | "prenotato";
}
