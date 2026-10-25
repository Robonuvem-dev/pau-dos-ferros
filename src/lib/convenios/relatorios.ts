export function filtrarConvenios<T extends Record<string, unknown>>(rows: T[], filtro: { vigentes: boolean; referencia: string; de: string; ate: string }): T[] {
  return rows.filter(r => {
    const inicio = String(r.data_inicio ?? ''), fim = String(r.data_fim ?? '');
    if (filtro.vigentes && (!inicio || !fim || inicio > filtro.referencia || fim < filtro.referencia || ['Concluído','Cancelado','Encerrado'].includes(String(r.situacao)))) return false;
    if (filtro.de && (!fim || fim < filtro.de)) return false;
    if (filtro.ate && (!inicio || inicio > filtro.ate)) return false;
    return true;
  });
}
