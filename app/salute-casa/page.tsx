"use client";

import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { pseudoVitals, roleColor, computeAge } from "@/lib/store";
import { PageHeader, Badge } from "@/components/ui";
import { Heart, Footprints, Moon, Wind, Home, Lightbulb, ShieldCheck, UserPlus } from "lucide-react";

const domotica = [
  { label: "Illuminazione adattiva", stato: "Attiva", icon: Lightbulb },
  { label: "Sensori di caduta (Wi-Fi)", stato: "Operativi", icon: ShieldCheck },
  { label: "Assistente vocale (Alexa)", stato: "Connesso", icon: Home },
];

export default function SaluteCasaPage() {
  const { db, loaded } = useApp();
  const residenti = db.users.filter((u) => u.role === "residente");

  return (
    <div>
      <PageHeader
        title="Salute & Casa connessa"
        subtitle="Monitoraggio non invasivo via braccialetto e sensori Wi-Fi sui residenti. Parametri simulati per la demo."
      />

      <div className="card p-5 mb-8 border-[var(--accent-soft)]">
        <div className="text-sm font-medium mb-3">Domotica assistiva — stato impianto</div>
        <div className="grid sm:grid-cols-3 gap-4">
          {domotica.map(({ label, stato, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="text-[var(--primary)]" size={20} />
              <div>
                <div className="text-sm">{label}</div>
                <Badge tone="success">{stato}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)] mb-3">
        Parametri vitali residenti (braccialetto IoT)
      </h2>

      {loaded && residenti.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--muted)] mb-4">Nessun residente registrato.</p>
          <Link href="/utenti/nuovo" className="btn-primary inline-flex items-center gap-2">
            <UserPlus size={16} /> Aggiungi un residente
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {residenti.map((r) => {
            const v = pseudoVitals(r.id);
            const eta = computeAge(r.dataNascita);
            return (
              <div key={r.id} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  {r.fotoProfilo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.fotoProfilo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="w-10 h-10 rounded-full grid place-items-center text-white" style={{ background: roleColor("residente") }}>
                      {(r.nome[0] ?? "") + (r.cognome[0] ?? "")}
                    </span>
                  )}
                  <div>
                    <div className="font-medium">{r.nome} {r.cognome}</div>
                    <div className="text-xs text-[var(--muted)]">{eta ? `${eta} anni · ` : ""}aggiornato pochi minuti fa</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Vital icon={Heart} label="Battito" value={`${v.battito} bpm`} />
                  <Vital icon={Wind} label="SpO₂" value={`${v.saturazione}%`} />
                  <Vital icon={Footprints} label="Passi" value={v.passi.toLocaleString("it-IT")} />
                  <Vital icon={Moon} label="Sonno" value={`${v.sonnoOre} h`} />
                </div>
                {v.alert && <div className="mt-4"><Badge tone="warning">⚠ {v.alert}</Badge></div>}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[var(--muted)] mt-8">
        I dati sanitari sono categoria particolare (art. 9 GDPR). In questa demo sono simulati in modo deterministico. In produzione: consenso esplicito, base giuridica, cifratura e ruolo del DPO.
      </p>
    </div>
  );
}

function Vital({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] p-2.5">
      <Icon size={16} className="text-[var(--accent)]" />
      <div>
        <div className="text-[var(--muted)] text-xs">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
