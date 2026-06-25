"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { BancaItem, BancaTipo } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { Coins, CalendarDays, Newspaper, Sparkles, Plus, Pencil, Trash2, Check, X } from "lucide-react";

const TIPO_META: Record<BancaTipo, { label: string; icon: React.ElementType }> = {
  attivita: { label: "Attività", icon: Sparkles },
  evento: { label: "Eventi", icon: CalendarDays },
  news: { label: "News", icon: Newspaper },
};

export default function BancaPage() {
  const { db, currentUser, isAdmin, upsertBanca, deleteBanca, toggleIscrizione } = useApp();
  const [editing, setEditing] = useState<Partial<BancaItem> | null>(null);

  if (!currentUser) return null;

  // saldo = crediti base + crediti delle attività/eventi a cui è iscritto
  const guadagnati = db.banca
    .filter((b) => b.iscritti.includes(currentUser.id))
    .reduce((s, b) => s + b.crediti, 0);
  const saldo = currentUser.crediti + guadagnati;

  return (
    <div>
      <PageHeader title="Banca del Tempo" subtitle="Saldo crediti, attività a cui iscriversi, eventi e news della comunità." />

      {/* Saldo */}
      <div className="card p-5 mb-7 flex items-center gap-4" style={{ background: "var(--primary)" }}>
        <span className="grid place-items-center rounded-full bg-white/15 p-3">
          <Coins className="text-[var(--accent-soft)]" size={26} />
        </span>
        <div className="text-white">
          <div className="text-3xl font-semibold">{saldo} <span className="text-base font-normal opacity-80">crediti</span></div>
          <div className="text-sm opacity-80">Saldo di {currentUser.nome} {currentUser.cognome}</div>
        </div>
      </div>

      {isAdmin && (
        <button onClick={() => setEditing({ tipo: "attivita", crediti: 1 })} className="btn-primary flex items-center gap-2 mb-6">
          <Plus size={16} /> Pubblica in bacheca
        </button>
      )}

      {(["attivita", "evento", "news"] as BancaTipo[]).map((tipo) => {
        const items = db.banca.filter((b) => b.tipo === tipo);
        const Meta = TIPO_META[tipo];
        return (
          <section key={tipo} className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-[var(--muted)] mb-3">
              <Meta.icon size={16} /> {Meta.label}
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Niente in bacheca.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {items.map((b) => {
                  const iscritto = b.iscritti.includes(currentUser.id);
                  return (
                    <div key={b.id} className="card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium">{b.titolo}</div>
                          <div className="text-xs text-[var(--muted)]">{b.data}{b.crediti > 0 ? ` · ${b.crediti} crediti` : ""}</div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setEditing(b)} className="text-[var(--muted)] hover:text-[var(--primary)]"><Pencil size={15} /></button>
                            <button onClick={() => deleteBanca(b.id)} className="text-[var(--muted)] hover:text-[var(--danger)]"><Trash2 size={15} /></button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted)] mt-2">{b.descrizione}</p>

                      {tipo !== "news" && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-[var(--muted)]">{b.iscritti.length} iscritti</span>
                          <button
                            onClick={() => toggleIscrizione(b.id, currentUser.id)}
                            className={`flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 ${
                              iscritto ? "bg-[var(--success)]/10 text-[var(--success)]" : "btn-primary"
                            }`}
                          >
                            {iscritto ? <><Check size={15} /> Iscritto</> : "Iscriviti"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {editing && (
        <Editor item={editing} onClose={() => setEditing(null)} onSave={(it) => { upsertBanca(it); setEditing(null); }} />
      )}
    </div>
  );
}

function Editor({
  item,
  onClose,
  onSave,
}: {
  item: Partial<BancaItem>;
  onClose: () => void;
  onSave: (i: Partial<BancaItem> & { tipo: BancaTipo }) => void;
}) {
  const [form, setForm] = useState<Partial<BancaItem>>(item);
  const set = (k: keyof BancaItem, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="card p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{item.id ? "Modifica" : "Nuova pubblicazione"}</h3>
          <button onClick={onClose}><X size={18} className="text-[var(--muted)]" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.tipo} onChange={(e) => set("tipo", e.target.value as BancaTipo)}>
              <option value="attivita">Attività</option>
              <option value="evento">Evento</option>
              <option value="news">News</option>
            </select>
          </div>
          <div>
            <label className="label">Titolo</label>
            <input className="input" value={form.titolo ?? ""} onChange={(e) => set("titolo", e.target.value)} />
          </div>
          <div>
            <label className="label">Descrizione</label>
            <textarea className="input" rows={3} value={form.descrizione ?? ""} onChange={(e) => set("descrizione", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data</label>
              <input type="date" className="input" value={form.data ?? ""} onChange={(e) => set("data", e.target.value)} />
            </div>
            <div>
              <label className="label">Crediti</label>
              <input type="number" min={0} className="input" value={form.crediti ?? 0} onChange={(e) => set("crediti", Number(e.target.value))} />
            </div>
          </div>
        </div>
        <button
          onClick={() => onSave({ ...form, tipo: (form.tipo ?? "attivita") as BancaTipo })}
          className="btn-primary w-full mt-4"
        >
          Salva
        </button>
      </div>
    </div>
  );
}
