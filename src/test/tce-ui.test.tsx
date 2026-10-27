import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { IntegracaoExterna } from "@/components/admin/IntegracaoExterna";
const { catalog, download, rpc } = vi.hoisted(() => ({
  catalog: vi.fn(),
  download: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock("@/lib/tce.functions", () => ({ getTceCatalog: catalog, importTceData: download }));
vi.mock("@/lib/data", () => ({ db: { rpc } }));
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  catalog.mockResolvedValue({
    endpoints: [{ path: "/cadastro", label: "Credores", parameters: [] }],
  });
  download.mockResolvedValue(
    JSON.stringify({
      url: "https://apidadosabertos.tce.rn.gov.br/cadastro",
      downloadedAt: "2026-10-27T12:00:00Z",
      tables: { Dados: [{ Id: "123", Nome: "Credor oficial" }] },
      data: [],
    }),
  );
});
function mount() {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <IntegracaoExterna modulo="credores" onDone={vi.fn()} />
    </QueryClientProvider>,
  );
}
it("downloads without writing, opens modal, includes only mapped selected records", async () => {
  rpc.mockResolvedValue({ data: 1, error: null });
  mount();
  await screen.findByRole("option", { name: "Credores" });
  fireEvent.change(screen.getByLabelText("Endpoint oficial"), { target: { value: "/cadastro" } });
  fireEvent.click(screen.getByRole("button", { name: "Importar dados do TCE" }));
  await screen.findByRole("dialog");
  expect(rpc).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText(/Mapeamento para/));
  fireEvent.change(screen.getByLabelText("Nome / Razão social"), { target: { value: "Nome" } });
  fireEvent.change(screen.getByLabelText(/identificador oficial único/), {
    target: { value: "Id" },
  });
  fireEvent.click(screen.getByLabelText("Selecionar registro 1"));
  fireEvent.click(screen.getByRole("button", { name: "Incluir 1 selecionados no cadastro" }));
  await waitFor(() =>
    expect(rpc).toHaveBeenCalledWith("importar_dados_poc", {
      _modulo: "credores",
      _origem: "TCE/RN Dados Abertos",
      _linhas: [{ nome: "Credor oficial", chave_externa: "tce-credores-123" }],
    }),
  );
});
it("shows source failure without falling back to generated records", async () => {
  catalog.mockRejectedValue(new Error("HTTP 503"));
  mount();
  expect(await screen.findByRole("alert")).toHaveTextContent("HTTP 503");
  expect(screen.getByRole("button", { name: "Importar dados do TCE" })).toBeDisabled();
  expect(download).not.toHaveBeenCalled();
  expect(rpc).not.toHaveBeenCalled();
});
