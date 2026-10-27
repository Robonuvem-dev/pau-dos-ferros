import { discoverTce, TCE_ORIGIN, tceUrl, tceTables } from "./tce";
export async function readTce(url: URL, read: typeof fetch = fetch) {
  if (url.origin !== TCE_ORIGIN) throw new Error("Origem TCE não permitida.");
  const response = await read(url, {
    redirect: "manual",
    credentials: "omit",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`TCE indisponível (HTTP ${response.status}). Nenhum registro foi incluído.`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Resposta vazia do TCE.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > 8_000_000)
        throw new Error("Resposta acima de 8 MB. Restrinja os parâmetros ou a página da consulta.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new Error("O TCE retornou conteúdo que não é JSON válido.");
  }
}
export async function tceCatalog(read: typeof fetch = fetch) {
  const spec = await readTce(new URL("/swagger/docs/v1", TCE_ORIGIN), read);
  const basePath = (spec as { basePath?: string }).basePath ?? "";
  if (
    basePath &&
    (!basePath.startsWith("/") || basePath.startsWith("//") || /[?#\\{}]/.test(basePath))
  )
    throw new Error("Caminho base do Swagger inválido.");
  return { endpoints: discoverTce(spec), basePath };
}
export async function queryTce(
  path: string,
  parameters: Record<string, string>,
  read: typeof fetch = fetch,
) {
  const catalog = await tceCatalog(read);
  const endpoint = catalog.endpoints.find((e) => e.path === path);
  if (!endpoint) throw new Error("Endpoint não encontrado no Swagger oficial.");
  const url = tceUrl(endpoint, parameters, catalog.basePath);
  const data = await readTce(url, read);
  return { url: url.href, downloadedAt: new Date().toISOString(), tables: tceTables(data), data };
}
