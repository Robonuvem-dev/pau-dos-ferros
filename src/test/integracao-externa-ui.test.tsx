import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { IntegracaoExterna } from "@/components/admin/IntegracaoExterna";
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/data", () => ({ db: { rpc } }));
afterEach(cleanup);
beforeEach(() => rpc.mockReset());

it("revisa valores e só grava ao confirmar, mantendo origem e competência", async () => {
  rpc.mockResolvedValue({ data: 3, error: null });
  const onDone = vi.fn();
  render(<IntegracaoExterna modulo="servidores" onDone={onDone} />);
  fireEvent.change(screen.getByLabelText("Origem"), { target: { value: "Folha complementar" } });
  fireEvent.change(screen.getByLabelText("Competência"), { target: { value: "2026-10" } });
  fireEvent.click(screen.getByRole("button", { name: "Sincronizar API externa" }));
  await screen.findByText("Ana Clara de Oliveira");
  expect(rpc).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar sincronização" }));
  await screen.findByRole("status");
  expect(rpc).toHaveBeenCalledWith(
    "importar_dados_poc",
    expect.objectContaining({
      _modulo: "servidores",
      _origem: "API Folha complementar",
      _linhas: expect.arrayContaining([
        expect.objectContaining({ competencia: "2026-10", subsidio: 2800, remuneracao: 2860 }),
      ]),
    }),
  );
  expect(onDone).toHaveBeenCalledOnce();
});

it("mantém o lote para revisão quando o banco recusa duplicidade", async () => {
  rpc.mockResolvedValue({ data: null, error: { code: "23505" } });
  const onDone = vi.fn();
  render(<IntegracaoExterna modulo="credores" onDone={onDone} />);
  fireEvent.click(screen.getByRole("button", { name: "Sincronizar API externa" }));
  await screen.findByText("Fornecedor Alfa");
  fireEvent.click(screen.getByRole("button", { name: "Confirmar sincronização" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("sem duplicar dados");
  expect(screen.getByText("Fornecedor Alfa")).toBeInTheDocument();
  expect(onDone).not.toHaveBeenCalled();
});

it("descarta a prévia ao mudar a competência e permite cancelar sem gravar", async () => {
  render(<IntegracaoExterna modulo="receitas" onDone={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Sincronizar API externa" }));
  await screen.findByText("Arrecadação de IPTU");
  fireEvent.change(screen.getByLabelText("Competência"), { target: { value: "2026-09" } });
  await waitFor(() => expect(screen.queryByText("Arrecadação de IPTU")).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "Sincronizar API externa" }));
  await screen.findByText("Arrecadação de IPTU");
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByText("Arrecadação de IPTU")).not.toBeInTheDocument();
  expect(rpc).not.toHaveBeenCalled();
});
