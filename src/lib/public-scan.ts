import { CRITERIOS } from './atricon';
import type { EvidenceInput } from './ai-evidence';
const FISCAIS=['receitas','despesas','servidores','convenios','licitacoes','contratos','obras','rreo','rgf','lei'];
export async function readFiscalEvidence(read:typeof fetch=fetch):Promise<EvidenceInput[]> {
  const pages=new Map<string,string>();
  for(let i=0;i<FISCAIS.length;i+=3) await Promise.all(FISCAIS.slice(i,i+3).map(async key=>{
    const response=await read('/transparencia/'+key,{cache:'no-store',signal:AbortSignal.timeout(15_000)});
    if(!response.ok)throw new Error('Consulta pública indisponível: '+key);
    const html=await response.text();
    const dom=new DOMParser().parseFromString(html,'text/html');
    dom.querySelectorAll('script,style,noscript,header,footer,nav').forEach(n=>n.remove());
    const text=(dom.querySelector('main')??dom.body).textContent?.replace(/\s+/g,' ').trim()??'';
    pages.set(key,text.slice(0,16_800));
  }));
  return CRITERIOS.filter(c=>c.fonte&&FISCAIS.includes(c.fonte)).map(c=>({criterio:`[${c.id}] ${c.descricao}`,texto:pages.get(c.fonte!)??'',link:window.location.origin+'/transparencia/'+c.fonte}));
}
