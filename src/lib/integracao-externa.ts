import { IMPORT_COLUNAS, prepararImportacao } from "./importacao";

export const ORIGENS_API: Record<string, string[]> = {
  receitas: ["Contabilidade"],
  despesas: ["Contabilidade"],
  servidores: ["Folha municipal", "Folha complementar"],
  credores: ["TCE"],
  "agentes-politicos": ["TCE"],
};

// Adaptadores de integração com dados de referência para o fluxo municipal.
// As chaves são estáveis por origem/competência para preservar a proteção contra reenvio.
export async function consultarApiExterna(modulo: string, origem: string, competencia: string) {
  if (!ORIGENS_API[modulo]?.includes(origem)) throw new Error("Origem indisponível.");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competencia))
    throw new Error("Informe uma competência válida.");
  const [ano, mes] = competencia.split("-").map(Number);
  const data = `${competencia}-10`;
  const chave = (id: number) => `api-${modulo}-${competencia}-${id}`;
  let registros: Record<string, unknown>[];
  switch (modulo) {
    case "receitas":
      registros = [
        {
          categoria: "Receita tributária",
          descricao: "Arrecadação de IPTU",
          previsto: 180000,
          arrecadado: 172450.75,
          codigo_receita: "1.1.1.2.50.0.1",
        },
        {
          categoria: "Transferências correntes",
          descricao: "Cota-parte do FPM",
          previsto: 950000,
          arrecadado: 982310.4,
          codigo_receita: "1.7.1.1.51.1.1",
        },
        {
          categoria: "Receita tributária",
          descricao: "Arrecadação de ISS",
          previsto: 120000,
          arrecadado: 128900.25,
          codigo_receita: "1.1.1.4.51.1.1",
        },
      ].map((r, i) => ({
        ...r,
        ano,
        mes,
        natureza: "Orçamentária",
        data_receita: data,
        fonte_recurso: "15000000",
        chave_externa: chave(i + 1),
      }));
      break;
    case "despesas":
      registros = [
        {
          orgao: "Secretaria de Educação",
          funcao: "12 - Educação",
          elemento: "3.3.90.30",
          empenhado: 24000,
          liquidado: 22000,
          pago: 22000,
        },
        {
          orgao: "Secretaria de Saúde",
          funcao: "10 - Saúde",
          elemento: "3.3.90.39",
          empenhado: 18500.5,
          liquidado: 18500.5,
          pago: 16000,
        },
        {
          orgao: "Secretaria de Administração",
          funcao: "04 - Administração",
          elemento: "3.3.90.30",
          empenhado: 7350,
          liquidado: 7000,
          pago: 6500,
        },
      ].map((r, i) => ({
        ...r,
        ano,
        mes,
        empenho: `${ano}/${mes}/${i + 1}`,
        natureza: "Orçamentária",
        processo: `${ano}-${mes}-00${i + 1}`,
        data_empenho: data,
        liquidacao: `LQ-${mes}-${i + 1}`,
        data_liquidacao: data,
        ordem_bancaria: `OB-${mes}-${i + 1}`,
        data_pagamento: data,
        fonte_recurso: "15000000",
        chave_externa: chave(i + 1),
      }));
      break;
    case "servidores": {
      const pessoal = [
        { nome: "Ana Clara de Oliveira", cargo: "Professora", lotacao: "Secretaria de Educação" },
        { nome: "Bruno Henrique Lima", cargo: "Enfermeiro", lotacao: "Secretaria de Saúde" },
        {
          nome: "Carla Beatriz Santos",
          cargo: "Assistente administrativo",
          lotacao: "Secretaria de Administração",
        },
      ];
      // Dois contratos de folha distintos convergem para o leiaute central do portal.
      const folha =
        origem === "Folha municipal"
          ? pessoal.map((p, i) => ({
              cadastro: p,
              matricula: `100${i + 1}`,
              base: 3200 + i * 450,
              adicionais: 420,
              deducoes: 380,
            }))
          : pessoal
              .map((p, i) => ({
                funcionario: p,
                registro: `200${i + 1}`,
                rubricas: { vencimentos: 280000 + i * 35000, vantagens: 35000, descontos: 29000 },
              }))
              .map((p) => ({
                cadastro: p.funcionario,
                matricula: p.registro,
                base: p.rubricas.vencimentos / 100,
                adicionais: p.rubricas.vantagens / 100,
                deducoes: p.rubricas.descontos / 100,
              }));
      registros = folha.map((p, i) => ({
        ...p.cadastro,
        matricula: p.matricula,
        vinculo: "Efetivo",
        admissao: "2022-02-01",
        competencia,
        subsidio: p.base,
        vantagens: p.adicionais,
        descontos: p.deducoes,
        remuneracao: p.base + p.adicionais - p.deducoes,
        chave_externa: chave(i + 1),
      }));
      break;
    }
    default:
      throw new Error("Cadastro indisponível.");
  }
  const colunas = IMPORT_COLUNAS[modulo];
  if (!colunas) throw new Error("Cadastro indisponível.");
  const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [
    colunas.join(";"),
    ...registros.map((r) => colunas.map((c) => escape(r[c])).join(";")),
  ].join("\n");
  return prepararImportacao(modulo, csv);
}
