import { supabase } from "@/integrations/supabase/client";
import type { Field, ModuleDef } from "./modules";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export type RowValue = string | number | boolean | null | string[];
export type Row = Record<string, RowValue> & { id: string };

export async function fetchModule(mod: ModuleDef): Promise<Row[]> {
  let q = db.from(mod.table).select("*");
  if (mod.filtro) q = q.eq(mod.filtro.column, mod.filtro.value);
  if (mod.orderBy) q = q.order(mod.orderBy, { ascending: mod.orderBy === "nome" || mod.orderBy === "ordem" || mod.orderBy === "placa" });
  const { data, error } = await q.limit(1000);
  if (error) throw error;
  return data as Row[];
}

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

/** Converte valores do formulário para o formato gravado no banco. */
export function normalizeValues(mod: ModuleDef, values: Record<string, unknown>): Record<string, RowValue> {
  const out: Record<string, RowValue> = {};
  for (const f of mod.fields) out[f.name] = normalizeField(f, values[f.name]);
  if (mod.filtro) out[mod.filtro.column] = mod.filtro.value;
  if (mod.key === "noticias" && !out.slug && out.titulo) out.slug = `${slugify(String(out.titulo))}-${Date.now().toString(36)}`;
  return out;
}

export function normalizeField(f: Field, v: unknown): RowValue {
  if (f.type === "bool") return Boolean(v);
  if (f.type === "tags") return Array.isArray(v) ? v.map(String) : String(v ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  if (f.type === "files") return Array.isArray(v) ? v.map(String) : [];
  if (v === undefined || v === null || String(v).trim() === "") return null;
  if (f.type === "int") return Math.trunc(Number(String(v).replace(",", ".")));
  if (f.type === "number" || f.type === "money") {
    const s = String(v).trim();
    const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
    return Number.isFinite(n) ? n : null;
  }
  if (f.type === "date") {
    const s = String(v).trim();
    const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return br ? `${br[3]}-${br[2]}-${br[1]}` : s.slice(0, 10);
  }
  return String(v);
}

export async function saveRow(mod: ModuleDef, values: Record<string, unknown>, id?: string) {
  const payload = normalizeValues(mod, values);
  const { error } = id ? await db.from(mod.table).update(payload).eq("id", id) : await db.from(mod.table).insert(payload);
  if (error) throw new Error(error.message);
}

export async function insertMany(mod: ModuleDef, rows: Record<string, unknown>[]) {
  const payload = rows.map((r) => normalizeValues(mod, r));
  for (let i = 0; i < payload.length; i += 200) {
    const { error } = await db.from(mod.table).insert(payload.slice(i, i + 200));
    if (error) throw new Error(`Linhas ${i + 1}–${i + 200}: ${error.message}`);
  }
}

export async function deleteRow(mod: ModuleDef, id: string) {
  const { error } = await db.from(mod.table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Envia arquivo ao armazenamento e devolve um link de longa duração. */
export async function uploadFile(file: File, folder = String(new Date().getFullYear())): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("arquivos").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("arquivos").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar link");
  return data.signedUrl;
}

export const uploadAvatar = (file: File, userId: string) => uploadFile(file, `avatars/${userId}`);
