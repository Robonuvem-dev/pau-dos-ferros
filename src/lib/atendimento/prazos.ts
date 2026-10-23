/** Prazo em dias corridos para demonstração M05.
 * O banco usa America/Fortaleza na data do recebimento; aqui normalizamos
 * explicitamente o calendário para evitar deslocamentos de fuso no browser.
 * Não trata suspensão, feriados ou exceções processuais.
 */
export function prazoAtendimento(recebidoEm: Date, canal: string, prorrogado: boolean) {
  if (Number.isNaN(recebidoEm.getTime())) throw new Error("Data de recebimento inválida.");
  const base = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza", year: "numeric", month: "2-digit", day: "2-digit" }).format(recebidoEm);
  const [ano, mes, dia] = base.split("-").map(Number);
  const termino = new Date(Date.UTC(ano!, mes! - 1, dia!));
  termino.setUTCDate(termino.getUTCDate() + (canal === "esic" ? (prorrogado ? 30 : 20) : 30));
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
