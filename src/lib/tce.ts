import { prepararImportacao, IMPORT_COLUNAS } from "./importacao";
export const TCE_ORIGIN = "https://apidadosabertos.tce.rn.gov.br";
export type TceParameter = {
  name: string;
  location: "query" | "path";
  required: boolean;
  type: string;
  description: string;
  options?: string[] | undefined;
};
export type TceEndpoint = { path: string; label: string; parameters: TceParameter[] };
export function discoverTce(spec: unknown): TceEndpoint[] {
  const doc = spec as {
    paths?: Record<
      string,
      {
        parameters?: TceParameter[];
        get?: {
          summary?: string;
          tags?: string[];
          parameters?: {
            name: string;
            in: string;
            required?: boolean;
            type?: string;
            description?: string;
            enum?: unknown[];
          }[];
        };
      }
    >;
  };
  if (!doc?.paths) throw new Error("O TCE não retornou uma especificação Swagger válida.");
  return Object.entries(doc.paths).flatMap(([path, item]) => {
    const op = item.get;
    if (!op || !path.startsWith("/") || path.startsWith("//") || /[?#\\]/.test(path)) return [];
    const params = [...(item.parameters ?? []), ...(op.parameters ?? [])] as {
      name: string;
      in?: string;
      required?: boolean;
      type?: string;
      description?: string;
      enum?: unknown[];
      $ref?: string;
    }[];
    if (params.some((p) => p.$ref || !["query", "path"].includes(p.in ?? ""))) return [];
    return [
      {
        path,
        label: [op.tags?.join(" / "), op.summary, path].filter(Boolean).join(" — "),
        parameters: params.map((p) => ({
          name: p.name,
          location: p.in as "query" | "path",
          required: Boolean(p.required || p.in === "path"),
          type: p.type ?? "string",
          description: p.description ?? "",
          options: p.enum?.map(String),
        })),
      },
    ];
  });
}
export function tceUrl(endpoint: TceEndpoint, values: Record<string, string>, basePath = "") {
  let path = endpoint.path;
  for (const p of endpoint.parameters) {
    const value = values[p.name]?.trim() ?? "";
    if (p.required && !value) throw new Error(`Preencha ${p.name}.`);
    if (value && p.options && !p.options.includes(value))
      throw new Error(`Opção inválida: ${p.name}.`);
    if (
      value &&
      ["integer", "number"].includes(p.type) &&
      (!Number.isFinite(Number(value)) || (p.type === "integer" && !/^-?\d+$/.test(value)))
    )
      throw new Error(`Número inválido: ${p.name}.`);
    if (p.location === "path") {
      if (/[./\\]/.test(value)) throw new Error("Parâmetro de caminho inválido.");
      path = path.replaceAll(`{${p.name}}`, encodeURIComponent(value));
    }
  }
  if (path.includes("{")) throw new Error("Parâmetro de caminho não resolvido.");
  const url = new URL(`${basePath.replace(/\/$/, "")}${path}`, TCE_ORIGIN);
  if (url.origin !== TCE_ORIGIN) throw new Error("Origem TCE inválida.");
  for (const p of endpoint.parameters)
    if (p.location === "query" && values[p.name]?.trim())
      url.searchParams.set(p.name, values[p.name]!.trim());
  return url;
}
export function tceTables(data: unknown): Record<string, Record<string, unknown>[]> {
  const tables: Record<string, Record<string, unknown>[]> = {};
  function visit(value: unknown, name: string, depth: number) {
    if (depth > 5 || !value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      if (value.every((r) => r && typeof r === "object" && !Array.isArray(r)))
        tables[name] = value as Record<string, unknown>[];
      return;
    }
    for (const [k, v] of Object.entries(value)) visit(v, `${name}.${k}`, depth + 1);
  }
  visit(data, "Resposta", 0);
  if (!Object.keys(tables).length && data && typeof data === "object" && !Array.isArray(data))
    tables.Resposta = [data as Record<string, unknown>];
  return tables;
}
export function mapTceRows(
  modulo: string,
  rows: Record<string, unknown>[],
  map: Record<string, string>,
) {
  const columns = (IMPORT_COLUNAS[modulo] ?? []).filter((c) => map[c]);
  const quote = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return prepararImportacao(
    modulo,
    [
      columns.join(";"),
      ...rows.map((r) =>
        columns
          .map((c) => {
            const v = r[map[c]!];
            if (v !== null && typeof v === "object")
              throw new Error("Mapeie apenas valores simples, sem objetos ou listas.");
            // Identidade oficial estável, separada por cadastro. Nunca usa o índice da prévia.
            return quote(c === "chave_externa" ? `tce-${modulo}-${v ?? ""}` : v);
          })
          .join(";"),
      ),
    ].join("\n"),
  );
}
