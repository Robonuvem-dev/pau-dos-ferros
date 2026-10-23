import { describe, expect, it } from "vitest";
import { boletimDoDia, contratosAVencer, mapaLicitacoes } from "@/lib/compras/relatorios";

const lics = [
  { numero: "PE 001/2026", modalidade: "Pregão Eletrônico", situacao: "Publicado", data_abertura: "2026-10-23", valor_estimado: 100000, secretaria: "Saúde" },
  { numero: "CC 002/2026", modalidade: "Concorrência", situacao: "Aberto", data_abertura: "2026-10-23", valor_estimado: 500000, secretaria: "Obras" },
  { numero: "PE 003/2026", modalidade: "Pregão Eletrônico", situacao: "Homologado", data_abertura: "2026-10-10", valor_estimado: 80000, secretaria: "Saúde" },
  { numero: "PE 004/2026", modalidade: "Pregão Eletrônico", situacao: "Publicado", data_abertura: "2026-10-28", valor_estimado: 60000, secretaria: "Educação" },
];

describe("mapaLicitacoes (item 3.16)", () => {
  it("filtra por modalidade e situação", () => {
    const r = mapaLicitacoes(lics, { modalidade: "Pregão Eletrônico", situacao: "Publicado" });
    expect(r.map((l) => l.numero)).toEqual(["PE 004/2026", "PE 001/2026"]);
  });
  it("filtra por período de abertura", () => {
    const r = mapaLicitacoes(lics, { de: "2026-10-20", ate: "2026-10-25" });
    expect(r.map((l) => l.numero)).toEqual(["PE 001/2026", "CC 002/2026"]);
  });
  it("filtra por secretaria", () => {
    expect(mapaLicitacoes(lics, { secretaria: "Saúde" })).toHaveLength(2);
  });
});

describe("boletimDoDia (item 3.14)", () => {
  it("lista aberturas do dia com totais por modalidade", () => {
    const b = boletimDoDia(lics, "2026-10-23");
    expect(b.doDia).toHaveLength(2);
    expect(b.porModalidade).toEqual([["Pregão Eletrônico", 1], ["Concorrência", 1]]);
    expect(b.totalEstimado).toBe(600000);
  });
  it("avisa aberturas dos próximos 7 dias", () => {
    const b = boletimDoDia(lics, "2026-10-23");
    expect(b.proximas.map((l) => l.numero)).toEqual(["PE 004/2026"]);
  });
});

describe("contratosAVencer (item 3.17)", () => {
  const contratos = [
    { numero: "010/2026", tipo: "Contrato", fornecedor: "A", valor: 1000, data_fim: "2026-11-10", data_fim_atualizada: "2026-12-20" },
    { numero: "011/2026", tipo: "Contrato", fornecedor: "B", valor: 2000, data_fim: "2026-11-05" },
    { numero: "AD 1", tipo: "Aditivo", fornecedor: "A", valor: 500, data_fim: "2026-11-01", contrato_origem: "010/2026" },
    { numero: "012/2026", tipo: "Contrato", fornecedor: "C", valor: 3000, data_fim: "2027-06-01" },
  ];
  it("usa a vigência atualizada pelo aditivo e ignora aditivos", () => {
    const r = contratosAVencer(contratos, "2026-10-23", 30);
    expect(r.map((c) => c.numero)).toEqual(["011/2026"]);
    expect(r[0]!.diasRestantes).toBe(13);
  });
  it("amplia o alcance conforme o número de dias", () => {
    const r = contratosAVencer(contratos, "2026-10-23", 90);
    expect(r.map((c) => c.numero)).toEqual(["011/2026", "010/2026"]);
  });
});
