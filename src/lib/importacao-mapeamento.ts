import { parseCSV } from './csv';
import { IMPORT_COLUNAS, prepararImportacao } from './importacao';
export function cabecalhosExternos(csv: string): string[] {
  const headers = parseCSV(csv)[0] ?? [];
  if (!headers.length || new Set(headers).size !== headers.length || headers.some(h => !h.trim())) throw new Error('Cabeçalho externo vazio ou repetido.');
  return headers;
}
/** Mapeia cada coluna de destino explicitamente; não presume um leiaute oficial. */
export function prepararLeiauteExterno(modulo: string, csv: string, mapa: Record<string,string>) {
  const headers = cabecalhosExternos(csv), parsed = parseCSV(csv);
  const cols = Object.keys(mapa).filter(k => mapa[k]);
  if (!cols.length || cols.some(k => !IMPORT_COLUNAS[modulo]?.includes(k) || !headers.includes(mapa[k]!))) throw new Error('Mapeamento contém coluna inexistente ou não permitida.');
  const escape = (v: string) => '"'+v.replace(/"/g,'""')+'"';
  const converted = [cols.map(escape).join(';'),...parsed.slice(1).map(row => {
    if (row.length !== headers.length) throw new Error('Linha externa com quantidade de colunas inválida.');
    return cols.map(k => escape(row[headers.indexOf(mapa[k]!)] ?? '')).join(';');
  })].join('\n');
  return prepararImportacao(modulo, converted);
}
