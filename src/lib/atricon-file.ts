import { unzipSync } from "fflate";
import { parseCSV, normalizeHeader } from "./csv";
import {
  MAX_OFFICIAL_BYTES,
  type OfficialDownload,
  type OfficialImport,
  type OfficialSheet,
} from "./atricon-official";

const MAX_EXPANDED = 256 * 1024 * 1024,
  MAX_ROWS = 300_000,
  MAX_CELLS = 8_000_000;
function inspectZip(bytes: Uint8Array) {
  let expanded = 0,
    count = 0;
  unzipSync(bytes, {
    filter: (file) => {
      expanded += file.originalSize;
      count++;
      if (expanded > MAX_EXPANDED || count > 2000)
        throw new Error("Arquivo compactado excede o limite seguro de leitura.");
      return false;
    },
  });
  return expanded;
}
const cell = (value: unknown): string =>
  value instanceof Date
    ? value.toISOString()
    : value == null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
function table(name: string, input: unknown[][]): OfficialSheet {
  const rows = input.map((r) => r.map(cell)).filter((r) => r.some((v) => v.trim()));
  if (!rows.length) return { name, headers: [], rows: [] };
  const headerIndex = Math.max(
    0,
    rows.findIndex((r) => r.filter((v) => v.trim()).length >= 2),
  );
  const raw = rows[headerIndex]!,
    width = rows.reduce((max, r) => Math.max(max, r.length), 0);
  if (width > 500 || rows.length > MAX_ROWS || width * rows.length > MAX_CELLS)
    throw new Error(
      "A tabela excede o limite de leitura no navegador. Baixe o arquivo original para análise externa.",
    );
  const seen = new Map<string, number>();
  const headers = Array.from({ length: width }, (_, i) => {
    const label = raw[i]?.trim() || `Coluna ${i + 1}`,
      n = (seen.get(label) ?? 0) + 1;
    seen.set(label, n);
    return n > 1 ? `${label} (${n})` : label;
  });
  return {
    name,
    headers,
    rows: rows.slice(headerIndex + 1).map((r) => headers.map((_, i) => r[i] ?? "")),
    preamble: rows.slice(0, headerIndex),
  };
}
function jsonTables(value: unknown, name: string): OfficialSheet[] {
  if (Array.isArray(value)) {
    if (!value.length) return [];
    if (value.every((v) => Array.isArray(v))) return [table(name, value as unknown[][])];
    if (value.every((v) => v && typeof v === "object" && !Array.isArray(v))) {
      const fields = [...new Set(value.flatMap((row) => Object.keys(row)))];
      return [table(name, [fields, ...value.map((row) => fields.map((f) => row[f]))])];
    }
    return [table(name, [["Valor"], ...value.map((v) => [v])])];
  }
  if (value && typeof value === "object") {
    const arrays = Object.entries(value).filter(([, v]) => Array.isArray(v));
    if (arrays.length) return arrays.flatMap(([key, v]) => jsonTables(v, `${name} / ${key}`));
    return [table(name, [["Campo", "Valor"], ...Object.entries(value)])];
  }
  throw new Error("O JSON não contém registros ou campos estruturados.");
}
export function criteriaFromSheets(sheets: OfficialSheet[]): string[] {
  const found = new Set<string>();
  for (const sheet of sheets) {
    const candidates = sheet.headers
      .map((h, i) => ({ h: normalizeHeader(h), i }))
      .filter(({ h }) =>
        /^(?:descricao_(?:do_)?criterio|criterio_texto|texto_criterio|criterio|pergunta|quesito|indicador)$/.test(
          h,
        ),
      );
    for (const row of sheet.rows)
      for (const { i } of candidates) {
        const text = row[i]?.trim() ?? "";
        if (text.length >= 15 && text.length <= 2000 && !/^\d+[.,]?\d*$/.test(text))
          found.add(text);
      }
  }
  return [...found];
}
export async function parseOfficialFile(
  download: OfficialDownload,
  importFilter = "",
): Promise<{ imported: OfficialImport; original: Blob }> {
  if (download.bytes > MAX_OFFICIAL_BYTES) throw new Error("Arquivo acima de 20 MB.");
  const binary = atob(download.base64),
    bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  if (bytes.length !== download.bytes) throw new Error("O tamanho do download está inconsistente.");
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer);
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hash !== download.sha256)
    throw new Error("A integridade do download não foi confirmada. Importe novamente.");
  const sheets: OfficialSheet[] = [],
    documents: OfficialImport["documents"] = [];
  let sourceRows = 0;
  const parse = async (data: Uint8Array, name: string, format: string) => {
    if (format === "xlsx") {
      const expanded = inspectZip(data);
      if (expanded > 32 * 1024 * 1024 || importFilter.trim()) {
        const { readLargeOfficialWorkbook } = await import("./atricon-xlsx");
        const workbook = await readLargeOfficialWorkbook(data, importFilter);
        sourceRows += workbook.reduce((sum, s) => sum + Math.max(0, s.sourceRows - 1), 0);
        sheets.push(...workbook.map((s) => table(`${name} / ${s.sheet}`, s.data)));
      } else {
        const { default: readXlsx } = await import("read-excel-file/universal");
        const workbook = await readXlsx(
          data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
        );
        sourceRows += workbook.reduce((sum, s) => sum + Math.max(0, s.data.length - 1), 0);
        sheets.push(...workbook.map((s) => table(`${name} / ${s.sheet}`, s.data)));
      }
    } else if (format === "csv") {
      let text: string;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(data);
      } catch {
        text = new TextDecoder("windows-1252").decode(data);
      }
      if (/^\s*<(?:!doctype|html)\b/i.test(text))
        throw new Error("A fonte retornou uma página HTML em vez do arquivo CSV.");
      sheets.push(table(name, parseCSV(text)));
    } else if (format === "json")
      sheets.push(...jsonTables(JSON.parse(new TextDecoder().decode(data)), name));
    else if (format === "pdf") {
      if (new TextDecoder().decode(data.subarray(0, 5)) !== "%PDF-")
        throw new Error("O arquivo retornado não é um PDF válido.");
      documents.push({ name, type: "application/pdf", bytes: data.length });
    } else if (format === "xls")
      throw new Error(
        "Planilha XLS antiga: converta o arquivo oficial para XLSX ou CSV antes de abrir.",
      );
    else documents.push({ name, type: format || "arquivo", bytes: data.length });
  };
  const format = download.resource.format;
  if (format === "zip") {
    inspectZip(bytes);
    const entries = unzipSync(bytes);
    for (const [name, data] of Object.entries(entries)) {
      if (name.endsWith("/")) continue;
      const ext = name.split(".").at(-1)?.toLowerCase() ?? "";
      await parse(data, name, ext);
    }
  } else await parse(bytes, download.resource.label, format);
  if (
    sheets.reduce((sum, s) => sum + s.rows.length, 0) > MAX_ROWS ||
    sheets.reduce((sum, s) => sum + s.rows.length * s.headers.length, 0) > MAX_CELLS
  )
    throw new Error("A publicação contém registros demais para análise no navegador.");
  if (!sheets.length && !documents.length)
    throw new Error("O arquivo não contém tabelas ou documentos para leitura.");
  if (!sourceRows) sourceRows = sheets.reduce((sum, s) => sum + s.rows.length, 0);
  const normalized = importFilter
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (normalized)
    for (const sheet of sheets)
      sheet.rows = sheet.rows.filter((row) =>
        row.some((value) =>
          value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(normalized),
        ),
      );
  const { base64: _, ...metadata } = download;
  return {
    imported: {
      ...metadata,
      sheets,
      documents,
      criteria: criteriaFromSheets(sheets),
      sourceRows,
      ...(importFilter.trim() ? { importFilter: importFilter.trim() } : {}),
    },
    original: new Blob([bytes.buffer], {
      type: format === "pdf" ? "application/pdf" : "application/octet-stream",
    }),
  };
}

export async function officialDocumentBlob(
  original: Blob,
  format: string,
  name: string,
): Promise<Blob> {
  if (format === "pdf") return original;
  const bytes = new Uint8Array(await original.arrayBuffer());
  inspectZip(bytes);
  const entries = unzipSync(bytes, { filter: (file) => file.name === name });
  const data = entries[name];
  if (!data || new TextDecoder().decode(data.subarray(0, 5)) !== "%PDF-")
    throw new Error("Documento PDF indisponível.");
  return new Blob([data.buffer as ArrayBuffer], { type: "application/pdf" });
}
