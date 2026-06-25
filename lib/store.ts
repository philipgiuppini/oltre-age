// ────────────────────────────────────────────────────────────────
// OltreAge — data layer DEMO (persistenza su localStorage)
//
// ⚠ SOLO DEMO: password in chiaro e file in localStorage.
// In produzione → Supabase Auth (password) + Postgres (dati) +
// Storage (foto/documenti). I tipi qui sotto rispecchiano già
// uno schema migrabile 1:1 su tabelle Supabase.
// ────────────────────────────────────────────────────────────────

export type Role = "admin" | "residente" | "collaboratore" | "personale";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Amministratore",
  residente: "Residente",
  collaboratore: "Collaboratore",
  personale: "Personale struttura",
};

export type Fascia = "minima" | "avanzata" | "totale";

export const FASCIA_LABEL: Record<Fascia, string> = {
  minima: "60–70 · Assistenza minima",
  avanzata: "70–80 · Assistenza avanzata",
  totale: "80+ · Assistenza totale",
};

export interface DocFile {
  id: string;
  tipo: string;
  nome: string;
  dataUrl: string;
}

export interface TraitProfile {
  apertura: number;
  socievolezza: number;
  pazienza: number;
  organizzazione: number;
  energia: number;
}

export const DEFAULT_TRAITS: TraitProfile = {
  apertura: 0.5,
  socievolezza: 0.5,
  pazienza: 0.5,
  organizzazione: 0.5,
  energia: 0.5,
};

export const TRAIT_LABEL: Record<keyof TraitProfile, string> = {
  apertura: "Apertura",
  socievolezza: "Socievolezza",
  pazienza: "Pazienza",
  organizzazione: "Organizzazione",
  energia: "Energia",
};

export interface Account {
  id: string;
  email: string;
  password: string;
  role: Role;
  nome: string;
  cognome: string;
  dataNascita?: string;
  telefono?: string;
  indirizzo?: string;
  note?: string;
  fotoProfilo?: string; // dataUrl
  documenti: DocFile[];
  apartmentId?: string | null;
  crediti: number;
  createdAt: string;
  // Profilo di affinità (residente / collaboratore) — alimenta il Matching AI
  interessi?: string[];
  offre?: string[];
  cerca?: string[];
  lingue?: string[];
  disponibilita?: string[]; // mattina | pomeriggio | sera
  tratti?: TraitProfile;
}

export interface Apartment {
  id: string;
  numero: string;
  fascia: Fascia;
}

export type BancaTipo = "attivita" | "evento" | "news";

export interface BancaItem {
  id: string;
  tipo: BancaTipo;
  titolo: string;
  descrizione: string;
  data: string;
  crediti: number; // crediti guadagnati partecipando (0 per news)
  iscritti: string[]; // userId
}

export interface DB {
  users: Account[];
  apartments: Apartment[];
  banca: BancaItem[];
}

const DB_KEY = "oltreage_db_v1";
const SESSION_KEY = "oltreage_session_v1";

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.floor(performance.now() * 1000).toString(36);
}

export function seedDB(): DB {
  const apartments: Apartment[] = Array.from({ length: 12 }, (_, i) => ({
    id: `apt-${i + 1}`,
    numero: `A${String(i + 1).padStart(2, "0")}`,
    fascia: (i < 4 ? "minima" : i < 8 ? "avanzata" : "totale") as Fascia,
  }));

  const banca: BancaItem[] = [
    { id: uid(), tipo: "attivita", titolo: "Corso di cucina ligure", descrizione: "Rosa insegna le ricette tradizionali. Aperto a 8 partecipanti.", data: "2026-06-27", crediti: 3, iscritti: [] },
    { id: uid(), tipo: "attivita", titolo: "Smartphone facile", descrizione: "I giovani aiutano i residenti con telefono e videochiamate.", data: "2026-06-28", crediti: 2, iscritti: [] },
    { id: uid(), tipo: "evento", titolo: "Concerto al piano terra", descrizione: "Pomeriggio musicale aperto anche al quartiere.", data: "2026-06-29", crediti: 0, iscritti: [] },
    { id: uid(), tipo: "news", titolo: "Nuovo bistrò biologico", descrizione: "Da lunedì menù km0 disponibile per residenti e cittadini.", data: "2026-06-24", crediti: 0, iscritti: [] },
  ];

  return { users: [], apartments, banca };
}

export function loadDB(): DB {
  if (typeof window === "undefined") return seedDB();
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const seeded = seedDB();
      localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return seedDB();
  }
}

export function saveDB(db: DB): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch {
    // quota superata (file troppo grandi per la demo localStorage)
    return false;
  }
}

export function loadSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function saveSession(userId: string | null) {
  if (typeof window === "undefined") return;
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

export function newId() {
  return uid();
}

/** Legge un file come dataUrl. Le immagini vengono ridimensionate
 *  per restare entro la quota di localStorage (demo). */
export function readFileAsDataUrl(file: File, maxDim = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      if (!file.type.startsWith("image/")) {
        resolve(result);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(result);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export function fullName(a: Account) {
  return `${a.nome} ${a.cognome}`.trim();
}

export function initials(a: Account) {
  return `${a.nome?.[0] ?? ""}${a.cognome?.[0] ?? ""}`.toUpperCase() || "?";
}

/** colore avatar deterministico dal ruolo */
export function roleColor(role: Role): string {
  return {
    admin: "#1f3d32",
    personale: "#2f5848",
    collaboratore: "#c9a24b",
    residente: "#3a6b56",
  }[role];
}

export function computeAge(dataNascita?: string): number | null {
  if (!dataNascita) return null;
  const d = new Date(dataNascita);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

/** hash stabile da stringa → [0,1) (per dati simulati deterministici) */
function hash01(s: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export interface SimVitals {
  battito: number;
  passi: number;
  sonnoOre: number;
  saturazione: number;
  alert?: string;
}

/** Parametri vitali simulati in modo DETERMINISTICO dall'id (demo IoT). */
export function pseudoVitals(id: string): SimVitals {
  const battito = 62 + Math.round(hash01(id, 1) * 26); // 62–88
  const passi = 1500 + Math.round(hash01(id, 2) * 5500); // 1500–7000
  const sonnoOre = Math.round((5.5 + hash01(id, 3) * 3) * 10) / 10; // 5.5–8.5
  const saturazione = 95 + Math.round(hash01(id, 4) * 4); // 95–99
  const alert = passi < 2500 ? "Attività fisica sotto la media settimanale" : undefined;
  return { battito, passi, sonnoOre, saturazione, alert };
}
