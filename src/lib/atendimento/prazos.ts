/** Sprint 5/M05 — prazo LAI: 20 dias, prorrogável por 10, com justificativa.
 * A regra do edital refere 20+10 dias; esta função é utilitária de calendário,
 * NÃO considera feriados locais, suspensões ou situações legais especiais.
 */
export function prazoEsic(recebidoEm: Date, prorrogado: boolean) {
  if (Number.isNaN(recebidoEm.getTime())) throw new Error("Data de recebimento inválida.");
  const dias = prorrogado ? 30 : 20;
  const termino = new Date(recebidoEm.getTime());
  termino.setUTCDate(termino.getUTCDate() + dias);
  return termino;
}
export function validarProrrogacaoEsic(prorrogado: boolean, justificativa: string) {
  if (prorrogado && justificativa.trim().length < 10) throw new Error("Prorrogação de prazo exige justificativa.");
  return true;
}
