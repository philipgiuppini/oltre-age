import type { Person } from "@/lib/types";

export function Avatar({ person, size = 40 }: { person: Person; size?: number }) {
  const initials = person.nome
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-medium shrink-0"
      style={{ width: size, height: size, background: person.avatarColor, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]",
    accent: "bg-[var(--accent-soft)]/30 text-[var(--warning)] border-[var(--accent-soft)]",
    success: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30",
  };
  return (
    <span className={`inline-block text-xs rounded-full border px-2.5 py-0.5 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-semibold text-[var(--primary)] tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>}
    </div>
  );
}
