import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PainelIntegracoes } from "@/components/admin/PainelIntegracoes";
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: { endpoints: [] }, refetch: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@/lib/data", () => ({ db: { rpc: vi.fn() } }));
afterEach(cleanup);

it("mantém as integrações contábeis e abre o importador oficial nos dois destinos TCE", async () => {
  render(<PainelIntegracoes />);
  for (const [destino, exemplo] of [
    ["7.1 — Contabilidade: receitas", "Arrecadação de IPTU"],
    ["7.1 — Contabilidade: despesas", "Secretaria de Saúde"],
    ["7.2 — Folha de pagamento", "Ana Clara de Oliveira"],
  ]) {
    fireEvent.click(screen.getByRole("button", { name: destino! }));
    fireEvent.click(screen.getByRole("button", { name: "Importar da API externa" }));
    expect(await screen.findByText(exemplo!)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar sincronização" })).toBeEnabled();
  }
  for (const name of ["7.3 — TCE: credores", "7.3 — TCE: agentes políticos"]) {
    fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.getByRole("button", { name: "Importar dados do TCE" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Importar da API externa" }),
    ).not.toBeInTheDocument();
  }
});
it("disponibiliza ambas as origens na página do módulo de pessoal", () => {
  render(<PainelIntegracoes somenteFolha />);
  expect(screen.getByRole("button", { name: "7.2 — Folha de pagamento" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Folha municipal" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Folha complementar" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Contabilidade/ })).not.toBeInTheDocument();
});
