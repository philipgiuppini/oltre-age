"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { DB, Account, BancaItem, Role, Fascia, DocFile } from "@/lib/store";
import { rowToAccount, rowToApartment, rowToBanca, accountPatchToRow } from "@/lib/supabase/mappers";
import { uploadAvatar, uploadDocument } from "@/lib/supabase/storage";

interface AppContextValue {
  loaded: boolean;
  configured: boolean;
  db: DB;
  currentUser: Account | null;
  isAdmin: boolean;
  supabase: SupabaseClient | null;
  refetch: () => Promise<void>;
  // auth
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  createFirstAdmin: (data: { email: string; password: string; nome?: string; cognome?: string }) => Promise<{ ok: boolean; error?: string }>;
  // users
  createUser: (data: Partial<Account> & { email: string; password: string }) => Promise<{ ok: boolean; error?: string; id?: string }>;
  updateUser: (id: string, patch: Partial<Account>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<void>;
  uploadUserAvatar: (userId: string, file: File) => Promise<string | null>;
  addUserDocument: (userId: string, tipo: string, file: File) => Promise<void>;
  removeUserDocument: (doc: DocFile) => Promise<void>;
  // apartments
  addApartment: () => Promise<void>;
  removeApartment: (id: string) => Promise<void>;
  setApartmentFascia: (id: string, fascia: Fascia) => Promise<void>;
  assignApartment: (userId: string, apartmentId: string | null) => Promise<void>;
  // banca
  upsertBanca: (item: Partial<BancaItem> & { tipo: BancaItem["tipo"] }) => Promise<void>;
  deleteBanca: (id: string) => Promise<void>;
  toggleIscrizione: (itemId: string, userId: string) => Promise<void>;
}

const Ctx = createContext<AppContextValue | null>(null);
const EMPTY: DB = { users: [], apartments: [], banca: [] };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (supabaseRef.current === null) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  const [db, setDb] = useState<DB>(EMPTY);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchData = useCallback(async (uid: string | null) => {
    if (!supabase || !uid) {
      setDb(EMPTY);
      return;
    }
    const [profilesRes, docsRes, aptRes, bancaRes, iscrRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("documents").select("*"),
      supabase.from("apartments").select("*").order("numero"),
      supabase.from("banca_items").select("*").order("data", { ascending: false }),
      supabase.from("banca_iscrizioni").select("*"),
    ]);

    const docsByUser = new Map<string, DocFile[]>();
    (docsRes.data ?? []).forEach((d) => {
      const list = docsByUser.get(d.user_id) ?? [];
      list.push({ id: d.id, tipo: d.tipo, nome: d.nome, dataUrl: d.path });
      docsByUser.set(d.user_id, list);
    });

    const iscByItem = new Map<string, string[]>();
    (iscrRes.data ?? []).forEach((i) => {
      const list = iscByItem.get(i.item_id) ?? [];
      list.push(i.user_id);
      iscByItem.set(i.item_id, list);
    });

    setDb({
      users: (profilesRes.data ?? []).map((r) => rowToAccount(r, docsByUser.get(r.id) ?? [])),
      apartments: (aptRes.data ?? []).map(rowToApartment),
      banca: (bancaRes.data ?? []).map((r) => rowToBanca(r, iscByItem.get(r.id) ?? [])),
    });
  }, [supabase]);

  const refetch = useCallback(() => fetchData(userId), [fetchData, userId]);

  useEffect(() => {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id ?? null;
      if (!active) return;
      setUserId(uid);
      await fetchData(uid);
      if (active) setLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const uid = session?.user.id ?? null;
      setUserId(uid);
      await fetchData(uid);
      setLoaded(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, fetchData]);

  const currentUser = useMemo(() => db.users.find((u) => u.id === userId) ?? null, [db.users, userId]);
  const isAdmin = currentUser?.role === "admin";

  async function authHeader(): Promise<HeadersInit> {
    const { data } = await supabase!.auth.getSession();
    return { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` };
  }

  const value: AppContextValue = {
    loaded,
    configured: !!supabase,
    db,
    currentUser,
    isAdmin,
    supabase,
    refetch,

    async login(email, password) {
      if (!supabase) return { ok: false, error: "Supabase non configurato" };
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { ok: false, error: "Email o password non corretti." };
      return { ok: true };
    },

    async logout() {
      await supabase?.auth.signOut();
      setUserId(null);
      setDb(EMPTY);
    },

    async createFirstAdmin(data) {
      if (!supabase) return { ok: false, error: "Supabase non configurato" };
      // crea l'admin lato server con email già confermata (indipendente dalle impostazioni del progetto)
      const res = await fetch("/api/bootstrap-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim(), password: data.password, nome: data.nome ?? "Admin", cognome: data.cognome ?? "" }),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error ?? "Errore" };
      const { error } = await supabase.auth.signInWithPassword({ email: data.email.trim(), password: data.password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },

    async createUser(data) {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: await authHeader(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error ?? "Errore" };
      await refetch();
      return { ok: true, id: json.id };
    },

    async updateUser(id, patch) {
      if (!supabase) return false;
      const { error } = await supabase.from("profiles").update(accountPatchToRow(patch)).eq("id", id);
      if (error) return false;
      await refetch();
      return true;
    },

    async deleteUser(id) {
      await fetch(`/api/users/${id}`, { method: "DELETE", headers: await authHeader() });
      await refetch();
    },

    async uploadUserAvatar(userId, file) {
      if (!supabase) return null;
      try {
        return await uploadAvatar(supabase, userId, file);
      } catch {
        return null;
      }
    },

    async addUserDocument(userId, tipo, file) {
      if (!supabase) return;
      const path = await uploadDocument(supabase, userId, file);
      await supabase.from("documents").insert({ user_id: userId, tipo, nome: file.name, path });
      await refetch();
    },

    async removeUserDocument(doc) {
      if (!supabase) return;
      await supabase.storage.from("documents").remove([doc.dataUrl]);
      await supabase.from("documents").delete().eq("id", doc.id);
      await refetch();
    },

    async addApartment() {
      if (!supabase) return;
      const n = db.apartments.length + 1;
      await supabase.from("apartments").insert({ numero: `A${String(n).padStart(2, "0")}`, fascia: "minima" });
      await refetch();
    },

    async removeApartment(id) {
      if (!supabase) return;
      await supabase.from("apartments").delete().eq("id", id);
      await refetch();
    },

    async setApartmentFascia(id, fascia) {
      if (!supabase) return;
      await supabase.from("apartments").update({ fascia }).eq("id", id);
      await refetch();
    },

    async assignApartment(userId, apartmentId) {
      if (!supabase) return;
      await supabase.from("profiles").update({ apartment_id: apartmentId }).eq("id", userId);
      await refetch();
    },

    async upsertBanca(item) {
      if (!supabase) return;
      if (item.id) {
        await supabase.from("banca_items").update({
          tipo: item.tipo, titolo: item.titolo, descrizione: item.descrizione, data: item.data, crediti: item.crediti,
        }).eq("id", item.id);
      } else {
        await supabase.from("banca_items").insert({
          tipo: item.tipo, titolo: item.titolo ?? "", descrizione: item.descrizione ?? "",
          data: item.data ?? new Date().toISOString().slice(0, 10), crediti: item.crediti ?? 0,
        });
      }
      await refetch();
    },

    async deleteBanca(id) {
      if (!supabase) return;
      await supabase.from("banca_items").delete().eq("id", id);
      await refetch();
    },

    async toggleIscrizione(itemId, userId) {
      if (!supabase) return;
      const item = db.banca.find((b) => b.id === itemId);
      if (item?.iscritti.includes(userId)) {
        await supabase.from("banca_iscrizioni").delete().eq("item_id", itemId).eq("user_id", userId);
      } else {
        await supabase.from("banca_iscrizioni").insert({ item_id: itemId, user_id: userId });
      }
      await refetch();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp deve essere usato dentro <AppProvider>");
  return ctx;
}

export type { Role, Fascia };
