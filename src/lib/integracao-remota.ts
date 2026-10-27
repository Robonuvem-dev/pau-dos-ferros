import { prepararImportacao } from './importacao';
import { prepararLeiauteExterno } from './importacao-mapeamento';
import { decodificarCSV, type CodificacaoCSV } from './csv-codificacao';
export interface IntegrationConfig { modulo:string;origem:string;arquivoUrl:string;mapeamento?:Record<string,string>;codificacao?:CodificacaoCSV }
export interface IntegrationCredentials { backendUrl:string;publishableKey:string;email:string;password:string;sourceToken?:string }
/** Executado por um operador/serviço autorizado, nunca pelo carregamento público do portal. */
export async function executarIntegracao(config:IntegrationConfig,credentials:IntegrationCredentials,read:typeof fetch=fetch):Promise<number> {
  const source=new URL(config.arquivoUrl),backend=new URL(credentials.backendUrl);
  if(source.protocol!=='https:'||backend.protocol!=='https:'||source.username||source.password||backend.username||backend.password)throw new Error('As origens devem usar HTTPS sem credenciais na URL.');
  if(!credentials.publishableKey||!credentials.email||!credentials.password)throw new Error('Configure a conta de integração com permissão restrita ao módulo.');
  const response=await read(source,{redirect:'error',signal:AbortSignal.timeout(30_000),headers:credentials.sourceToken?{Authorization:'Bearer '+credentials.sourceToken}:{}});
  if(!response.ok)throw new Error('Arquivo de origem indisponível: HTTP '+response.status);
  if(Number(response.headers.get('content-length')??0)>2_000_000)throw new Error('Arquivo de origem acima de 2 MB.');
  const bytes=await response.arrayBuffer();if(bytes.byteLength>2_000_000)throw new Error('Arquivo de origem acima de 2 MB.');
  const csv=decodificarCSV(bytes,config.codificacao);
  const rows=config.mapeamento?prepararLeiauteExterno(config.modulo,csv,config.mapeamento):prepararImportacao(config.modulo,csv);
  const login=await read(new URL('/auth/v1/token?grant_type=password',backend),{method:'POST',redirect:'error',signal:AbortSignal.timeout(30_000),headers:{apikey:credentials.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email:credentials.email,password:credentials.password})});
  if(!login.ok)throw new Error('A conta de integração não pôde autenticar.');
  const session=await login.json() as {access_token?:string};if(!session.access_token)throw new Error('A autenticação não retornou uma sessão.');
  const imported=await read(new URL('/rest/v1/rpc/sincronizar_dados_poc',backend),{method:'POST',redirect:'error',signal:AbortSignal.timeout(30_000),headers:{apikey:credentials.publishableKey,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({_modulo:config.modulo,_origem:config.origem,_linhas:rows})});
  if(!imported.ok)throw new Error('Sincronização recusada pelo banco: HTTP '+imported.status);
  const total:unknown=await imported.json();if(!Number.isInteger(total)||Number(total)!==rows.length)throw new Error('A sincronização retornou um total inesperado; confira a auditoria antes de repetir.');
  return Number(total);
}
