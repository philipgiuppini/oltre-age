import { PageHeader, Badge } from "@/components/ui";
import { Gamepad2, Brain, LineChart } from "lucide-react";

export default function GiochiPage() {
  return (
    <div>
      <PageHeader title="Giochi cognitivi & monitoraggio predittivo" />

      <div className="card p-10 text-center">
        <div className="inline-grid place-items-center rounded-2xl bg-[var(--background)] p-5 mb-4">
          <Gamepad2 className="text-[var(--accent)]" size={40} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-lg font-medium">Modulo in lavorazione</h2>
          <Badge tone="warning">WIP</Badge>
        </div>
        <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
          Mini-giochi sociali e interattivi per stimolare le funzioni cognitive. I dati di interazione
          alimenteranno algoritmi di monitoraggio predittivo del benessere cognitivo.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-8 text-left max-w-xl mx-auto">
          <div className="rounded-xl border border-dashed border-[var(--border)] p-4">
            <Brain className="text-[var(--primary)] mb-2" size={20} />
            <div className="text-sm font-medium">Giochi cognitivi</div>
            <p className="text-xs text-[var(--muted)] mt-1">Memoria, attenzione, linguaggio — singoli e in coppia intergenerazionale.</p>
          </div>
          <div className="rounded-xl border border-dashed border-[var(--border)] p-4">
            <LineChart className="text-[var(--primary)] mb-2" size={20} />
            <div className="text-sm font-medium">Trend predittivo</div>
            <p className="text-xs text-[var(--muted)] mt-1">Andamento nel tempo per cogliere segnali precoci, in modo non clinico.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
