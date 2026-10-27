import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ResumoConvenios } from "../components/convenios/ResumoConvenios";
import { PublicTable } from "../components/site/PublicTable";
import { getModule } from "../lib/modules";

const fixtures = vi.hoisted(() => ({
  convenios: [{ id: "c1", numero: "AVR-FICTICIO", valor_global: 10000, contrapartida: 0, metas: "Meta ficticia",data_inicio:"2020-01-01",data_fim:"2099-12-31" },{id:"vencido",numero:"AVR-VENCIDO",valor_global:1000,contrapartida:0,metas:"Meta vencida",data_inicio:"2020-01-01",data_fim:"2020-12-31"}],
  "convenio-parcelas": [{ id: "p1", convenio_id: "c1", numero: 1, valor: 2500, status: "Recebida" }],
  "convenio-obrigacoes": [],
  contratos: [
    { id: "t1", numero: "AVR-CONTRATO-A", convenio_id: "c1", valor: 1000 },
    { id: "t2", numero: "AVR-CONTRATO-B", convenio_id: "c1", valor: 2000 },
    { id: "t3", numero: "OUTRO-CONTRATO", convenio_id: "c2", valor: 999 },
  ],
}));
vi.mock("@tanstack/react-query", () => ({
  useQueries: () => [],
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
vi.mock('@tanstack/react-router', () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));

afterEach(cleanup);
describe("M04 — apresentacao publica", () => {
  it("mostra todos os contratos do convenio, separa saldo de parcelas e ignora outros vinculos", () => {
    render(<ResumoConvenios publico />);
    expect(screen.getByText(/AVR-CONTRATO-A/)).toBeInTheDocument();
    expect(screen.getByText(/AVR-CONTRATO-B/)).toBeInTheDocument();
    expect(screen.queryByText(/OUTRO-CONTRATO/)).not.toBeInTheDocument();
    expect(screen.getByText(/25.0% recebido/)).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("value", "2500");
  });
  it("disponibiliza as metas completas, antes ocultas na listagem publica", () => {
    const mod=getModule('convenios'); if(!mod)throw new Error('Módulo ausente');
    render(<PublicTable mod={mod} />);
    expect(screen.getAllByText('Meta ficticia').length).toBeGreaterThan(0);
  });
  it("mostra convênio vencido somente quando o filtro de vigência é desativado",()=>{
    render(<ResumoConvenios publico />);
    expect(screen.queryByText('AVR-VENCIDO')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox',{name:/Somente vigentes/}));
    expect(screen.getByText('AVR-VENCIDO')).toBeInTheDocument();
  });
  it("busca inclui os campos de detalhe", () => {
    render(<PublicTable mod={getModule("convenios")!} />);
    fireEvent.change(screen.getByPlaceholderText("Pesquisar nesta consulta..."), { target: { value: "Meta ficticia" } });
    expect(screen.getByText("1 registro(s)")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Pesquisar nesta consulta..."), { target: { value: "Nao existe" } });
    expect(screen.getByText("Nenhum registro encontrado.")).toBeInTheDocument();
  });
});
