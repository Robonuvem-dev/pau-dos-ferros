import { describe, expect, it } from "vitest";
import { resumoFinanceiroConvenio, pendenciasConvenio } from "../lib/convenios/validacao";
import { prazoEsic, validarProrrogacaoEsic } from "../lib/atendimento/prazos";

describe("Sprint 5 — convênios M04", () => {
  it("calcula programado, recebido e saldo sem parcelas canceladas", () => {
    const v = resumoFinanceiroConvenio(10000, 1500, [
      {valor: 4000, status:"Recebida"}, {valor:3000,status:"Programada"}, {valor:5000,status:"Cancelada"}
    ]);
    expect(v.programado).toBe(7000);
    expect(v.recebido).toBe(4000);
    expect(v.saldo).toBe(3000);
    expect(v.excedido).toBe(false);
  });
  it("sinaliza parcelas acima do valor global", () => {
    expect(resumoFinanceiroConvenio(100, 0, [{valor:101,status:"Programada"}]).excedido).toBe(true);
  });
  it("detecta dados obrigatórios sem inventar conformidade", () => {
    expect(pendenciasConvenio({numero:"001",concedente:"A",convenente:"B",responsavelConcedente:"",responsavelConvenente:"C",metas:"",planoAplicacao:"D",valorGlobal:100})).toEqual(["Responsável concedente","Metas"]);
  });
});
describe("Sprint 5 — e-SIC M05", () => {
  it("calcula prazos de 20 e 30 dias", () => {
    expect(prazoEsic(new Date("2026-10-01T00:00:00.000Z"),false).toISOString().slice(0,10)).toBe("2026-10-21");
    expect(prazoEsic(new Date("2026-10-01T00:00:00.000Z"),true).toISOString().slice(0,10)).toBe("2026-10-31");
  });
  it("rejeita prorrogação sem justificativa", () => {
    expect(()=>validarProrrogacaoEsic(true,"")).toThrow();
    expect(validarProrrogacaoEsic(true,"Justificativa pertinente")).toBe(true);
  });
});
