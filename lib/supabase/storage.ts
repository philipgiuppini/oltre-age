"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Carica l'avatar nel bucket pubblico "avatars" e ritorna l'URL pubblico. */
export async function uploadAvatar(sb: SupabaseClient, userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${ext}`;
  const { error } = await sb.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

/** Carica un documento nel bucket privato "documents" e ritorna il path. */
export async function uploadDocument(sb: SupabaseClient, userId: string, file: File): Promise<string> {
  const id = crypto.randomUUID();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${id}-${safe}`;
  const { error } = await sb.storage.from("documents").upload(path, file);
  if (error) throw error;
  return path;
}

/** URL firmato (60 min) per visualizzare un documento privato. */
export async function signedDocUrl(sb: SupabaseClient, path: string): Promise<string | null> {
  const { data } = await sb.storage.from("documents").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
