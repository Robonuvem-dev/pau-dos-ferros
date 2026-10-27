import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { ATRICON_DOWNLOADS, discoverOfficialResources } from "@/lib/atricon-official";
import { fetchOfficialCatalog, fetchOfficialDownload } from "@/lib/atricon-download.server";

// Estrutura de teste para o leitor de catálogo; não é uma cópia da publicação oficial.
const html = `<h2>Ciclo 2025</h2><a href="/arquivos/resultados-2025.csv">Resultados 2025</a>
<h2>2024</h2><a href="./arquivos/base.xlsx">Base anual</a>
<h2>2023</h2><a href="https://atricon.org.br/base-2023.json?origem=radar&amp;download=1">Dados 2023</a>
<h2>2022</h2><a href="/arquivos/cartilha-2022.pdf">Cartilha 2022</a>
<a href="http://localhost/2025.csv">Não permitido</a><a href="https://docs.example.org/2025.xlsx">Publicação externa 2025</a>`;
beforeEach(() => vi.stubGlobal("crypto", webcrypto));
afterEach(() => vi.unstubAllGlobals());
describe("catálogo oficial ATRICON", () => {
  it("localiza arquivos por ano, resolve caminhos e mantém domínios externos sem autorizar downloads", () => {
    const files = discoverOfficialResources(html);
    expect(new Set(files.map((f) => f.year))).toEqual(new Set([2025, 2024, 2023, 2022]));
    expect(files.find((f) => f.year === 2024)?.url).toBe(
      "https://radardatransparencia.atricon.org.br/arquivos/base.xlsx",
    );
    expect(files.find((f) => f.format === "json")?.url).toContain("&download=1");
    expect(files.find((f) => f.url.startsWith("https://docs."))?.fetchable).toBe(false);
    expect(files.some((f) => f.url.includes("localhost"))).toBe(false);
  });
  it("recusa catálogo vazio e erros da fonte, sem criar arquivos presumidos", async () => {
    await expect(
      fetchOfficialCatalog(vi.fn().mockResolvedValue(new Response("bloqueado", { status: 403 }))),
    ).rejects.toThrow("403");
    await expect(
      fetchOfficialCatalog(vi.fn().mockResolvedValue(new Response("<html>Indisponível</html>"))),
    ).rejects.toThrow("não apresentou");
  });
  it("só baixa URLs presentes na publicação do ano solicitado e calcula integridade", async () => {
    const read = vi
      .fn()
      .mockResolvedValueOnce(new Response(html))
      .mockResolvedValueOnce(new Response("Órgão;Índice\nMunicípio de referência;87,5"));
    const url = "https://radardatransparencia.atricon.org.br/arquivos/resultados-2025.csv";
    const file = await fetchOfficialDownload(2025, url, read);
    expect(file.resource.url).toBe(url);
    expect(file.resource.year).toBe(2025);
    expect(file.sha256).toMatch(/^[a-f\d]{64}$/);
    expect(Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0)).length).toBe(file.bytes);
    expect(read).toHaveBeenCalledTimes(2);
    expect(String(read.mock.calls[0]![0])).toBe(ATRICON_DOWNLOADS);
  });
  it("não permite trocar URL ou ano e não segue redirecionamentos para redes privadas", async () => {
    const read = vi.fn().mockResolvedValue(new Response(html));
    await expect(
      fetchOfficialDownload(
        2024,
        "https://radardatransparencia.atricon.org.br/arquivos/resultados-2025.csv",
        read,
      ),
    ).rejects.toThrow("não foi encontrado");
    expect(read).toHaveBeenCalledOnce();
    const redirect = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 302, headers: { location: "https://127.0.0.1/secret" } }),
      );
    await expect(fetchOfficialCatalog(redirect)).rejects.toThrow("domínios oficiais");
    expect(redirect).toHaveBeenCalledOnce();
  });
  it("recusa arquivos excessivos mesmo quando o cabeçalho informa um tamanho pequeno", async () => {
    const read = vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(2 * 1024 * 1024 + 1));
            controller.close();
          },
        }),
        { headers: { "content-length": "1" } },
      ),
    );
    await expect(fetchOfficialCatalog(read)).rejects.toThrow("limite");
  });
});
