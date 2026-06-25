"use client";

import { useApp } from "@/lib/app-context";
import AccountForm from "@/components/AccountForm";
import { PageHeader } from "@/components/ui";

export default function NuovoUtentePage() {
  const { currentUser, loaded } = useApp();
  if (loaded && currentUser?.role !== "admin") {
    return <p className="text-[var(--muted)]">Accesso riservato all&apos;amministratore.</p>;
  }
  return (
    <div>
      <PageHeader title="Nuovo account" subtitle="Crea un account residente, collaboratore o personale struttura." />
      <AccountForm mode="create" />
    </div>
  );
}
