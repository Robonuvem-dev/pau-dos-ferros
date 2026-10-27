import { describe, expect, it, vi } from "vitest";
import { discoverTce, mapTceRows, tceTables, tceUrl, TCE_ORIGIN } from "@/lib/tce";
import { queryTce, readTce } from "@/lib/tce.server";
// Synthetic Swagger fixture tests the protocol, not the live provider's unverified schema.
const spec = {
  basePath: "/api",
  paths: {
    "/Credor/{ano}": {
      get: {
        tags: ["Credor"],
        parameters: [
          { name: "ano", in: "path", type: "integer", required: true },
          { name: "unidade", in: "query", required: true },
        ],
      },
    },
    "/write": { post: {} },
  },
};
describe("TCE official import", () => {
  it("discovers GET and validates documented parameters", () => {
    const endpoints = discoverTce(spec);
    expect(endpoints).toHaveLength(1);
    expect(() => tceUrl(endpoints[0]!, { ano: "2025" }, "/api")).toThrow("unidade");
    expect(tceUrl(endpoints[0]!, { ano: "2025", unidade: "1 & 2" }, "/api").href).toBe(
      `${TCE_ORIGIN}/api/Credor/2025?unidade=1+%26+2`,
    );
    expect(() => tceUrl(endpoints[0]!, { ano: "../", unidade: "1" })).toThrow();
  });
  it("rejects redirects without following them (edge compatible)", async () => {
    const read = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 302, headers: { location: "http://127.0.0.1/" } }),
      );
    await expect(readTce(new URL("/api", TCE_ORIGIN), read)).rejects.toThrow("302");
    expect(read).toHaveBeenCalledTimes(1);
    expect(read.mock.calls[0]![1].redirect).toBe("manual");
    await expect(readTce(new URL("https://example.org"), read)).rejects.toThrow("permitida");
  });
  it("revalidates endpoint against live catalog and preserves raw values", async () => {
    const payload = { Items: [{ Id: "001", Nome: "Entidade oficial", Valor: 1.25 }], Total: 1 };
    const read = vi
      .fn()
      .mockResolvedValueOnce(Response.json(spec))
      .mockResolvedValueOnce(Response.json(payload));
    const result = await queryTce("/Credor/{ano}", { ano: "2025", unidade: "1" }, read);
    expect(result.data).toEqual(payload);
    expect(result.tables["Resposta.Items"]).toEqual(payload.Items);
    expect(read.mock.calls[1]![0].href).toBe(`${TCE_ORIGIN}/api/Credor/2025?unidade=1`);
  });
  it("rejects unknown endpoint and invalid provider response", async () => {
    await expect(
      queryTce("/private", {}, vi.fn().mockResolvedValue(Response.json(spec))),
    ).rejects.toThrow("Endpoint");
    await expect(
      readTce(new URL("/api", TCE_ORIGIN), vi.fn().mockResolvedValue(new Response("<html>"))),
    ).rejects.toThrow("JSON");
    expect(tceTables({ Items: [] })).toEqual({ "Resposta.Items": [] });
  });
  it("maps only selected real fields, validates requirements and stable identities", () => {
    const rows = [{ Id: "001", Nome: "Fornecedor oficial" }];
    expect(mapTceRows("credores", rows, { nome: "Nome", chave_externa: "Id" })).toEqual([
      { nome: "Fornecedor oficial", chave_externa: "tce-credores-001" },
    ]);
    expect(() =>
      mapTceRows("agentes-politicos", rows, { nome: "Nome", chave_externa: "Id" }),
    ).toThrow("cargo");
    expect(() =>
      mapTceRows("credores", [...rows, ...rows], { nome: "Nome", chave_externa: "Id" }),
    ).toThrow("repetido");
  });
});
