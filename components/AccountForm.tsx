"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-context";
import {
  Account,
  Role,
  ROLE_LABEL,
  TraitProfile,
  DEFAULT_TRAITS,
  TRAIT_LABEL,
  FASCIA_LABEL,
} from "@/lib/store";
import { signedDocUrl } from "@/lib/supabase/storage";
import { Camera, FileUp, Trash2, X } from "lucide-react";

const DOC_TIPI: Record<Role, string[]> = {
  residente: ["Certificato medico", "Documento d'identità"],
  collaboratore: ["Patente", "Documento d'identità"],
  personale: ["Contratto", "Documento d'identità"],
  admin: ["Documento d'identità"],
};

const DISP = ["mattina", "pomeriggio", "sera"];
const toList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const fromList = (a?: string[]) => (a ?? []).join(", ");

export default function AccountForm({ userId, mode }: { userId?: string; mode: "create" | "edit" }) {
  const {
    db, currentUser, isAdmin, supabase,
    createUser, updateUser, deleteUser, uploadUserAvatar, addUserDocument, removeUserDocument,
  } = useApp();
  const router = useRouter();
  const editing = mode === "edit" ? db.users.find((u) => u.id === userId) : undefined;
  const isSelf = currentUser?.id === editing?.id;
  const canManage = isAdmin;

  const [form, setForm] = useState<Partial<Account>>(
    editing ?? { role: "residente", apartmentId: null }
  );
  const [password, setPassword] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(editing?.fotoProfilo);
  const [pendingDocs, setPendingDocs] = useState<{ tipo: string; file: File }[]>([]);
  const [docTipo, setDocTipo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const role = (form.role ?? "residente") as Role;
  const set = (k: keyof Account, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const docs = editing?.documenti ?? [];

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function onDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const tipo = docTipo || DOC_TIPI[role][0];
    if (mode === "edit" && editing) {
      setBusy(true);
      await addUserDocument(editing.id, tipo, file);
      setBusy(false);
    } else {
      setPendingDocs((d) => [...d, { tipo, file }]);
    }
    if (docRef.current) docRef.current.value = "";
  }

  async function openDoc(path: string) {
    if (!supabase) return;
    const url = await signedDocUrl(supabase, path);
    if (url) window.open(url, "_blank");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "create") {
        if (!form.email || !password) { setError("Email e password obbligatorie."); return; }
        const res = await createUser({
          email: form.email, password, role,
          nome: form.nome ?? "", cognome: form.cognome ?? "",
          dataNascita: form.dataNascita, telefono: form.telefono, indirizzo: form.indirizzo, note: form.note,
          apartmentId: form.apartmentId ?? null,
          interessi: form.interessi, offre: form.offre, cerca: form.cerca,
          lingue: form.lingue, disponibilita: form.disponibilita, tratti: form.tratti,
        });
        if (!res.ok || !res.id) { setError(res.error ?? "Errore"); return; }
        if (fotoFile) {
          const url = await uploadUserAvatar(res.id, fotoFile);
          if (url) await updateUser(res.id, { fotoProfilo: url });
        }
        for (const d of pendingDocs) await addUserDocument(res.id, d.tipo, d.file);
        router.push("/utenti");
      } else if (editing) {
        let fotoUrl = editing.fotoProfilo;
        if (fotoFile) fotoUrl = (await uploadUserAvatar(editing.id, fotoFile)) ?? fotoUrl;
        const patch: Partial<Account> = {
          nome: form.nome, cognome: form.cognome, dataNascita: form.dataNascita,
          telefono: form.telefono, indirizzo: form.indirizzo, note: form.note, fotoProfilo: fotoUrl,
          interessi: form.interessi, offre: form.offre, cerca: form.cerca,
          lingue: form.lingue, disponibilita: form.disponibilita, tratti: form.tratti,
        };
        if (canManage) { patch.role = form.role; patch.apartmentId = form.apartmentId ?? null; }
        const ok = await updateUser(editing.id, patch);
        if (!ok) { setError("Salvataggio non riuscito."); return; }
        setFotoFile(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!editing) return;
    if (confirm(`Eliminare l'account di ${editing.nome} ${editing.cognome}?`)) {
      await deleteUser(editing.id);
      router.push("/utenti");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      {/* Foto profilo */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => fotoRef.current?.click()} className="relative group">
          {fotoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoPreview} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <span className="w-20 h-20 rounded-full grid place-items-center bg-[var(--primary)] text-white text-2xl">
              {(form.nome?.[0] ?? "") + (form.cognome?.[0] ?? "") || "?"}
            </span>
          )}
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white">
            <Camera size={20} />
          </span>
        </button>
        <button type="button" onClick={() => fotoRef.current?.click()} className="text-sm text-[var(--primary)] underline">
          Carica foto profilo
        </button>
        <input ref={fotoRef} type="file" accept="image/*" hidden onChange={onFoto} />
      </div>

      {/* Anagrafica */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nome</label>
          <input className="input" value={form.nome ?? ""} onChange={(e) => set("nome", e.target.value)} required />
        </div>
        <div>
          <label className="label">Cognome</label>
          <input className="input" value={form.cognome ?? ""} onChange={(e) => set("cognome", e.target.value)} required />
        </div>
        <div>
          <label className="label">Data di nascita</label>
          <input type="date" className="input" value={form.dataNascita ?? ""} onChange={(e) => set("dataNascita", e.target.value)} />
        </div>
        <div>
          <label className="label">Telefono</label>
          <input className="input" value={form.telefono ?? ""} onChange={(e) => set("telefono", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Indirizzo</label>
          <input className="input" value={form.indirizzo ?? ""} onChange={(e) => set("indirizzo", e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} required disabled={mode === "edit"} />
        </div>
        {mode === "create" && (
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        )}
      </div>

      {/* Ruolo + appartamento (solo admin) */}
      {canManage && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Ruolo</label>
            <select className="input" value={role} onChange={(e) => set("role", e.target.value as Role)}>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
          {role === "residente" && (
            <div>
              <label className="label">Appartamento</label>
              <select className="input" value={form.apartmentId ?? ""} onChange={(e) => set("apartmentId", e.target.value || null)}>
                <option value="">— non assegnato —</option>
                {db.apartments.map((a) => (
                  <option key={a.id} value={a.id}>{a.numero} · {FASCIA_LABEL[a.fascia]}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Documenti */}
      <div>
        <label className="label">Documenti {role === "collaboratore" ? "(patente)" : role === "residente" ? "(certificati medici)" : ""}</label>
        <div className="flex flex-wrap gap-2 items-center">
          <select className="input max-w-[200px]" value={docTipo} onChange={(e) => setDocTipo(e.target.value)}>
            {DOC_TIPI[role].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="button" onClick={() => docRef.current?.click()} className="flex items-center gap-2 text-sm border border-[var(--border)] rounded-lg px-3 py-2 hover:border-[var(--accent)]">
            <FileUp size={16} /> Carica file
          </button>
          <input ref={docRef} type="file" accept="image/*,application/pdf" hidden onChange={onDoc} />
        </div>

        {(docs.length > 0 || pendingDocs.length > 0) && (
          <ul className="mt-3 space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-lg bg-[var(--background)] p-2.5 text-sm">
                <span className="font-medium">{d.tipo}</span>
                <button type="button" onClick={() => openDoc(d.dataUrl)} className="text-[var(--muted)] truncate underline">{d.nome}</button>
                <button type="button" onClick={() => removeUserDocument(d)} className="ml-auto text-[var(--danger)]"><X size={16} /></button>
              </li>
            ))}
            {pendingDocs.map((d, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-[var(--background)] p-2.5 text-sm">
                <span className="font-medium">{d.tipo}</span>
                <span className="text-[var(--muted)] truncate">{d.file.name}</span>
                <span className="ml-auto text-xs text-[var(--warning)]">da caricare</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Profilo affinità — Matching AI (residente / collaboratore) */}
      {(role === "residente" || role === "collaboratore") && (
        <div className="rounded-xl border border-[var(--border)] p-4 space-y-4">
          <div className="text-sm font-medium text-[var(--primary)]">
            Profilo affinità <span className="text-[var(--muted)] font-normal">· usato dal Matching AI</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Interessi (separati da virgola)</label>
              <input className="input" value={fromList(form.interessi)} onChange={(e) => set("interessi", toList(e.target.value))} placeholder="musica, lettura, giardinaggio" />
            </div>
            <div>
              <label className="label">Lingue</label>
              <input className="input" value={fromList(form.lingue)} onChange={(e) => set("lingue", toList(e.target.value))} placeholder="italiano, inglese" />
            </div>
            <div>
              <label className="label">Cosa offre</label>
              <input className="input" value={fromList(form.offre)} onChange={(e) => set("offre", toList(e.target.value))} placeholder={role === "residente" ? "cucina, mentorship" : "smartphone, social"} />
            </div>
            <div>
              <label className="label">Cosa cerca / vuole imparare</label>
              <input className="input" value={fromList(form.cerca)} onChange={(e) => set("cerca", toList(e.target.value))} placeholder={role === "residente" ? "smartphone, videochiamate" : "cucina, storie di vita"} />
            </div>
          </div>
          <div>
            <label className="label">Disponibilità</label>
            <div className="flex gap-2">
              {DISP.map((d) => {
                const active = (form.disponibilita ?? []).includes(d);
                return (
                  <button key={d} type="button"
                    onClick={() => set("disponibilita", active ? (form.disponibilita ?? []).filter((x) => x !== d) : [...(form.disponibilita ?? []), d])}
                    className={`rounded-full border px-3 py-1.5 text-sm capitalize ${active ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)]"}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Tratti caratteriali</label>
            <div className="space-y-2">
              {(Object.keys(TRAIT_LABEL) as (keyof TraitProfile)[]).map((t) => {
                const tratti = form.tratti ?? DEFAULT_TRAITS;
                return (
                  <div key={t} className="flex items-center gap-3">
                    <span className="text-sm w-32 text-[var(--muted)]">{TRAIT_LABEL[t]}</span>
                    <input type="range" min={0} max={100} value={Math.round(tratti[t] * 100)}
                      onChange={(e) => set("tratti", { ...tratti, [t]: Number(e.target.value) / 100 })}
                      className="flex-1 accent-[var(--accent)]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="label">Note</label>
        <textarea className="input" rows={3} value={form.note ?? ""} onChange={(e) => set("note", e.target.value)} />
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {saved && <p className="text-sm text-[var(--success)]">Modifiche salvate ✓</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? "Attendere…" : mode === "create" ? "Crea account" : "Salva modifiche"}
        </button>
        {mode === "edit" && canManage && !isSelf && (
          <button type="button" onClick={onDelete} className="flex items-center gap-2 text-sm text-[var(--danger)]">
            <Trash2 size={16} /> Elimina account
          </button>
        )}
      </div>
    </form>
  );
}
