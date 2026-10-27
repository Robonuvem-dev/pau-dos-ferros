import { inflateSync } from "fflate";
import { isOfficialHost, MAX_OFFICIAL_BYTES } from "./atricon-official";
export interface ArchiveEntry {
  name: string;
  compressed: number;
  bytes: number;
  offset: number;
  method: number;
  crc: number;
  archiveBytes: number;
}

async function range(url: string, value: string, limit: number, read: typeof fetch) {
  const target = new URL(url);
  if (!isOfficialHost(target)) throw new Error("Arquivo compactado fora da fonte oficial.");
  const response = await read(target, {
    redirect: "error",
    credentials: "omit",
    cache: "no-store",
    headers: { Range: `bytes=${value}`, "Accept-Encoding": "identity" },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status !== 206 && response.status !== 200)
    throw new Error(`A leitura parcial da publicação respondeu HTTP ${response.status}.`);
  const rangeHeader = response.headers.get("content-range")?.match(/^bytes (\d+)-(\d+)\/(\d+)$/i);
  const total = rangeHeader
    ? Number(rangeHeader[3])
    : Number(response.headers.get("content-length"));
  if (response.status === 200 && (!Number.isFinite(total) || !total || total > limit))
    throw new Error("A fonte não permitiu a leitura parcial deste pacote.");
  if (Number(response.headers.get("content-length")) > limit)
    throw new Error("Intervalo solicitado acima do limite permitido.");
  if (!response.body) throw new Error("Intervalo vazio na publicação oficial.");
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      size += chunk.length;
      if (size > limit) throw new Error("A fonte excedeu o intervalo solicitado.");
      chunks.push(chunk);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(size);
  let cursor = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, cursor);
    cursor += chunk.length;
  }
  const start = rangeHeader ? Number(rangeHeader[1]) : 0;
  if (rangeHeader && size !== Number(rangeHeader[2]) - start + 1)
    throw new Error("Intervalo incompleto na publicação oficial.");
  return { bytes, start, total };
}

export async function officialArchiveEntries(
  url: string,
  read: typeof fetch = fetch,
): Promise<ArchiveEntry[]> {
  const tail = await range(url, "-65557", 65557, read),
    view = new DataView(tail.bytes.buffer);
  let end = -1;
  for (let i = tail.bytes.length - 22; i >= 0; i--)
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  if (end < 0) throw new Error("Índice ZIP não encontrado na publicação.");
  const count = view.getUint16(end + 10, true),
    length = view.getUint32(end + 12, true),
    offset = view.getUint32(end + 16, true);
  if (count > 2000 || length > 2 * 1024 * 1024 || !length || offset === 0xffffffff)
    throw new Error("O índice do pacote excede os limites suportados.");
  const directory =
    offset >= tail.start && offset + length <= tail.start + tail.bytes.length
      ? tail.bytes.subarray(offset - tail.start, offset - tail.start + length)
      : (await range(url, `${offset}-${offset + length - 1}`, 2 * 1024 * 1024, read)).bytes;
  const dv = new DataView(directory.buffer, directory.byteOffset, directory.byteLength),
    entries: ArchiveEntry[] = [];
  let p = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > directory.length || dv.getUint32(p, true) !== 0x02014b50)
      throw new Error("Índice ZIP inválido.");
    const flags = dv.getUint16(p + 8, true),
      method = dv.getUint16(p + 10, true),
      crc = dv.getUint32(p + 16, true),
      compressed = dv.getUint32(p + 20, true),
      bytes = dv.getUint32(p + 24, true);
    const nameLength = dv.getUint16(p + 28, true),
      extraLength = dv.getUint16(p + 30, true),
      commentLength = dv.getUint16(p + 32, true),
      local = dv.getUint32(p + 42, true);
    if (p + 46 + nameLength + extraLength + commentLength > directory.length)
      throw new Error("Nome de arquivo incompleto no pacote.");
    const name = new TextDecoder().decode(directory.subarray(p + 46, p + 46 + nameLength));
    if (!name.endsWith("/") && !(flags & 1) && [0, 8].includes(method))
      entries.push({
        name,
        method,
        crc,
        compressed,
        bytes,
        offset: local,
        archiveBytes: tail.total,
      });
    p += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  return crc >>> 0;
});
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]!) & 255]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export async function extractOfficialEntry(
  url: string,
  entry: ArchiveEntry,
  read: typeof fetch = fetch,
): Promise<Uint8Array> {
  if (entry.bytes > MAX_OFFICIAL_BYTES || entry.compressed > MAX_OFFICIAL_BYTES)
    throw new Error("A planilha excede o limite de 20 MB. Baixe o pacote original na fonte.");
  const header = await range(url, `${entry.offset}-${entry.offset + 29}`, 30, read);
  if (header.start !== entry.offset || header.bytes.length !== 30)
    throw new Error("A fonte não respeitou o intervalo do arquivo.");
  const local = new DataView(header.bytes.buffer);
  if (local.getUint32(0, true) !== 0x04034b50) throw new Error("Cabeçalho ZIP inválido.");
  const start = entry.offset + 30 + local.getUint16(26, true) + local.getUint16(28, true);
  const content = await range(
    url,
    `${start}-${start + entry.compressed - 1}`,
    MAX_OFFICIAL_BYTES,
    read,
  );
  if (content.start !== start || content.bytes.length !== entry.compressed)
    throw new Error("Conteúdo ZIP incompleto.");
  const bytes =
    entry.method === 0
      ? content.bytes
      : inflateSync(content.bytes, { out: new Uint8Array(entry.bytes) });
  if (bytes.length !== entry.bytes || crc32(bytes) !== entry.crc)
    throw new Error("A integridade da planilha do pacote não foi confirmada.");
  return bytes;
}
