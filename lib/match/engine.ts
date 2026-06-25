// ────────────────────────────────────────────────────────────────
// oltreage-match — motore di compatibilità senior ↔ giovane
//
// Demo: logica deterministica e SPIEGABILE (no black-box).
// In produzione questo modulo diventa una Supabase Edge Function
// (stesso input/output) e gli interessi possono essere arricchiti
// con embeddings (transformers.js) per la similarità semantica.
//
// Punteggio = somma pesata di:
//   - interessi in comune           (max 35)
//   - complementarietà offre↔cerca  (max 30)
//   - compatibilità caratteriale    (max 20)
//   - disponibilità oraria comune   (max 10)
//   - lingua comune                 (max  5)
// ────────────────────────────────────────────────────────────────

import type { Person, MatchResult, MatchExplanation } from "@/lib/types";

function jaccard(a: string[], b: string[]): { score: number; comuni: string[] } {
  const sa = new Set(a.map((x) => x.toLowerCase()));
  const sb = new Set(b.map((x) => x.toLowerCase()));
  const comuni = [...sa].filter((x) => sb.has(x));
  const unione = new Set([...sa, ...sb]);
  return { score: unione.size ? comuni.length / unione.size : 0, comuni };
}

/** Compatibilità caratteriale: vicinanza su alcuni tratti,
 *  complementarità su altri (energia/organizzazione). */
function traitCompat(a: Person, b: Person): number {
  const t1 = a.tratti;
  const t2 = b.tratti;
  // più sono vicini su apertura/socievolezza/pazienza, meglio è
  const vicinanza =
    1 -
    (Math.abs(t1.apertura - t2.apertura) +
      Math.abs(t1.socievolezza - t2.socievolezza) +
      Math.abs(t1.pazienza - t2.pazienza)) /
      3;
  // un po' di energia complementare aiuta (chi è più attivo trascina)
  const complemento = 1 - Math.abs((t1.energia + t2.energia) / 2 - 0.6);
  return Math.max(0, 0.7 * vicinanza + 0.3 * complemento);
}

export function matchPerson(target: Person, candidati: Person[]): MatchResult[] {
  const results: MatchResult[] = candidati
    .filter((c) => c.role !== target.role) // intergenerazionale: ruoli opposti
    .map((c) => {
      const interessi = jaccard(target.interessi, c.interessi);

      // complementarietà: cosa cerca il target ↔ cosa offre il candidato (e viceversa)
      const cercaOffre = jaccard(target.cerca, c.offre);
      const offreCerca = jaccard(target.offre, c.cerca);
      const complementoScore = (cercaOffre.score + offreCerca.score) / 2;
      const complementarieta = [...new Set([...cercaOffre.comuni, ...offreCerca.comuni])];

      const tratti = traitCompat(target, c);
      const orari = jaccard(target.disponibilita, c.disponibilita);
      const lingue = jaccard(target.lingue, c.lingue);

      const parts: MatchExplanation[] = [
        { label: `Interessi in comune: ${interessi.comuni.join(", ") || "—"}`, weight: interessi.score * 35 },
        { label: `Scambio possibile: ${complementarieta.join(", ") || "—"}`, weight: complementoScore * 30 },
        { label: "Compatibilità caratteriale", weight: tratti * 20 },
        { label: `Disponibilità oraria: ${orari.comuni.join(", ") || "—"}`, weight: orari.score * 10 },
        { label: `Lingua: ${lingue.comuni.join(", ") || "—"}`, weight: lingue.score * 5 },
      ];

      const score = Math.round(parts.reduce((s, p) => s + p.weight, 0));

      return {
        person: c,
        score,
        spiegazioni: parts
          .map((p) => ({ ...p, weight: Math.round(p.weight) }))
          .sort((x, y) => y.weight - x.weight),
        complementarieta,
      };
    })
    .sort((a, b) => b.score - a.score);

  return results;
}
