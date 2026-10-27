import { officialArchiveEntries, extractOfficialEntry } from "./atricon-zip.server";
import {
  ATRICON_DOWNLOADS,
  MAX_OFFICIAL_BYTES,
  discoverOfficialResources,
  isOfficialHost,
  type OfficialResource,
} from "./atricon-official";

async function readOfficial(url: string, limit: number, read: typeof fetch): Promise<Uint8Array> {
  let current = new URL(url);
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (!isOfficialHost(current))
      throw new Error("O download automático é restrito aos domínios oficiais da ATRICON.");
    const response = await read(current, {
      redirect: "manual",
      credentials: "omit",
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
      headers: { Accept: "*/*" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Redirecionamento oficial sem destino.");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error(`A fonte ATRICON respondeu HTTP ${response.status}.`);
    if (Number(response.headers.get("content-length")) > limit)
      throw new Error("Arquivo oficial acima do limite de 20 MB. Use o download na fonte.");
    if (!response.body) throw new Error("A fonte oficial retornou um arquivo vazio.");
    const reader = response.body.getReader(),
      chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > limit) throw new Error("Arquivo oficial acima do limite permitido.");
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
    if (!bytes) throw new Error("A fonte oficial retornou um arquivo vazio.");
    const result = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }
  throw new Error("A fonte excedeu o limite de redirecionamentos.");
}

export async function fetchOfficialCatalog(
  read: typeof fetch = fetch,
): Promise<OfficialResource[]> {
  const bytes = await readOfficial(ATRICON_DOWNLOADS, 2 * 1024 * 1024, read);
  const resources = discoverOfficialResources(new TextDecoder().decode(bytes));
  if (!resources.length)
    throw new Error(
      "A página oficial não apresentou arquivos anuais reconhecíveis. Abra a fonte e utilize um arquivo oficial baixado.",
    );
  const expanded: OfficialResource[] = [];
  // Os pacotes nacionais superam 300 MB. O índice permite selecionar uma planilha sem baixar todas as UFs.
  for (const resource of resources) {
    if (resource.format !== "zip" || !resource.fetchable) {
      expanded.push(resource);
      continue;
    }
    try {
      const entries = await officialArchiveEntries(resource.url, read);
      const supported = entries.filter((e) => /\.(?:xlsx|csv|json|pdf)$/i.test(e.name));
      if (!supported.length)
        throw new Error("O pacote não contém tabelas ou documentos reconhecidos.");
      for (const entry of supported)
        expanded.push({
          ...resource,
          label: `${resource.label} — ${entry.name.split("/").pop()}`,
          format: entry.name.split(".").at(-1)!.toLowerCase(),
          archiveEntry: entry.name,
          archiveBytes: entry.archiveBytes,
          memberBytes: entry.bytes,
          fetchable: entry.bytes <= MAX_OFFICIAL_BYTES && entry.compressed <= MAX_OFFICIAL_BYTES,
          ...(entry.bytes > MAX_OFFICIAL_BYTES
            ? {
                notice:
                  "Esta planilha ultrapassa 20 MB. Baixe o pacote original na fonte para análise externa.",
              }
            : {}),
        });
    } catch (e) {
      expanded.push({ ...resource, fetchable: false, notice: (e as Error).message });
    }
  }
  return expanded;
}

export async function fetchOfficialDownload(
  year: number,
  url: string,
  read: typeof fetch = fetch,
  archiveEntry?: string,
) {
  const catalog = await fetchOfficialCatalog(read);
  const resource = catalog.find(
    (r) => r.year === year && r.url === url && r.archiveEntry === archiveEntry,
  );
  if (!resource)
    throw new Error(
      "O arquivo não foi encontrado no catálogo oficial para o ciclo selecionado. Atualize a lista.",
    );
  if (!resource.fetchable)
    throw new Error(
      resource.notice ||
        "Este arquivo está em outro domínio. Faça o download na fonte oficial e abra o arquivo nesta página.",
    );
  let bytes: Uint8Array;
  if (resource.archiveEntry) {
    const entries = await officialArchiveEntries(resource.url, read);
    const entry = entries.find((e) => e.name === resource.archiveEntry);
    if (!entry) throw new Error("A planilha não está mais no pacote oficial. Atualize a lista.");
    bytes = await extractOfficialEntry(resource.url, entry, read);
  } else bytes = await readOfficial(resource.url, MAX_OFFICIAL_BYTES, read);
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer as ArrayBuffer);
  const sha256 = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  let base64 = "";
  for (let offset = 0; offset < bytes.length; offset += 24576)
    base64 += btoa(String.fromCharCode(...bytes.subarray(offset, offset + 24576)));
  return { resource, importedAt: new Date().toISOString(), sha256, bytes: bytes.length, base64 };
}
