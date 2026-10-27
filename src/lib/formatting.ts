import type { Field } from "./modules";

export type FieldMask =
  | "cpf"
  | "cnpj"
  | "document"
  | "phone"
  | "cep"
  | "plate"
  | "money"
  | "decimal"
  | "percent"
  | "month";
export function fieldMask(f: Pick<Field, "name" | "label" | "type">): FieldMask | undefined {
  if (f.type === "money") return "money";
  if (f.name === "percentual") return "percent";
  if (f.type === "number") return "decimal";
  if (f.name === "cpf_cnpj" || /cpf.*cnpj|cnpj.*cpf/i.test(f.label)) return "document";
  if (f.name === "cnpj") return "cnpj";
  if (f.name === "cpf") return "cpf";
  if (/^(telefone|celular|whatsapp)$/.test(f.name)) return "phone";
  if (f.name === "cep") return "cep";
  if (f.name === "placa") return "plate";
  if (f.name === "competencia") return "month";
  return undefined;
}
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
function pattern(value: string, template: string) {
  let i = 0,
    result = "";
  for (const c of template) {
    if (i >= value.length) break;
    result += c === "#" ? value[i++] : c;
  }
  return result;
}
export function maskText(mask: FieldMask, value: unknown): string {
  const s = String(value ?? "");
  const d = digits(s);
  switch (mask) {
    case "cpf":
      return pattern(d.slice(0, 11), "###.###.###-##");
    case "cnpj":
      return pattern(
        s
          .replace(/[^a-z0-9]/gi, "")
          .toUpperCase()
          .slice(0, 14),
        "##.###.###/####-##",
      );
    case "document":
      return s.replace(/\W/g, "").length > 11 ? maskText("cnpj", s) : maskText("cpf", s);
    case "phone": {
      const international = s.startsWith("+");
      const country = international && d.startsWith("55");
      if (international && !country) return "+" + d.slice(0, 15);
      const local = country ? d.slice(2) : d;
      const formatted = pattern(
        local.slice(0, 11),
        local.length > 10 ? "(##) #####-####" : "(##) ####-####",
      );
      return country ? "+55 " + formatted : formatted;
    }
    case "cep":
      return pattern(d.slice(0, 8), "#####-###");
    case "plate": {
      const p = s
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 7);
      return /^\w{3}\d{4}$/.test(p) ? p.slice(0, 3) + "-" + p.slice(3) : p;
    }
    default:
      return s;
  }
}
/** Aceita números do banco e decimais pt-BR, inclusive valores copiados com R$. */
export function parseLocalizedNumber(value: unknown): number | null {
  if (value == null || String(value).trim() === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const s = String(value).replace(/R\$|%|\s|\u00a0/g, "");
  if (!/^-?[\d.,]+$/.test(s)) return null;
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? n : null;
}
export function formattedNumber(value: unknown, money = false): string {
  const n = parseLocalizedNumber(value);
  if (n === null) return value == null || value === "" ? "—" : String(value);
  return n.toLocaleString(
    "pt-BR",
    money ? { style: "currency", currency: "BRL" } : { maximumFractionDigits: 10 },
  );
}
export function formatMaskedValue(mask: FieldMask, value: unknown): string {
  if (value == null || value === "") return "—";
  if (mask === "money") return formattedNumber(value, true);
  if (mask === "decimal") return formattedNumber(value);
  if (mask === "percent") return formattedNumber(value) + "%";
  if (mask === "month") return String(value).replace(/^(\d{4})-(\d{2})$/, "$2/$1");
  // Preserve existing redacted documents and descriptive legacy contacts.
  const s = String(value);
  if (s.includes("*")) return s;
  const alphanumericCnpj =
    mask === "document" &&
    /^[A-Z0-9]{12}\d{2}$/i.test(s.replaceAll(".", "").replaceAll("/", "").replaceAll("-", ""));
  if (["cpf", "document", "phone", "cep"].includes(mask) && /[a-z]/i.test(s) && !alphanumericCnpj)
    return s;
  return maskText(mask, value);
}
