"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login, createFirstAdmin, configured } = useApp();
  const router = useRouter();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((j) => setHasAdmin(!!j.hasAdmin))
      .catch(() => setHasAdmin(true));
  }, []);

  const firstRun = hasAdmin === false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = firstRun
      ? await createFirstAdmin({ email, password, nome, cognome })
      : await login(email, password);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "Errore");
    router.replace("/");
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl font-semibold tracking-tight text-[var(--primary)]">
            Oltre<span className="text-[var(--accent)]">Age</span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Silver Living · accesso riservato</p>
        </div>

        {!configured && (
          <div className="card p-4 text-sm text-[var(--danger)]">
            Supabase non configurato: compila <code>.env.local</code> e riavvia il server.
          </div>
        )}

        {configured && (
          <form onSubmit={submit} className="card p-6 space-y-4">
            {firstRun && (
              <div className="flex items-start gap-2 rounded-lg bg-[var(--accent-soft)]/25 p-3 text-sm">
                <ShieldCheck size={18} className="text-[var(--warning)] mt-0.5 shrink-0" />
                <span>Primo avvio: crea l&apos;account <strong>amministratore</strong> della struttura.</span>
              </div>
            )}

            {firstRun && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nome</label>
                  <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Cognome</label>
                  <input className="input" value={cognome} onChange={(e) => setCognome(e.target.value)} required />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={firstRun ? "new-password" : "current-password"} />
            </div>

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            <button type="submit" disabled={busy || hasAdmin === null} className="btn-primary w-full disabled:opacity-60">
              {hasAdmin === null ? "…" : busy ? "Attendere…" : firstRun ? "Crea amministratore" : "Accedi"}
            </button>
          </form>
        )}

        <p className="text-xs text-[var(--muted)] text-center mt-4">
          Autenticazione gestita da Supabase.
        </p>
      </div>
    </div>
  );
}
