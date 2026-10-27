import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { Blob as NodeBlob } from "node:buffer";
import { listAtriconImports, saveAtriconImport } from "@/lib/atricon-storage";
import type { OfficialImport } from "@/lib/atricon-official";

beforeEach(() => {
  vi.stubGlobal("indexedDB", new IDBFactory());
  vi.stubGlobal("Blob", NodeBlob);
});
afterEach(() => vi.unstubAllGlobals());
const data = (year: number): OfficialImport => ({
  resource: {
    year,
    url: `https://radardatransparencia.atricon.org.br/base-${year}.csv`,
    label: "Publicação de referência",
    format: "csv",
    fetchable: true,
  },
  importedAt: `2026-10-${year === 2025 ? "27" : "26"}T12:00:00Z`,
  sha256: "a".repeat(64),
  bytes: 3,
  sheets: [{ name: "Dados", headers: ["Órgão"], rows: [["Registro de referência"]] }],
  documents: [],
  criteria: [],
});
it("preserva conteúdo e original por ciclo sem duplicar o mesmo arquivo", async () => {
  await saveAtriconImport(data(2025), new Blob(["ABC"]));
  await saveAtriconImport(data(2024), new Blob(["DEF"]));
  await saveAtriconImport(data(2025), new Blob(["ABC"]));
  const stored = await listAtriconImports();
  expect(stored).toHaveLength(2);
  expect(stored[0]?.imported.resource.year).toBe(2025);
  expect(stored[0]?.imported.sheets[0]?.rows).toEqual([["Registro de referência"]]);
  expect(await stored[0]?.original.text()).toBe("ABC");
});
