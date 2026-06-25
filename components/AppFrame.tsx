"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  HeartHandshake,
  Clock,
  Stethoscope,
  Activity,
  Bus,
  Gamepad2,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Role } from "@/lib/store";

type NavItem = { href: string; label: string; short: string; icon: React.ElementType; roles: Role[]; wip?: boolean };

const ALL: Role[] = ["admin", "residente", "collaboratore", "personale"];

const NAV: NavItem[] = [
  { href: "/", label: "Panoramica", short: "Home", icon: LayoutDashboard, roles: ALL },
  { href: "/utenti", label: "Utenti", short: "Utenti", icon: Users, roles: ["admin"] },
  { href: "/appartamenti", label: "Appartamenti", short: "Appart.", icon: Building2, roles: ["admin", "personale"] },
  { href: "/matching", label: "Matching AI", short: "Match", icon: HeartHandshake, roles: ["admin", "personale"] },
  { href: "/banca-tempo", label: "Banca", short: "Banca", icon: Clock, roles: ALL },
  { href: "/hub-servizi", label: "Hub Servizi", short: "Servizi", icon: Stethoscope, roles: ALL },
  { href: "/salute-casa", label: "Salute & Casa", short: "Salute", icon: Activity, roles: ["admin", "personale", "residente"] },
  { href: "/mobilita", label: "Mobilità", short: "Mobilità", icon: Bus, roles: ALL },
  { href: "/giochi", label: "Giochi", short: "Giochi", icon: Gamepad2, roles: ALL, wip: true },
];

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const { loaded, currentUser } = useApp();
  const path = usePathname();
  const router = useRouter();
  const isLogin = path === "/login";

  useEffect(() => {
    if (!loaded) return;
    if (!currentUser && !isLogin) router.replace("/login");
    if (currentUser && isLogin) router.replace("/");
  }, [loaded, currentUser, isLogin, router]);

  if (!loaded) {
    return (
      <div className="min-h-screen grid place-items-center text-[var(--muted)]">
        <span className="text-xl font-semibold text-[var(--primary)]">Oltre<span className="text-[var(--accent)]">Age</span></span>
      </div>
    );
  }

  if (isLogin) return <>{children}</>;
  if (!currentUser) return null; // redirecting

  const items = NAV.filter((n) => n.roles.includes(currentUser.role));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <DesktopSidebar items={items} path={path} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header mobile */}
        <MobileHeader />
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-6xl w-full pb-24 md:pb-8">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <MobileNav items={items} path={path} />
    </div>
  );
}

function DesktopSidebar({ items, path }: { items: NavItem[]; path: string }) {
  const { currentUser, logout } = useApp();
  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] min-h-screen p-5 hidden md:flex flex-col">
      <Link href="/" className="mb-8 text-2xl font-semibold tracking-tight text-[var(--primary)]">
        Oltre<span className="text-[var(--accent)]">Age</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon, wip }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--background)]"
              }`}>
              <Icon size={18} className={active ? "text-[var(--accent-soft)]" : "text-[var(--muted)]"} />
              <span>{label}</span>
              {wip && <span className="ml-auto text-[10px] uppercase text-[var(--warning)] border border-[var(--warning)] rounded px-1">WIP</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-[var(--border)]">
        <Link href="/account" className="flex items-center gap-3 mb-2">
          <ProfileBadge size={34} />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{currentUser?.nome} {currentUser?.cognome}</div>
            <div className="text-xs text-[var(--muted)]">{currentUser && roleShort(currentUser.role)}</div>
          </div>
        </Link>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--danger)]">
          <LogOut size={16} /> Esci
        </button>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const { logout } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur px-4 py-3">
      <Link href="/" className="text-xl font-semibold text-[var(--primary)]">
        Oltre<span className="text-[var(--accent)]">Age</span>
      </Link>
      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} aria-label="Account">
          <ProfileBadge size={34} />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-44 card p-2 z-30">
            <Link href="/account" onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--background)]">
              <UserIcon size={16} /> Il mio profilo
            </Link>
            <button onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--background)]">
              <LogOut size={16} /> Esci
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function MobileNav({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="flex gap-1 overflow-x-auto px-2 py-1.5 no-scrollbar">
        {items.map(({ href, short, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 min-w-[60px] text-[10px] ${
                active ? "text-[var(--primary)]" : "text-[var(--muted)]"
              }`}>
              <Icon size={20} className={active ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
              {short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function ProfileBadge({ size = 36 }: { size?: number }) {
  const { currentUser } = useApp();
  if (!currentUser) return null;
  if (currentUser.fotoProfilo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={currentUser.fotoProfilo} alt="" width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full text-white font-medium"
      style={{ width: size, height: size, background: "var(--primary)", fontSize: size * 0.38 }}>
      {(currentUser.nome?.[0] ?? "") + (currentUser.cognome?.[0] ?? "")}
    </span>
  );
}

function roleShort(role: Role) {
  return { admin: "Amministratore", residente: "Residente", collaboratore: "Collaboratore", personale: "Personale" }[role];
}
