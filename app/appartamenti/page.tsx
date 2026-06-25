"use client";

import { useApp } from "@/lib/app-context";
import { Fascia, FASCIA_LABEL, roleColor } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { Plus, Trash2, UserPlus } from "lucide-react";

const FASCE: Fascia[] = ["minima", "avanzata", "totale"];

export default function AppartamentiPage() {
  const { db, currentUser, loaded, addApartment, removeApartment, setApartmentFascia, assignApartment } = useApp();

  if (loaded && currentUser?.role !== "admin" && currentUser?.role !== "personale") {
    return <p className="text-[var(--muted)]">Accesso riservato.</p>;
  }
  const admin = currentUser?.role === "admin";
  const residenti = db.users.filter((u) => u.role === "residente");
  const liberi = residenti.filter((r) => !r.apartmentId);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-7">
        <PageHeader title="Appartamenti" subtitle="Universal Design · suddivisi per fascia d'età e livello di assistenza." />
        {admin && (
          <button onClick={addApartment} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={16} /> <span className="hidden sm:inline">Aggiungi</span>
          </button>
        )}
      </div>

      {/* Riepilogo fasce */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {FASCE.map((f) => (
          <div key={f} className="card p-4">
            <div className="text-2xl font-semibold text-[var(--primary)]">
              {db.apartments.filter((a) => a.fascia === f).length}
            </div>
            <div className="text-xs text-[var(--muted)] mt-1">{FASCIA_LABEL[f]}</div>
          </div>
        ))}
      </div>

      {liberi.length > 0 && admin && (
        <div className="rounded-lg bg-[var(--accent-soft)]/25 p-3 text-sm mb-6">
          {liberi.length} residente/i senza appartamento: {liberi.map((r) => `${r.nome} ${r.cognome}`).join(", ")}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.apartments.map((apt) => {
          const occupanti = residenti.filter((r) => r.apartmentId === apt.id);
          return (
            <div key={apt.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-[var(--primary)]">{apt.numero}</span>
                {admin && (
                  <button onClick={() => removeApartment(apt.id)} className="text-[var(--muted)] hover:text-[var(--danger)]">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <label className="label">Fascia / assistenza</label>
              <select
                className="input mb-3"
                value={apt.fascia}
                disabled={!admin}
                onChange={(e) => setApartmentFascia(apt.id, e.target.value as Fascia)}
              >
                {FASCE.map((f) => <option key={f} value={f}>{FASCIA_LABEL[f]}</option>)}
              </select>

              <div className="space-y-2">
                {occupanti.length === 0 && <p className="text-xs text-[var(--muted)]">Libero</p>}
                {occupanti.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 text-sm">
                    <span className="w-7 h-7 rounded-full grid place-items-center text-white text-xs" style={{ background: roleColor("residente") }}>
                      {(r.nome[0] ?? "") + (r.cognome[0] ?? "")}
                    </span>
                    <span className="truncate flex-1">{r.nome} {r.cognome}</span>
                    {admin && (
                      <button onClick={() => assignApartment(r.id, null)} className="text-xs text-[var(--danger)]">rimuovi</button>
                    )}
                  </div>
                ))}
              </div>

              {admin && liberi.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <UserPlus size={14} className="text-[var(--muted)]" />
                  <select
                    className="input text-sm"
                    value=""
                    onChange={(e) => e.target.value && assignApartment(e.target.value, apt.id)}
                  >
                    <option value="">Assegna residente…</option>
                    {liberi.map((r) => <option key={r.id} value={r.id}>{r.nome} {r.cognome}</option>)}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
