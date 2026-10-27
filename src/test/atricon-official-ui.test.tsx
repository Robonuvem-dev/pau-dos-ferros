import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { webcrypto } from "node:crypto";
import { Blob as NodeBlob } from "node:buffer";
import { IDBFactory } from "fake-indexeddb";
import { AtriconOfficialData } from "@/components/admin/AtriconOfficialData";
import type { OfficialDownload } from "@/lib/atricon-official";
const mocks = vi.hoisted(() => ({ catalog: vi.fn(), download: vi.fn() }));
vi.mock("@/lib/atricon-official.functions", () => ({
  getAtriconCatalog: mocks.catalog,
  importAtriconPublication: mocks.download,
}));
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("Blob", NodeBlob);
  vi.stubGlobal("indexedDB", new IDBFactory());
  mocks.catalog.mockReset();
  mocks.download.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const resource = {
  year: 2025,
  url: "https://radardatransparencia.atricon.org.br/2025.csv",
  label: "Resultados do ciclo",
  format: "csv",
  fetchable: true,
};
function boot(onReference = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AtriconOfficialData onReference={onReference} />
    </QueryClientProvider>,
  );
  return onReference;
}
async function download(): Promise<OfficialDownload> {
  const bytes = new TextEncoder().encode("Órgão;Índice\nRegistro de referência;87,5");
  return {
    resource,
    importedAt: "2026-10-27T12:00:00Z",
    sha256: Buffer.from(await crypto.subtle.digest("SHA-256", bytes.buffer)).toString("hex"),
    bytes: bytes.length,
    base64: Buffer.from(bytes).toString("base64"),
  };
}
it("importa e só exibe os detalhes quando o usuário abre o modal", async () => {
  mocks.catalog.mockResolvedValue([resource]);
  mocks.download.mockResolvedValue(await download());
  const onReference = boot();
  const button = await screen.findByRole("button", { name: "Importar publicação oficial" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  const view = await screen.findByRole("button", { name: "Ver dados baixados" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(onReference).toHaveBeenCalledWith(
    expect.objectContaining({ resource, bytes: expect.any(Number) }),
  );
  fireEvent.click(view);
  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Registro de referência")).toBeInTheDocument();
  expect(screen.getByText("87,5")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Pesquisar nos dados ATRICON"), {
    target: { value: "sem correspondência" },
  });
  expect(screen.queryByText("Registro de referência")).not.toBeInTheDocument();
});
it("mantém os quatro ciclos e não anuncia importação quando a fonte falha", async () => {
  mocks.catalog.mockResolvedValue([resource]);
  mocks.download.mockRejectedValue(new Error("A fonte ATRICON respondeu HTTP 403."));
  boot();
  for (const year of [2025, 2024, 2023, 2022])
    expect(screen.getByRole("option", { name: String(year) })).toBeInTheDocument();
  const button = screen.getByRole("button", { name: "Importar publicação oficial" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(await screen.findByText(/A fonte ATRICON respondeu HTTP 403/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Ver dados baixados" })).not.toBeInTheDocument();
});
it("mantém a abertura de arquivos locais disponível quando o catálogo está indisponível", async () => {
  mocks.catalog.mockRejectedValue(new Error("Fonte indisponível"));
  boot();
  expect(await screen.findByText(/Não foi possível consultar a fonte oficial/)).toBeInTheDocument();
  expect(screen.getByLabelText("Arquivo ATRICON baixado")).toBeEnabled();
  expect(screen.getByRole("button", { name: "Importar publicação oficial" })).toBeDisabled();
});
