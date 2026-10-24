import { describe, expect, it } from "vitest";
import { avaliar, CRITERIOS } from "../lib/atricon";

describe("M14 — evidências por ponto ATRICON", () => {
  it("mantém exatamente os 88 pontos, sem aprovar os itens portal implicitamente", () => {
    expect(CRITERIOS).toHaveLength(88);
    expect(avaliar({}, {}).filter(i => i.status === "atende")).toHaveLength(0);
  });
  it("cadastros populados nao comprovam todos os requisitos do modulo", () => {
    const counts = Object.fromEntries(CRITERIOS.filter(c => c.fonte).map(c => [c.fonte!, 100]));
    expect(avaliar(counts, {}).every(i => i.status === "nao_atende")).toBe(true);
  });
  it("recusa marcacao manual positiva sem prova", () => {
    expect(avaliar({}, { "01": { status: "atende", observacao: "Verificado" } })[0]!.status).toBe("nao_atende");
  });
  it("exige registro de verificacao e URL, inclusive para portal de terceiro", () => {
    expect(avaliar({}, { "01": { status: "terceiro", link: "https://poc.invalid", observacao: "" } })[0]!.status).toBe("nao_atende");
    expect(avaliar({}, { "01": { status: "terceiro", link: "https://poc.invalid", observacao: "Consulta executada no ensaio ficticio." } })[0]!.status).toBe("terceiro");
  });
  it("preserva evidencia manual somente para o ponto verificado", () => {
    const result = avaliar({ receitas: 10 }, { "16": { status: "atende", link: "https://poc.invalid/receitas", observacao: "Registro de verificacao ficticio para teste." } });
    expect(result[15]).toMatchObject({ status: "atende", automatico: false });
    expect(result[16]!.status).toBe("nao_atende");
  });
  it("recusa URL executavel ou com credenciais", () => {
    for (const link of ["javascript:alert(1)", "https://usuario:senha@poc.invalid"]) {
      expect(avaliar({}, { "01": { status: "atende", link, observacao: "Registro ficticio de teste." } })[0]!.status).toBe("nao_atende");
    }
  });
});
