import { PageHeader, Badge } from "@/components/ui";
import { corseMobilita } from "@/lib/demo-data";
import { Bus, Bike, MapPin } from "lucide-react";

export default function MobilitaPage() {
  return (
    <div>
      <PageHeader
        title="Mobilità sostenibile"
        subtitle="Flotta di micro-mobilità elettrica di quartiere: shuttle con conducente ed e-bike per l'indipendenza negli spostamenti."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {corseMobilita.map((r) => {
          const Icon = r.mezzo === "shuttle" ? Bus : Bike;
          return (
            <div key={r.id} className="card p-5 flex items-center gap-4">
              <div className="grid place-items-center rounded-xl bg-[var(--background)] p-3">
                <Icon className="text-[var(--primary)]" size={24} />
              </div>
              <div className="flex-1">
                <div className="font-medium capitalize">{r.mezzo}</div>
                <div className="text-sm text-[var(--muted)] flex items-center gap-1 mt-0.5">
                  <MapPin size={14} /> {r.da}
                  {r.a !== "—" && <> → {r.a}</>}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">{r.ora}</div>
              </div>
              <div className="text-right">
                <Badge tone={r.stato === "disponibile" ? "success" : "neutral"}>{r.stato}</Badge>
                {r.stato === "disponibile" && (
                  <button className="block mt-2 text-sm rounded-lg bg-[var(--primary)] text-white px-3 py-1.5 hover:bg-[var(--primary-soft)] transition-colors">
                    Prenota
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[var(--muted)] mt-8">
        Nota: per credibilità regolatoria la demo mostra shuttle con conducente, non veicoli autonomi (scenario Fase 2).
      </p>
    </div>
  );
}
