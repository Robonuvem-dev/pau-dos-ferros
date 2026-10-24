import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ResumoConvenios } from "../components/convenios/ResumoConvenios";
import { PublicTable } from "../components/site/PublicTable";
import { getModule } from "../lib/modules";

const fixtures = vi.hoisted(() => ({
  convenios: [{ id: "c1", numero: "POC-FICTICIO", valor_global: 10000, contrapartida: 0, metas: "Meta ficticia" }],
  "convenio-parcelas": [{ id: "p1", convenio_id: "c1", numero: 1, valor: 2500, status: "Recebida" }],
  "convenio-obrigacoes": [],
  contratos: [
    { id: "t1", numero: "POC-CONTRATO-A", convenio_id: "c1", valor: 1000 },
    { id: "t2", numero: "POC-CONTRATO-B", convenio_id: "c1", valor: 2000 },
    { id: "t3", numero: "OUTRO-CONTRATO", convenio_id: "c2", valor: 999 },
  ],
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: { queryKey: string[] }) => ({
    data: fixtures[options.queryKey[1] as keyof typeof fixtures] ?? [],
    isPending: false, error: null,
  }),
  useSuspenseQuery: (options: { queryKey: string[] }) => ({
    data: fixtures[options.queryKey[1] as keyof typeof fixtures] ?? [],
  }),
}));
vi.mock("@/lib/admin-queries", () => ({ adminModuleQuery: (key: string) => ({ queryKey: ["admin-module", key] }) }));
vi.mock("@/lib/queries", () => ({ moduleQuery: (key: string) => ({ queryKey: ["public-module", key] }) }));

afterEach(cleanup);
describe("M04 — apresentacao publica", () => {
  it("mostra todos os contratos do convenio, separa saldo de parcelas e ignora outros vinculos", () => {
    render(<ResumoConvenios publico />);
    expect(screen.getByText(/POC-CONTRATO-A/)).toBeInTheDocument();
    expect(screen.getByText(/POC-CONTRATO-B/)).toBeInTheDocument();
    expect(screen.queryByText(/OUTRO-CONTRATO/)).not.toBeInTheDocument();
    expect(screen.getByText(/25.0% recebido/)).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("value", "2500");
    expect(screen.getByRole("button", { name: /Imprimir/ })).toBeInTheDocument();
  });
  it("disponibiliza as metas completas, antes ocultas na listagem publica", () => {
    render(<PublicTable mod={getModule("convenios")!} />);
    expect(screen.getByText("Ver informações completas")).toBeInTheDocument();
    expect(screen.getByText("Meta ficticia")).toBeInTheDocument();
  });
  it("busca inclui os campos de detalhe", () => {
    render(<PublicTable mod={getModule("convenios")!} />);
    fireEvent.change(screen.getByPlaceholderText("Pesquisar nesta consulta..."), { target: { value: "Meta ficticia" } });
    expect(screen.getByText("1 registro(s)")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Pesquisar nesta consulta..."), { target: { value: "Nao existe" } });
    expect(screen.getByText("Nenhum registro encontrado.")).toBeInTheDocument();
  });
});
