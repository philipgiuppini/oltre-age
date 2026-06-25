// Dati DIMOSTRATIVI — interamente fittizi. Nessun dato reale o sanitario.
// In produzione questi arriverebbero da Supabase (tabelle profili, ecc.).

import type {
  Person,
  TimeBankEntry,
  ServiceBooking,
  VitalReading,
  MobilityRide,
} from "@/lib/types";

export const persone: Person[] = [
  {
    id: "s1",
    role: "senior",
    nome: "Eleonora Visconti",
    eta: 71,
    zona: "Centro",
    bio: "Ex insegnante di pianoforte. Ama la musica classica e la cucina ligure.",
    interessi: ["musica", "lettura", "cucina", "teatro"],
    offre: ["lezioni di piano", "cucina", "storie di vita"],
    cerca: ["smartphone", "videochiamate", "social"],
    tratti: { apertura: 0.8, socievolezza: 0.7, pazienza: 0.85, organizzazione: 0.7, energia: 0.5 },
    disponibilita: ["mattina", "pomeriggio"],
    lingue: ["italiano", "francese"],
    avatarColor: "#1f3d32",
  },
  {
    id: "s2",
    role: "senior",
    nome: "Giorgio Fanti",
    eta: 68,
    zona: "Parco",
    bio: "Ingegnere in pensione, appassionato di giardinaggio e scacchi.",
    interessi: ["giardinaggio", "scacchi", "tecnologia", "lettura"],
    offre: ["scacchi", "giardinaggio", "mentorship lavorativa"],
    cerca: ["tablet", "fotografia digitale"],
    tratti: { apertura: 0.65, socievolezza: 0.45, pazienza: 0.6, organizzazione: 0.9, energia: 0.55 },
    disponibilita: ["pomeriggio", "sera"],
    lingue: ["italiano", "inglese"],
    avatarColor: "#2f5848",
  },
  {
    id: "s3",
    role: "senior",
    nome: "Rosa Marchetti",
    eta: 74,
    zona: "Centro",
    bio: "Ha gestito una sartoria per 40 anni. Curiosa e socievole.",
    interessi: ["cucito", "cucina", "ballo", "musica"],
    offre: ["cucito", "cucina", "lingue"],
    cerca: ["smartphone", "social", "ballo"],
    tratti: { apertura: 0.75, socievolezza: 0.9, pazienza: 0.7, organizzazione: 0.6, energia: 0.7 },
    disponibilita: ["mattina", "sera"],
    lingue: ["italiano", "spagnolo"],
    avatarColor: "#3a6b56",
  },
  {
    id: "g1",
    role: "giovane",
    nome: "Marco Ferri",
    eta: 24,
    zona: "Centro",
    bio: "Studente di Ingegneria informatica. Volontario nel doposcuola.",
    interessi: ["tecnologia", "musica", "lettura", "fotografia"],
    offre: ["smartphone", "social", "videochiamate", "fotografia digitale"],
    cerca: ["lezioni di piano", "cucina", "storie di vita"],
    tratti: { apertura: 0.85, socievolezza: 0.6, pazienza: 0.75, organizzazione: 0.65, energia: 0.7 },
    disponibilita: ["pomeriggio", "mattina"],
    lingue: ["italiano", "inglese"],
    avatarColor: "#c9a24b",
  },
  {
    id: "g2",
    role: "giovane",
    nome: "Sofia Greco",
    eta: 22,
    zona: "Centro",
    bio: "Studentessa di Scienze sociali. Suona la chitarra, ama ballare.",
    interessi: ["musica", "ballo", "teatro", "cucina"],
    offre: ["smartphone", "social", "ballo"],
    cerca: ["cucina", "cucito", "lingue"],
    tratti: { apertura: 0.8, socievolezza: 0.92, pazienza: 0.7, organizzazione: 0.55, energia: 0.85 },
    disponibilita: ["sera", "mattina"],
    lingue: ["italiano", "spagnolo"],
    avatarColor: "#d9b65f",
  },
  {
    id: "g3",
    role: "giovane",
    nome: "Luca Bianchi",
    eta: 27,
    zona: "Parco",
    bio: "Giovane professionista, project manager. Gioca a scacchi da sempre.",
    interessi: ["scacchi", "tecnologia", "giardinaggio", "lettura"],
    offre: ["tablet", "fotografia digitale", "mentorship digitale"],
    cerca: ["scacchi", "giardinaggio", "mentorship lavorativa"],
    tratti: { apertura: 0.7, socievolezza: 0.5, pazienza: 0.65, organizzazione: 0.88, energia: 0.6 },
    disponibilita: ["pomeriggio", "sera"],
    lingue: ["italiano", "inglese"],
    avatarColor: "#b8902f",
  },
];

export const getById = (id: string) => persone.find((p) => p.id === id);
export const seniors = () => persone.filter((p) => p.role === "senior");
export const giovani = () => persone.filter((p) => p.role === "giovane");

export const bancaTempo: TimeBankEntry[] = [
  { id: "t1", daId: "g1", aId: "s1", attivita: "Lezione: configurare videochiamate", crediti: 2, data: "2026-06-22", stato: "completato" },
  { id: "t2", daId: "s1", aId: "g1", attivita: "Lezione di pianoforte (base)", crediti: 2, data: "2026-06-23", stato: "completato" },
  { id: "t3", daId: "g2", aId: "s3", attivita: "Aiuto con i social", crediti: 1, data: "2026-06-24", stato: "completato" },
  { id: "t4", daId: "s3", aId: "g2", attivita: "Corso di cucina ligure", crediti: 3, data: "2026-06-26", stato: "pianificato" },
  { id: "t5", daId: "s2", aId: "g3", attivita: "Partita di scacchi + strategia", crediti: 1, data: "2026-06-27", stato: "pianificato" },
];

export const prenotazioni: ServiceBooking[] = [
  { id: "b1", servizio: "Controllo benessere", categoria: "telemedicina", personId: "s1", data: "2026-06-26", ora: "10:00", stato: "confermato" },
  { id: "b2", servizio: "Seduta di fisioterapia", categoria: "fisioterapia", personId: "s2", data: "2026-06-26", ora: "15:30", stato: "confermato" },
  { id: "b3", servizio: "Pranzo bistrò km0", categoria: "bistro", personId: "s3", data: "2026-06-25", ora: "13:00", stato: "in attesa" },
  { id: "b4", servizio: "Postazione coworking", categoria: "coworking", personId: "g1", data: "2026-06-25", ora: "09:00", stato: "confermato" },
];

export const parametriVitali: VitalReading[] = [
  { personId: "s1", battito: 72, passi: 4200, sonnoOre: 7.2, saturazione: 98, ultimoAggiornamento: "8 min fa" },
  { personId: "s2", battito: 81, passi: 2100, sonnoOre: 6.1, saturazione: 96, ultimoAggiornamento: "3 min fa", alert: "Attività fisica sotto la media settimanale" },
  { personId: "s3", battito: 69, passi: 5600, sonnoOre: 7.8, saturazione: 99, ultimoAggiornamento: "12 min fa" },
];

export const corseMobilita: MobilityRide[] = [
  { id: "m1", mezzo: "shuttle", da: "Senior House", a: "Centro / Mercato", ora: "09:30", stato: "disponibile" },
  { id: "m2", mezzo: "shuttle", da: "Senior House", a: "Ospedale di quartiere", ora: "11:00", stato: "prenotato" },
  { id: "m3", mezzo: "e-bike", da: "Rastrelliera A", a: "—", ora: "Libera ora", stato: "disponibile" },
  { id: "m4", mezzo: "shuttle", da: "Centro / Teatro", a: "Senior House", ora: "18:00", stato: "disponibile" },
];
