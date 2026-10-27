export type CodificacaoCSV = 'utf-8' | 'windows-1252';

/** Não adivinha codificação: o operador escolhe a do sistema de origem. */
export function decodificarCSV(bytes: ArrayBuffer, codificacao: CodificacaoCSV = 'utf-8'): string {
  if (!['utf-8', 'windows-1252'].includes(codificacao)) throw new Error('Codificação CSV não suportada. Use UTF-8 ou Windows-1252.');
  let texto: string;
  try { texto = new TextDecoder(codificacao, { fatal: true }).decode(bytes); }
  catch { throw new Error('O arquivo não corresponde à codificação selecionada. Confira UTF-8 ou Windows-1252 no sistema de origem.'); }
  if (texto.includes('\u0000') || texto.includes('\uFFFD')) throw new Error('O arquivo contém caracteres inválidos. Exporte novamente como UTF-8 ou Windows-1252.');
  return texto.replace(/^\uFEFF/, '');
}
