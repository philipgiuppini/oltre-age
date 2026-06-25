"use client";

import { use } from "react";
import { useApp } from "@/lib/app-context";
import AccountForm from "@/components/AccountForm";
import { PageHeader } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/store";

export default function UtenteDettaglioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { db, currentUser, loaded } = useApp();
  const target = db.users.find((u) => u.id === id);

  if (loaded && currentUser?.role !== "admin" && currentUser?.id !== id) {
    return <p className="text-[var(--muted)]">Non hai i permessi per vedere questo account.</p>;
  }
  if (loaded && !target) return <p className="text-[var(--muted)]">Account non trovato.</p>;

  return (
    <div>
      <PageHeader
        title={target ? `${target.nome} ${target.cognome}` : "Account"}
        subtitle={target ? ROLE_LABEL[target.role] : undefined}
      />
      <AccountForm mode="edit" userId={id} />
    </div>
  );
}
