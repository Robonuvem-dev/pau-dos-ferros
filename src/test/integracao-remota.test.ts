import {describe,it,expect,vi} from 'vitest';
import {executarIntegracao} from '../lib/integracao-remota';
const config={modulo:'despesas',origem:'POC ficticio',arquivoUrl:'https://origem.example.invalid/dados.csv',mapeamento:{ano:'Ano',mes:'Mes',orgao:'Unidade',chave_externa:'ID',empenhado:'Valor'}};
const credentials={backendUrl:'https://backend.example.invalid',publishableKey:'publica-ficticia',email:'integracao@poc.invalid',password:'credencial-ficticia-de-teste'};
describe('Importação automática por arquivo remoto',()=>{
 it('baixa, converte o leiaute, autentica conta restrita e sincroniza o lote na ordem correta',async()=>{
  const read=vi.fn().mockResolvedValueOnce(new Response('Ano;Mes;Unidade;ID;Valor\n2026;10;POC;X1;100,50')).mockResolvedValueOnce(Response.json({access_token:'sessao-ficticia'})).mockResolvedValueOnce(Response.json(1));
  expect(await executarIntegracao(config,credentials,read)).toBe(1);
  const calls=read.mock.calls;expect(String(calls[0]![0])).toBe(config.arquivoUrl);expect(String(calls[1]![0])).toContain('/auth/v1/token');
  const last=calls[2]![1] as RequestInit;expect(JSON.parse(String(last.body))).toEqual({_modulo:'despesas',_origem:'POC ficticio',_linhas:[{ano:2026,mes:10,orgao:'POC',chave_externa:'X1',empenhado:100.5}]});
  expect(last.headers).toHaveProperty('Authorization','Bearer sessao-ficticia');
 });
 it('não autentica nem escreve quando o arquivo ou mapeamento falha',async()=>{
  const read=vi.fn().mockResolvedValue(new Response('Coluna\nInvalida'));
  await expect(executarIntegracao(config,credentials,read)).rejects.toThrow();expect(read).toHaveBeenCalledOnce();
 });
 it('não expõe credenciais quando o login é recusado',async()=>{
  const read=vi.fn().mockResolvedValueOnce(new Response('Ano;Mes;Unidade;ID;Valor\n2026;10;POC;X1;100')).mockResolvedValueOnce(new Response('Detalhe interno',{status:401}));
  await expect(executarIntegracao(config,credentials,read)).rejects.toThrow('não pôde autenticar');expect(read).toHaveBeenCalledTimes(2);
 });
 it('recusa HTTP e redirecionamentos de origem',async()=>{
  const read=vi.fn();await expect(executarIntegracao({...config,arquivoUrl:'http://origem.example.invalid'},credentials,read)).rejects.toThrow('HTTPS');expect(read).not.toHaveBeenCalled();
 });
});
