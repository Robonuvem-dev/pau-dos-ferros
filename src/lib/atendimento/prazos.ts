/** Prazo em dias corridos para atendimento municipal.
 * O banco usa America/Fortaleza na data do recebimento; aqui normalizamos
 * explicitamente o calendário para evitar deslocamentos de fuso no browser.
 * Não trata suspensão, feriados ou exceções processuais.
 */
export function prazoAtendimento(recebidoEm: Date, canal: string, prorrogado: boolean, tipo?: string | null) {
  if (Number.isNaN(recebidoEm.getTime())) throw new Error("Data de recebimento inválida.");
  const partes = new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(recebidoEm);
  const campo = (tipo: Intl.DateTimeFormatPartTypes) => Number(partes.find(p => p.type === tipo)?.value);
  const ano = campo("year"), mes = campo("month"), dia = campo("day");
  const termino = new Date(Date.UTC(ano!, mes! - 1, dia!));
  termino.setUTCDate(termino.getUTCDate() + (canal === "esic" ? (tipo === "Recurso" ? 5 : prorrogado ? 30 : 20) : 30));
  return termino;
}
/** Compatibilidade com os testes e-SIC anteriores. */
export function prazoEsic(recebidoEm: Date, prorrogado: boolean) {
  return prazoAtendimento(recebidoEm, "esic", prorrogado);
}
export function validarProrrogacaoEsic(prorrogado: boolean, justificativa: string) {
  if (prorrogado && justificativa.trim().length < 10) throw new Error("Prorrogação de prazo exige justificativa.");
  return true;
}
