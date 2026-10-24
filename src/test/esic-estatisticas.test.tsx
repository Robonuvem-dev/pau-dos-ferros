import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { NovoPedido } from "../routes/esic";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
vi.mock("@/lib/data", () => ({ db: { rpc } }));
vi.mock("@/lib/queries", () => ({ estatisticasQuery: { queryKey: ["public-estatisticas-atendimento"] } }));

afterEach(cleanup);
beforeEach(() => rpc.mockReset());
describe("M05 — estatistica apos envio", () => {
  it("atualiza o total exibido sem exigir recarregar a pagina", async () => {
    let serverTotal = 0;
    rpc.mockImplementation(async () => { serverTotal++; return { data: "PF-POC-FICTICIO", error: null }; });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    function Stats() {
      const { data } = useQuery({ queryKey: ["public-estatisticas-atendimento"], queryFn: async () => serverTotal, initialData: 0, staleTime: Infinity });
      return <p>Total observado: {data}</p>;
    }
    render(<QueryClientProvider client={qc}><NovoPedido /><Stats /></QueryClientProvider>);
    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "POC Ficticio" } });
    fireEvent.change(screen.getByLabelText("E-mail *"), { target: { value: "poc@teste.invalid" } });
    fireEvent.change(screen.getByLabelText("Assunto *"), { target: { value: "POC Ficticia" } });
    fireEvent.change(screen.getByLabelText("Mensagem *"), { target: { value: "Mensagem ficticia para o teste." } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar manifestação" }));
    await screen.findByText("PF-POC-FICTICIO");
    await waitFor(() => expect(screen.getByText("Total observado: 1")).toBeInTheDocument());
    expect(rpc).toHaveBeenCalledOnce();
  });
});
