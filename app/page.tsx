"use client";

import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { PageHeader, Badge } from "@/components/ui";
import { HeartHandshake, Clock, Stethoscope, Activity, Bus, ArrowRight, Users, Building2 } from "lucide-react";

export default function Home() {
  const { db, currentUser } = useApp();

  const residenti = db.users.filter((u) => u.role === "residente").length;
  const collaboratori = db.users.filter((u) => u.role === "collaboratore").length;
  const occupati = new Set(db.users.filter((u) => u.apartmentId).map((u) => u.apartmentId)).size;

  const stats = [
    { label: "Residenti", value: residenti },
    { label: "Collaboratori", value: collaboratori },
    { label: "Appartamenti occupati", value: `${occupati}/${db.apartments.length}` },
    { label: "Voci in bacheca", value: db.banca.length },
  ];

  const isAdmin = currentUser?.role === "admin";
  const moduli = [
    ...(isAdmin ? [
      { href: "/utenti", label: "Utenti", desc: "Gestisci gli account per ruolo", icon: Users },
      { href: "/appartamenti", label: "Appartamenti", desc: "12 unità divise per fascia d'età", icon: Building2 },
    ] : []),
    { href: "/matching", label: "Matching AI", desc: "Abbina residenti e collaboratori", icon: HeartHandshake },
    { href: "/banca-tempo", label: "Banca del Tempo", desc: "Crediti, attività, eventi e news", icon: Clock },
    { href: "/hub-servizi", label: "Hub Servizi", desc: "Telemedicina, fisio, bistrò, coworking", icon: Stethoscope },
    { href: "/salute-casa", label: "Salute & Casa", desc: "Monitoraggio IoT non invasivo", icon: Activity },
    { href: "/mobilita", label: "Mobilità", desc: "Shuttle ed e-bike di quartiere", icon: Bus },
  ];

  return (
    <div>
      <PageHeader
        title={currentUser ? `Ciao, ${currentUser.nome}` : "Panoramica"}
        subtitle="Senior House ibrida · modello Silver Living intergenerazionale"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-3xl font-semibold text-[var(--primary)]">{s.value}</div>
            <div className="text-sm text-[var(--muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)] mb-3">Moduli</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduli.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="card p-5 hover:border-[var(--accent)] transition-colors group">
            <Icon className="text-[var(--accent)] mb-3" size={24} />
            <div className="font-medium text-[var(--foreground)] flex items-center gap-1">
              {label}
              <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-[var(--muted)] mt-1">{desc}</p>
          </Link>
        ))}
        <div className="card p-5 opacity-70">
          <div className="font-medium text-[var(--foreground)] flex items-center gap-2">
            Giochi cognitivi <Badge tone="warning">WIP</Badge>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Monitoraggio predittivo del benessere cognitivo — in arrivo.</p>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] mt-8">
        Versione dimostrativa. Dati e parametri sono fittizi e non rappresentano persone reali.
      </p>
    </div>
  );
}
