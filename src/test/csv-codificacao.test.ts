import { describe, expect, it, vi } from 'vitest';
import { decodificarCSV } from '@/lib/csv-codificacao';
import { executarIntegracao } from '@/lib/integracao-remota';

const csv = 'Ano;Mes;Unidade;ID;Valor\n2026;10;Educação fictícia;X1;100,50';
const latin = Uint8Array.from(Array.from(csv, c => c.charCodeAt(0)));
const config = { modulo: 'despesas', origem: 'AVR fictícia', arquivoUrl: 'https://example.invalid/dados.csv', mapeamento: { ano: 'Ano', mes: 'Mes', orgao: 'Unidade', chave_externa: 'ID', empenhado: 'Valor' } };
const credentials = { backendUrl: 'https://backend.example.invalid', publishableKey: 'ficticia', email: 'poc@example.invalid', password: 'ficticia' };

describe('Codificação explícita dos arquivos contábeis', () => {
  it('preserva acentos em UTF-8 e remove BOM antes do cabeçalho', () => {
    expect(decodificarCSV(new TextEncoder().encode('\uFEFF' + csv).buffer)).toBe(csv);
  });
  it('preserva acentos Windows-1252 quando escolhido explicitamente', () => {
    expect(decodificarCSV(latin.buffer, 'windows-1252')).toBe(csv);
  });
  it('recusa bytes ANSI em UTF-8 sem substituir silenciosamente caracteres', () => {
    expect(() => decodificarCSV(latin.buffer)).toThrow('codificação selecionada');
  });
  it('recusa UTF-16, caracteres de substituição e codificações não permitidas', () => {
    expect(() => decodificarCSV(new Uint8Array([65, 0, 66, 0]).buffer)).toThrow('caracteres inválidos');
    expect(() => decodificarCSV(new TextEncoder().encode('Nome;\uFFFD').buffer)).toThrow('caracteres inválidos');
    expect(() => decodificarCSV(new ArrayBuffer(0), 'outro' as 'utf-8')).toThrow('não suportada');
  });
  it('decodifica arquivo remoto Windows-1252 antes de mapear e sincronizar', async () => {
    const read = vi.fn().mockResolvedValueOnce(new Response(latin)).mockResolvedValueOnce(Response.json({ access_token: 'sessao-ficticia' })).mockResolvedValueOnce(Response.json(1));
    expect(await executarIntegracao({ ...config, codificacao: 'windows-1252' }, credentials, read)).toBe(1);
    const payload = JSON.parse(String(read.mock.calls[2]?.[1]?.body));
    expect(payload._linhas[0]).toMatchObject({ orgao: 'Educação fictícia', empenhado: 100.5 });
  });
  it('não autentica nem escreve ao receber codificação inválida', async () => {
    const read = vi.fn().mockResolvedValueOnce(new Response(latin));
    await expect(executarIntegracao(config, credentials, read)).rejects.toThrow('codificação selecionada');
    expect(read).toHaveBeenCalledOnce();
  });
});
