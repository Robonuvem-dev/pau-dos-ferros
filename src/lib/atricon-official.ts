import { normalizeHeader } from "./csv";
import { parseLocalizedNumber } from "./formatting";
export const ATRICON_DOWNLOADS = "https://radardatransparencia.atricon.org.br/downloads.html";
export const ATRICON_YEARS = [2025, 2024, 2023, 2022];
export const MAX_OFFICIAL_BYTES = 20 * 1024 * 1024;
export interface OfficialResource {
  year: number;
  url: string;
  label: string;
  format: string;
  fetchable: boolean;
  provenance?: "catalog" | "manual";
  archiveEntry?: string;
  archiveBytes?: number;
  memberBytes?: number;
  notice?: string;
}
export interface OfficialDownload {
  resource: OfficialResource;
  importedAt: string;
  sha256: string;
  bytes: number;
  base64: string;
}
export interface OfficialSheet {
  name: string;
  headers: string[];
  rows: string[][];
  preamble?: string[][];
}
export interface OfficialImport extends Omit<OfficialDownload, "base64"> {
  sheets: OfficialSheet[];
  documents: { name: string; type: string; bytes: number }[];
  criteria: string[];
  importFilter?: string;
  sourceRows?: number;
}

export function isOfficialHost(url: URL): boolean {
  return (
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    !url.port &&
    (url.hostname === "atricon.org.br" || url.hostname.endsWith(".atricon.org.br"))
  );
}
const decode = (s: string) =>
  s.replace(/&(?:amp|quot|apos|nbsp|#39|#x([\da-f]+)|#(\d+));/gi, (m, hex, decimal) => {
    if (hex || decimal)
      return String.fromCodePoint(Math.min(0x10ffff, parseInt(hex || decimal, hex ? 16 : 10)));
    return (
      (
        { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&#39;": "'", "&nbsp;": " " } as Record<
          string,
          string
        >
      )[m.toLowerCase()] ?? m
    );
  });
const plain = (s: string) =>
  decode(s.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

/** Os endereços vêm da publicação oficial; não há nomes de arquivos anuais presumidos. */
export function discoverOfficialResources(html: string): OfficialResource[] {
  const clean = html.replace(
    /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi,
    "",
  );
  const resources = new Map<string, OfficialResource>();
  const links = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of clean.matchAll(links)) {
    let url: URL;
    try {
      url = new URL(decode(match[1] ?? match[2] ?? match[3] ?? ""), ATRICON_DOWNLOADS);
    } catch {
      continue;
    }
    if (url.protocol !== "https:" || url.username || url.password) continue;
    const extension = decodeURIComponent(url.pathname)
      .match(/\.(xlsx|xls|csv|json|zip|pdf)$/i)?.[1]
      ?.toLowerCase();
    if (!extension) continue;
    const label =
      plain(match[4] ?? "") ||
      decodeURIComponent(url.pathname.split("/").pop() ?? "Arquivo oficial");
    const direct =
      `${label} ${decodeURIComponent(url.pathname)}`.match(/(?<!\d)20\d{2}(?!\d)/g) ?? [];
    const nearby =
      plain(clean.slice(Math.max(0, (match.index ?? 0) - 1200), match.index)).match(
        /(?<!\d)20\d{2}(?!\d)/g,
      ) ?? [];
    const year = Number(direct[0] ?? nearby.at(-1));
    if (!Number.isInteger(year) || year < 2022 || year > new Date().getFullYear() + 1) continue;
    url.hash = "";
    resources.set(`${year}:${url.href}`, {
      year,
      url: url.href,
      label,
      format: extension,
      fetchable: isOfficialHost(url),
    });
  }
  return [...resources.values()].sort(
    (a, b) => b.year - a.year || a.label.localeCompare(b.label, "pt-BR"),
  );
}

export function officialReference(imported: OfficialImport): string {
  return [
    `Referência oficial ATRICON — ciclo ${imported.resource.year}`,
    `Publicação: ${imported.resource.label}`,
    `Origem: ${imported.resource.provenance === "manual" ? "arquivo fornecido pelo operador; catálogo não confirmado" : "arquivo localizado no catálogo oficial"}`,
    `Catálogo: ${ATRICON_DOWNLOADS}`,
    `Arquivo: ${imported.resource.url}`,
    ...(imported.resource.archiveEntry
      ? [`Planilha no pacote: ${imported.resource.archiveEntry}`]
      : []),
    `Importado em: ${imported.importedAt}; SHA-256: ${imported.sha256}`,
    `Conteúdo: ${imported.sheets.length} tabelas; ${imported.sheets.reduce((sum, s) => sum + s.rows.length, 0)} registros; ${imported.criteria.length} descrições de critérios identificadas.`,
    ...(imported.importFilter
      ? [
          `Filtro de importação: ${imported.importFilter}; registros da fonte: ${imported.sourceRows ?? "não contabilizados"}`,
        ]
      : []),
    "Resultados históricos são referências da publicação de origem e não homologam o portal atual.",
  ].join("\n");
}

export function officialResourceKey(resource: OfficialResource): string {
  return (
    resource.url + (resource.archiveEntry ? "#" + encodeURIComponent(resource.archiveEntry) : "")
  );
}

export function formatOfficialCell(header: string, value: string): string {
  const key = normalizeHeader(header);
  if (
    (key.includes("data") || key.includes("atualizacao")) &&
    /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)
  )
    return value.slice(0, 10).split("-").reverse().join("/");
  if (
    header.trim().startsWith("%") ||
    key.includes("indice_de_transparencia") ||
    key.includes("indice_transparencia") ||
    key.startsWith("percentual")
  ) {
    const n = parseLocalizedNumber(value);
    if (n !== null)
      return Math.abs(n) <= 1
        ? n.toLocaleString("pt-BR", { style: "percent", maximumFractionDigits: 2 })
        : n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
  }
  return value || "—";
}
