"use client";

import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { Account, Role, ROLE_LABEL, roleColor, FASCIA_LABEL } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { UserPlus, FileText } from "lucide-react";

const ORDER: Role[] = ["residente", "collaboratore", "personale", "admin"];

export default function UtentiPage() {
  const { db, currentUser, loaded } = useApp();
  if (loaded && currentUser?.role !== "admin") {
    return <p className="text-[var(--muted)]">Accesso riservato all&apos;amministratore.</p>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-7">
        <PageHeader title="Gestione utenti" subtitle="Account divisi per ruolo. Crea e gestisci residenti, collaboratori e personale." />
        <Link href="/utenti/nuovo" className="btn-primary flex items-center gap-2 shrink-0">
          <UserPlus size={16} /> <span className="hidden sm:inline">Nuovo utente</span>
        </Link>
      </div>

      {ORDER.map((role) => {
        const list = db.users.filter((u) => u.role === role);
        return (
          <section key={role} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">{ROLE_LABEL[role]}</h2>
              <span className="text-xs text-[var(--muted)]">({list.length})</span>
            </div>
            {list.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nessun account.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((u) => (
                  <UserCard key={u.id} u={u} apt={db.apartments.find((a) => a.id === u.apartmentId)?.numero} fascia={db.apartments.find((a) => a.id === u.apartmentId)?.fascia} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function UserCard({ u, apt, fascia }: { u: Account; apt?: string; fascia?: keyof typeof FASCIA_LABEL }) {
  return (
    <Link href={`/utenti/${u.id}`} className="card p-4 flex items-center gap-3 hover:border-[var(--accent)] transition-colors">
      {u.fotoProfilo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={u.fotoProfilo} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
      ) : (
        <span className="w-12 h-12 rounded-full grid place-items-center text-white shrink-0" style={{ background: roleColor(u.role) }}>
          {(u.nome[0] ?? "") + (u.cognome[0] ?? "")}
        </span>
      )}
      <div className="min-w-0">
        <div className="font-medium truncate">{u.nome} {u.cognome}</div>
        <div className="text-xs text-[var(--muted)] truncate">{u.email}</div>
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted)]">
          {apt && <span>🏠 {apt}{fascia ? ` · ${FASCIA_LABEL[fascia].split("·")[0].trim()}` : ""}</span>}
          {u.documenti.length > 0 && <span className="flex items-center gap-0.5"><FileText size={12} /> {u.documenti.length}</span>}
        </div>
      </div>
    </Link>
  );
}
