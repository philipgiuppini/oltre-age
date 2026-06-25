import { PageHeader, Avatar, Badge } from "@/components/ui";
import { prenotazioni, getById } from "@/lib/demo-data";
import { Stethoscope, Activity, UtensilsCrossed, Laptop } from "lucide-react";

const categorie = [
  { key: "telemedicina", label: "Telemedicina", icon: Stethoscope, desc: "Controlli del benessere da remoto (no videochat: dati dal braccialetto)" },
  { key: "fisioterapia", label: "Fisioterapia in loco", icon: Activity, desc: "Palestra di riabilitazione al piano terra" },
  { key: "bistro", label: "Bistrò biologico", icon: UtensilsCrossed, desc: "Ristorazione a km0 aperta al quartiere" },
  { key: "coworking", label: "Coworking", icon: Laptop, desc: "Spazi condivisi tra le due generazioni" },
] as const;

export default function HubServiziPage() {
  return (
    <div>
      <PageHeader
        title="Hub di Servizi"
        subtitle="Servizi della struttura aperti anche alla cittadinanza: la Senior House è un hub di quartiere, non un luogo chiuso."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {categorie.map(({ key, label, icon: Icon, desc }) => {
          const count = prenotazioni.filter((b) => b.categoria === key).length;
          return (
            <div key={key} className="card p-5">
              <Icon className="text-[var(--accent)] mb-3" size={22} />
              <div className="font-medium">{label}</div>
              <p className="text-xs text-[var(--muted)] mt-1">{desc}</p>
              <div className="text-xs text-[var(--muted)] mt-3">{count} prenotazioni</div>
            </div>
          );
        })}
      </div>

      <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)] mb-3">
        Prossime prenotazioni
      </h2>
      <div className="card divide-y divide-[var(--border)]">
        {prenotazioni.map((b) => {
          const p = getById(b.personId)!;
          return (
            <div key={b.id} className="flex items-center gap-4 p-4">
              <Avatar person={p} size={34} />
              <div className="flex-1">
                <div className="text-sm font-medium">{b.servizio}</div>
                <div className="text-xs text-[var(--muted)]">{p.nome} · {b.data} ore {b.ora}</div>
              </div>
              <Badge tone={b.stato === "confermato" ? "success" : "warning"}>{b.stato}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
