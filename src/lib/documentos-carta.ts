import { municipalText } from "./municipal-brand";
import { db } from './data';
export async function gerarDocumentoCarta(formato: 'csv'|'json'|'ficha'|'estatisticas', ids?: string[]) {
  const {data,error} = await db.rpc('gerar_documento_carta', {_formato:formato,_ids:ids??null});
  if (error || !data?.[0]) throw new Error('Não foi possível preservar o documento da Carta no banco.');
  return data[0] as {documento_id:string;conteudo:string;mime:string;nome:string};
}
export async function baixarDocumentoCarta(formato:'csv'|'json'|'ficha'|'estatisticas', ids?:string[]) {
  const doc=await gerarDocumentoCarta(formato,ids);
  const url=URL.createObjectURL(new Blob([municipalText(doc.conteudo)],{type:doc.mime}));
  const a=document.createElement('a');a.href=url;a.download=doc.nome;a.click();URL.revokeObjectURL(url);
}
