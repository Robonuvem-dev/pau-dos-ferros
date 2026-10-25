import type { Field, ModuleDef } from "./modules";
export type NormalizedValue = string | number | boolean | null | string[];
export function normalizeField(f: Field, v: unknown): NormalizedValue {
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

export function initialValues(mod: ModuleDef): Record<string, unknown> {
 const v: Record<string, unknown> = {};
 for (const f of mod.fields) {
  if(f.type==="bool")v[f.name]=!["aprovada","maquina_obra"].includes(f.name);
  else if(f.type==="files")v[f.name]=[];
  else if (["aditivo_acrescimo","aditivo_supressao"].includes(f.name)) v[f.name]=0;
  else if(f.name==="ano")v[f.name]=Number(new Intl.DateTimeFormat("en",{year:"numeric",timeZone:"America/Fortaleza"}).format(new Date()));
  else v[f.name]="";
 }
 return v;
}
