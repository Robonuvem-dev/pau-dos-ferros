import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PainelAtricon } from "@/components/admin/PainelAtricon";
import type { OfficialImport } from "@/lib/atricon-official";
const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  upsert: vi.fn(),
  scan: vi.fn(),
  official: vi.fn(),
}));
vi.mock("@/lib/data", () => ({
  db: {
    from: () => ({
      select: async () => ({ data: [], error: null }),
      insert: mocks.insert,
      upsert: mocks.upsert,
    }),
  },
}));
vi.mock("@/lib/public-scan", () => ({
  readFiscalEvidence: async () => [
    {
      criterio: "Critério interno",
      texto: "Página pública",
      link: "https://portal.example/receitas",
    },
  ],
}));
vi.mock("@/lib/ai-browser", () => ({
  MODELO_LOCAL: "modelo-local",
  analisarEvidenciasPublicas: mocks.scan,
  analisarCriteriosOficiais: mocks.official,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const reference = (year: number): OfficialImport => ({
  resource: {
    year,
    url: `https://radardatransparencia.atricon.org.br/dados/${year}.xlsx`,
    label: "Publicação oficial de referência",
    format: "xlsx",
    fetchable: true,
  },
  importedAt: "2026-10-27T12:00:00Z",
  sha256: "a".repeat(64),
  bytes: 100,
  sheets: [],
  documents: [],
  criteria: ["Critério da publicação importada"],
});
it("confronta os critérios importados e preserva origem/ano/hash no anexo, sem aprovar os 88 pontos", async () => {
  mocks.insert.mockResolvedValue({ error: null });
  mocks.scan.mockResolvedValue("Diagnóstico do portal");
  mocks.official.mockResolvedValue("Confronto da publicação");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const element = (year: number) => (
    <QueryClientProvider client={client}>
      <PainelAtricon pendencias={[]} referencia={reference(year)} />
    </QueryClientProvider>
  );
  const { rerender } = render(element(2024));
  fireEvent.click(
    screen.getByRole("button", { name: "Executar varredura com IA local e gerar anexo" }),
  );
  await waitFor(() => expect(mocks.insert).toHaveBeenCalledOnce());
  const payload = mocks.insert.mock.calls[0]![0];
  expect(payload.texto).toContain("ciclo 2024");
  expect(payload.texto).toContain("SHA-256: " + reference(2024).sha256);
  expect(payload.texto).toContain("Confronto da publicação");
  expect(payload.resultados).toHaveLength(88);
  expect(payload.resultados.every((row: { status: string }) => row.status === "nao_atende")).toBe(
    true,
  );
  expect(mocks.official).toHaveBeenCalledWith(
    ["Critério da publicação importada"],
    expect.any(Array),
    expect.any(Function),
  );
  await screen.findByRole("button", { name: "Baixar anexo técnico" });
  rerender(element(2025));
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Baixar anexo técnico" })).not.toBeInTheDocument(),
  );
});
it("registra a referência oficial junto à evidência individual revisada pelo operador", async () => {
  mocks.upsert.mockResolvedValue({ error: null });
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <PainelAtricon pendencias={[]} referencia={reference(2025)} />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByLabelText("Resultado do ponto 01"), { target: { value: "atende" } });
  fireEvent.change(screen.getByLabelText("URL da evidência 01"), {
    target: { value: "https://portal.example/receitas" },
  });
  fireEvent.change(screen.getByLabelText("Verificação do ponto 01"), {
    target: { value: "Consulta realizada e documento verificado pelo operador." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar evidência 01", hidden: true }));
  await waitFor(() => expect(mocks.upsert).toHaveBeenCalledOnce());
  expect(mocks.upsert.mock.calls[0]![0]).toMatchObject({
    criterio: "01",
    status: "atende",
    observacao: expect.stringContaining("Referência oficial ATRICON — ciclo 2025"),
  });
});
