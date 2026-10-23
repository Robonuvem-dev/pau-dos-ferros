/** Regras puras M04: validadas sem depender de banco, framework ou serviços externos. */
export type Parcela = { valor: number; status: "Programada" | "Recebida" | "Cancelada" };
export function resumoFinanceiroConvenio(valorGlobal: number, contrapartida: number, parcelas: readonly Parcela[]) {
  if (!Number.isFinite(valorGlobal) || valorGlobal < 0 || !Number.isFinite(contrapartida) || contrapartida < 0)
    throw new Error("Valores do convênio inválidos.");
  if (parcelas.some((p) => !Number.isFinite(p.valor) || p.valor < 0)) throw new Error("Parcela inválida.");
  const consideradas = parcelas.filter(p => p.status !== "Cancelada");
  const programado = consideradas.reduce((s,p) => s + Math.round(p.valor * 100), 0) / 100;
  const recebido = consideradas.filter(p => p.status === "Recebida").reduce((s,p) => s + Math.round(p.valor * 100), 0) / 100;
  const saldo = Math.round((valorGlobal - programado) * 100) / 100;
  return { valorGlobal, contrapartida, programado, recebido, saldo, excedido: saldo < -0.001 };
}
export function pendenciasConvenio(input: { numero: string; concedente: string; convenente: string; responsavelConcedente: string; responsavelConvenente: string; metas: string; planoAplicacao: string; valorGlobal: number }) {
  const campos: Array<[string,string|number]> = [["Número",input.numero],["Concedente",input.concedente],["Convenente",input.convenente],["Responsável concedente",input.responsavelConcedente],["Responsável convenente",input.responsavelConvenente],["Metas",input.metas],["Plano de aplicação",input.planoAplicacao]];
  const pendentes=campos.filter(([,v])=>!String(v).trim()).map(([k])=>k);
  if (!Number.isFinite(input.valorGlobal) || input.valorGlobal < 0) pendentes.push("Valor global");
  return pendentes;
}
