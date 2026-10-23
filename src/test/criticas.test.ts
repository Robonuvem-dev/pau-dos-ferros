import { describe, expect, it } from "vitest";
import { avaliarPendencias } from "@/lib/criticas";

const H = "2026-10-23";
const has = (d: Parameters<typeof avaliarPendencias>[0], p: string) => avaliarPendencias(d, H).some((x) => x.problema === p);

describe("críticas e pendências", () => {
  it("dispensa sem fundamentação é pendência", () => {
    expect(has({ licitacoes: [{ id: "1", numero: "1", modalidade: "Dispensa", arquivo_url: "x" }] }, "Dispensa/inexigibilidade sem fundamentação legal")).toBe(true);
  });
  it("pregão sem fundamentação não é pendência de fundamentação", () => {
    expect(has({ licitacoes: [{ id: "1", numero: "1", modalidade: "Pregão Eletrônico", arquivo_url: "x" }] }, "Dispensa/inexigibilidade sem fundamentação legal")).toBe(false);
  });
  it("contrato com fim ontem está vencido", () => {
    expect(has({ contratos: [{ id: "1", numero: "1", data_fim: "2026-10-22", arquivo_url: "x" }] }, "Contrato vencido")).toBe(true);
  });
  it("contrato vencendo em 30 dias gera alerta; em 31 não", () => {
    expect(has({ contratos: [{ id: "1", data_fim: "2026-11-22", arquivo_url: "x" }] }, "Contrato vence em até 30 dias")).toBe(true);
    expect(has({ contratos: [{ id: "1", data_fim: "2026-11-23", arquivo_url: "x" }] }, "Contrato vence em até 30 dias")).toBe(false);
  });
  it("obra concluída com prazo passado não é pendência de prazo", () => {
    expect(has({ obras: [{ id: "1", nome: "o", art: "a", previsao_fim: "2026-01-01", situacao: "Concluída" }] }, "Obra com prazo vencido e não concluída")).toBe(false);
  });
  it("pendências altas vêm primeiro", () => {
    const r = avaliarPendencias({ noticias: [{ id: "n", titulo: "t" }], obras: [{ id: "o", nome: "o", situacao: "Paralisada", art: "a" }] }, H);
    expect(r[0]!.gravidade).toBe("alta");
  });
});
