"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import { Account, DEFAULT_TRAITS, computeAge, roleColor, ROLE_LABEL } from "@/lib/store";
import { matchPerson } from "@/lib/match/engine";
import type { Person } from "@/lib/types";
import { PageHeader, Badge } from "@/components/ui";
import { UserPlus } from "lucide-react";

function accountToPerson(a: Account): Person {
  return {
    id: a.id,
    role: a.role === "residente" ? "senior" : "giovane",
    nome: `${a.nome} ${a.cognome}`,
    eta: computeAge(a.dataNascita) ?? 0,
    zona: a.indirizzo || "—",
    bio: a.note || "",
    interessi: a.interessi ?? [],
    offre: a.offre ?? [],
    cerca: a.cerca ?? [],
    tratti: a.tratti ?? DEFAULT_TRAITS,
    disponibilita: a.disponibilita ?? [],
    lingue: a.lingue ?? [],
    avatarColor: roleColor(a.role),
  };
}

export default function MatchingPage() {
  const { db, loaded } = useApp();
  const candidati = useMemo(
    () => db.users.filter((u) => u.role === "residente" || u.role === "collaboratore"),
    [db.users]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const targetAccount = candidati.find((c) => c.id === selectedId) ?? candidati[0];
  const persons = useMemo(() => candidati.map(accountToPerson), [candidati]);
  const target = targetAccount ? accountToPerson(targetAccount) : null;
  const risultati = useMemo(() => (target ? matchPerson(target, persons) : []), [target, persons]);

  if (loaded && candidati.length < 2) {
    return (
      <div>
        <PageHeader title="Matching AI intergenerazionale" subtitle="Abbina residenti e collaboratori per affinità." />
        <div className="card p-8 text-center">
          <p className="text-[var(--muted)] mb-4">
            Servono almeno un <strong>residente</strong> e un <strong>collaboratore</strong> con profilo di affinità compilato.
          </p>
          <Link href="/utenti/nuovo" className="btn-primary inline-flex items-center gap-2">
            <UserPlus size={16} /> Crea un account
          </Link>
        </div>
      </div>
    );
  }

  if (!target) return null;

  return (
    <div>
      <PageHeader
        title="Matching AI intergenerazionale"
        subtitle="Motore di compatibilità spiegabile sui profili reali di residenti e collaboratori."
      />

      <div className="mb-6">
        <label className="text-sm text-[var(--muted)] block mb-2">Seleziona una persona</label>
        <div className="flex flex-wrap gap-2">
          {candidati.map((p) => {
            const active = p.id === (targetAccount?.id ?? "");
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                  active ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)]"
                }`}>
                <span className="w-5 h-5 rounded-full grid place-items-center text-white text-[10px]" style={{ background: roleColor(p.role) }}>
                  {(p.nome[0] ?? "") + (p.cognome[0] ?? "")}
                </span>
                {p.nome}
                <span className="opacity-60 text-xs">{p.role === "residente" ? "residente" : "collab."}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full grid place-items-center text-white text-lg" style={{ background: target.avatarColor }}>
            {(targetAccount!.nome[0] ?? "") + (targetAccount!.cognome[0] ?? "")}
          </span>
          <div>
            <div className="font-medium">{target.nome}{target.eta ? `, ${target.eta}` : ""}</div>
            <div className="text-sm text-[var(--muted)]">{ROLE_LABEL[targetAccount!.role]}{target.bio ? ` · ${target.bio}` : ""}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {target.interessi.length ? target.interessi.map((i) => <Badge key={i} tone="accent">{i}</Badge>)
            : <span className="text-xs text-[var(--muted)]">Nessun interesse nel profilo — compilalo nella scheda account.</span>}
        </div>
      </div>

      <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)] mb-3">Abbinamenti suggeriti</h2>
      {risultati.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nessun candidato del ruolo opposto.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {risultati.map((r) => (
            <div key={r.person.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center text-white" style={{ background: r.person.avatarColor }}>
                    {r.person.nome.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <div className="font-medium">{r.person.nome}{r.person.eta ? `, ${r.person.eta}` : ""}</div>
                    <div className="text-xs text-[var(--muted)]">{r.person.zona}</div>
                  </div>
                </div>
                <ScoreRing score={r.score} />
              </div>
              <div className="mt-4 space-y-1.5">
                {r.spiegazioni.filter((s) => s.weight > 0).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(8, s.weight * 1.6)}px` }} />
                    <span className="text-[var(--muted)]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--muted)] mt-8">
        Punteggio deterministico e trasparente. In produzione il motore gira come Supabase Edge Function con embeddings per la similarità semantica.
      </p>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "var(--success)" : score >= 45 ? "var(--accent)" : "var(--muted)";
  return (
    <div className="relative grid place-items-center rounded-full"
      style={{ width: 56, height: 56, background: `conic-gradient(${color} ${score * 3.6}deg, var(--border) 0deg)` }}>
      <div className="absolute inset-1.5 rounded-full bg-[var(--surface)] grid place-items-center">
        <span className="text-sm font-semibold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}
