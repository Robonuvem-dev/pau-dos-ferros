import { supabase } from "@/integrations/supabase/client";
import type { ModuleDef } from "./modules";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export type Row = Record<string, unknown> & { id: string };

export async function fetchModule(mod: ModuleDef): Promise<Row[]> {
  let q = db.from(mod.table).select("*");
  if (mod.filtro) q = q.eq(mod.filtro.column, mod.filtro.value);
  if (mod.orderBy) q = q.order(mod.orderBy, { ascending: mod.orderBy === "nome" || mod.orderBy === "ordem" || mod.orderBy === "placa" });
  const { data, error } = await q.limit(1000);
  if (error) throw error;
  return data as Row[];
}

/** Envia arquivo ao armazenamento e devolve um link de longa duração. */
export async function uploadFile(file: File): Promise<string> {
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("arquivos").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("arquivos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar link");
  return data.signedUrl;
}
