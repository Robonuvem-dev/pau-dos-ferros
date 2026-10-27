import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { Blob as NodeBlob } from "node:buffer";
import { discoverOfficialResources, formatOfficialCell } from "@/lib/atricon-official";
import { officialArchiveEntries, extractOfficialEntry } from "@/lib/atricon-zip.server";
import { parseOfficialFile } from "@/lib/atricon-file";
import { readLargeOfficialWorkbook } from "@/lib/atricon-xlsx";
const url =
  "https://radardatransparencia.atricon.org.br/dados/criterios_de_avaliacao_pntp_2026.zip";
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("Blob", NodeBlob);
});
afterEach(() => vi.unstubAllGlobals());
// Publicações obtidas da página oficial em 27/10/2026. Nenhum registro municipal foi criado para estas fixtures.
it("descobre os quatro pacotes históricos e a matriz vigente na página real", () => {
  const resources = discoverOfficialResources(
    readFileSync("src/test/fixtures/atricon-downloads-2026-10-27.html", "utf8"),
  );
  for (const year of [2025, 2024, 2023, 2022])
    expect(resources.some((r) => r.year === year && r.url.endsWith(`dados_pntp_${year}.zip`))).toBe(
      true,
    );
  expect(resources.some((r) => r.year === 2026 && r.url === url)).toBe(true);
});
it("extrai por intervalos a planilha real, verifica CRC e identifica os critérios oficiais", async () => {
  const zip = readFileSync("src/test/fixtures/atricon-criterios-2026.zip");
  const read = vi.fn(async (_url: unknown, init?: RequestInit) => {
    // Cloudflare rejeita redirect:error antes de iniciar a requisição.
    if (init?.redirect === "error") throw new TypeError("Invalid redirect value");
    expect(init?.redirect).toBe("manual");
    const value = new Headers(init?.headers).get("Range")!.replace("bytes=", "");
    const suffix = value.startsWith("-");
    const [a, b] = value.split("-").map(Number);
    const start = suffix ? Math.max(0, zip.length - Number(value.slice(1))) : a!;
    const end = suffix ? zip.length - 1 : Math.min(b!, zip.length - 1);
    return new Response(zip.subarray(start, end + 1), {
      status: 206,
      headers: {
        "content-range": `bytes ${start}-${end}/${zip.length}`,
        "content-length": String(end - start + 1),
      },
    });
  });
  const entries = await officialArchiveEntries(url, read as typeof fetch);
  expect(entries).toHaveLength(1);
  const entry = entries[0]!;
  const bytes = await extractOfficialEntry(url, entry, read as typeof fetch);
  expect(bytes.length).toBe(101454);
  const sha256 = Buffer.from(
    await crypto.subtle.digest("SHA-256", bytes.buffer as ArrayBuffer),
  ).toString("hex");
  expect(sha256).toBe("ac8f86e390105fa9444b51cfab6afced300544c0454f66401aefdd613410a038");
  const { imported } = await parseOfficialFile({
    resource: {
      year: 2026,
      url,
      label: entry.name,
      format: "xlsx",
      archiveEntry: entry.name,
      fetchable: true,
    },
    importedAt: "2026-10-27T12:00:00Z",
    sha256,
    bytes: bytes.length,
    base64: Buffer.from(bytes).toString("base64"),
  });
  expect(imported.criteria).toHaveLength(187);
  expect(imported.criteria).toContain("Possui sítio oficial próprio na internet?");
  expect(imported.sheets[0]?.rows.length).toBe(193);
  const filtered = await readLargeOfficialWorkbook(bytes, "sítio oficial");
  expect(filtered[0]?.sourceRows).toBe(194);
  expect(filtered[0]?.data.length).toBeGreaterThan(1);
  expect(filtered[0]?.data.length).toBeLessThan(194);
  expect(filtered[0]?.data[0]?.[3]).toBe("CRITÉRIO");
});
it("mostra percentuais e datas sem alterar valores de origem", () => {
  expect(formatOfficialCell("Índice de Transparência", "0.9585")).toBe("95,85%");
  expect(formatOfficialCell("% das Essenciais", "1")).toBe("100%");
  expect(formatOfficialCell("Data Envio", "2025-04-21T00:00:00.000Z")).toBe("21/04/2025");
  expect(formatOfficialCell("id_avaliacao", "25672")).toBe("25672");
});

it("recusa redirecionamentos de intervalos sem seguir outro destino ou baixar o arquivo inteiro", async () => {
  const cancel = vi.fn();
  const body = new ReadableStream({ cancel });
  const read = vi
    .fn()
    .mockResolvedValue(
      new Response(body, { status: 302, headers: { location: "https://127.0.0.1/private" } }),
    );
  await expect(officialArchiveEntries(url, read)).rejects.toThrow("redirecionou");
  expect(read).toHaveBeenCalledOnce();
  expect(read.mock.calls[0]![1].redirect).toBe("manual");
  expect(cancel).toHaveBeenCalledOnce();
});
