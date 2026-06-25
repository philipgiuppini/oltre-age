// Conversione tra righe Supabase (snake_case) e tipi app (camelCase).
import { Account, Apartment, BancaItem, DocFile } from "@/lib/store";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function rowToAccount(r: any, docs: DocFile[] = []): Account {
  return {
    id: r.id,
    email: r.email ?? "",
    password: "", // mai esposta: gestita da Supabase Auth
    role: r.role,
    nome: r.nome ?? "",
    cognome: r.cognome ?? "",
    dataNascita: r.data_nascita ?? undefined,
    telefono: r.telefono ?? undefined,
    indirizzo: r.indirizzo ?? undefined,
    note: r.note ?? undefined,
    fotoProfilo: r.foto_url ?? undefined,
    documenti: docs,
    apartmentId: r.apartment_id ?? null,
    crediti: r.crediti ?? 0,
    createdAt: r.created_at ?? "",
    interessi: r.interessi ?? [],
    offre: r.offre ?? [],
    cerca: r.cerca ?? [],
    lingue: r.lingue ?? [],
    disponibilita: r.disponibilita ?? [],
    tratti: r.tratti ?? undefined,
  };
}

/** Solo i campi profilo aggiornabili dal client (no email/role gestiti a parte). */
export function accountPatchToRow(p: Partial<Account>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.nome !== undefined) row.nome = p.nome;
  if (p.cognome !== undefined) row.cognome = p.cognome;
  if (p.dataNascita !== undefined) row.data_nascita = p.dataNascita || null;
  if (p.telefono !== undefined) row.telefono = p.telefono;
  if (p.indirizzo !== undefined) row.indirizzo = p.indirizzo;
  if (p.note !== undefined) row.note = p.note;
  if (p.fotoProfilo !== undefined) row.foto_url = p.fotoProfilo || null;
  if (p.apartmentId !== undefined) row.apartment_id = p.apartmentId || null;
  if (p.crediti !== undefined) row.crediti = p.crediti;
  if (p.role !== undefined) row.role = p.role;
  if (p.interessi !== undefined) row.interessi = p.interessi;
  if (p.offre !== undefined) row.offre = p.offre;
  if (p.cerca !== undefined) row.cerca = p.cerca;
  if (p.lingue !== undefined) row.lingue = p.lingue;
  if (p.disponibilita !== undefined) row.disponibilita = p.disponibilita;
  if (p.tratti !== undefined) row.tratti = p.tratti;
  return row;
}

export function rowToApartment(r: any): Apartment {
  return { id: r.id, numero: r.numero, fascia: r.fascia };
}

export function rowToBanca(r: any, iscritti: string[] = []): BancaItem {
  return {
    id: r.id,
    tipo: r.tipo,
    titolo: r.titolo,
    descrizione: r.descrizione ?? "",
    data: r.data,
    crediti: r.crediti ?? 0,
    iscritti,
  };
}
