import { parseCSV } from "./csv";
import { getModule } from "./modules";
import { normalizeField } from "./normalization";

export const IMPORT_COLUNAS: Record<string, string[]> = {
 receitas: ["ano","mes","categoria","descricao","previsto","arrecadado","natureza","data_receita","codigo_receita","fonte_recurso","chave_externa"],
 despesas: ["ano","mes","orgao","funcao","elemento","credor","empenho","empenhado","liquidado","pago","natureza","processo","data_empenho","liquidacao","data_liquidacao","ordem_bancaria","data_pagamento","fonte_recurso","chave_externa"],
 servidores: ["nome","matricula","cargo","vinculo","lotacao","admissao","remuneracao","competencia","subsidio","vantagens","descontos","chave_externa"],
};
export function prepararImportacao(modulo: string, csv: string) {
 const mod = getModule(modulo), permitidas = IMPORT_COLUNAS[modulo];
 if (!mod || !permitidas) throw new Error("Importação indisponível para este cadastro.");
 const [headers, ...rows] = parseCSV(csv);
 if (!headers?.length || rows.length < 1 || rows.length > 500) throw new Error("O arquivo deve conter cabeçalho e entre 1 e 500 registros.");
 if (new Set(headers).size !== headers.length || headers.some(h => !permitidas.includes(h))) throw new Error("Cabeçalho repetido ou coluna não permitida. Utilize o modelo CSV.");
 const required = modulo === "servidores" ? ["nome","competencia","chave_externa"] : ["ano","mes",modulo === "receitas" ? "categoria" : "orgao","chave_externa"];
 if (required.some(h => !headers.includes(h))) throw new Error("Faltam colunas obrigatórias: " + required.join(", "));
 const chaves = new Set<string>();
 return rows.map((cells, i) => {
  const linha = i + 2;
  if (cells.length !== headers.length) throw new Error("Linha " + linha + ": quantidade de colunas inválida.");
  const out: Record<string, unknown> = {};
  headers.forEach((h,j) => {
   const f = mod.fields.find(x => x.name === h)!;
   const raw = (cells[j] ?? "").trim();
   if (required.includes(h) && !raw) throw new Error("Linha " + linha + ": preencha " + h + ".");
   if (f.options && raw && !f.options.includes(raw)) throw new Error("Linha " + linha + ": opção inválida em " + h + ".");
   const v = normalizeField(f,raw);
   if (raw && ["number","money","int"].includes(f.type ?? "") && (v === null || !Number.isFinite(Number(v)) || (f.type === "int" && !/^-?\d+$/.test(raw)))) throw new Error("Linha " + linha + ": número inválido em " + h + ".");
   if (f.type === "date" && v && (!/^\d{4}-\d{2}-\d{2}$/.test(String(v)) || Number.isNaN(Date.parse(String(v))) || new Date(String(v)).toISOString().slice(0,10) !== v)) throw new Error("Linha " + linha + ": data inválida em " + h + ".");
   out[h] = v;
  });
  if (out.mes != null && (Number(out.mes)<1 || Number(out.mes)>12)) throw new Error("Linha " + linha + ": mês deve estar entre 1 e 12.");
  if (chaves.has(String(out.chave_externa))) throw new Error("Linha " + linha + ": identificador repetido no arquivo.");
  chaves.add(String(out.chave_externa));
  return out;
 });
}
