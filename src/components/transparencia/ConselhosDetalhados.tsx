import { useQueries } from "@tanstack/react-query";
import { moduleQuery } from "@/lib/queries";
import { dataBR } from "@/lib/modules";
import type { Row } from "@/lib/data";
export function ConselhosDetalhados({registro}:{registro:string|undefined}) {
 const keys=["conselhos","conselho-membros","conselho-acoes","conselho-doc"];
 const queries=useQueries({queries:keys.map(moduleQuery)});
 if(queries.some(q=>q.error))return <p role="alert">Não foi possível carregar os conselhos.</p>;
 if(queries.some(q=>!q.data))return <p>Carregando conselhos...</p>;
 const rows=(key:string):Row[]=>queries[keys.indexOf(key)]?.data??[];
 const conselhos=rows("conselhos").filter(c=>!registro||c.id===registro);
 return <section className="my-8"><h2 className="section-title">Páginas dos conselhos municipais</h2>
 {registro&&<a className="underline" href="/transparencia/conselhos">Todos os conselhos</a>}
 {registro&&!conselhos.length&&<p>Conselho não encontrado.</p>}
 {conselhos.map(c=>{
  const vinculados=(key:string)=>rows(key).filter(r=>r.conselho_id===c.id);
  const cor=/^#[0-9a-f]{6}$/i.test(String(c.cor??""))?String(c.cor):undefined;
  return <article key={c.id} className="my-5 rounded border bg-card p-5" style={{borderTopColor:cor,borderTopWidth:4}}>
   <h3 className="font-display text-2xl font-bold">{String(c.nome)}</h3>
   <a className="text-primary underline" href={"/transparencia/conselhos?registro="+encodeURIComponent(c.id)}>Página deste conselho</a>
   {c.imagem_url&&<img className="my-3 max-h-48 rounded object-contain" src={String(c.imagem_url)} alt={String(c.nome)}/>}
   <p className="my-2 whitespace-pre-wrap">{String(c.descricao??"")}</p>
   <p>Criação: {dataBR(c.data_criacao)} · Ato: {String(c.lei_criacao??"Não informado")}</p>
   <p>Vigência: {dataBR(c.vigencia_inicio)} a {dataBR(c.vigencia_fim)}</p>
   <h4 className="mt-3 font-bold">Competências</h4><p className="whitespace-pre-wrap">{String(c.competencias??"Não informadas")}</p>
   <h4 className="mt-3 font-bold">Composição e representações</h4>
   <ul>{vinculados("conselho-membros").map(m=><li key={m.id}>{String(m.nome)} · {String(m.tipo)} · {String(m.representacao)} · {String(m.entidade??"")} · {m.ativo?"Ativo":"Inativo"} · {dataBR(m.inicio)} a {dataBR(m.fim)}</li>)}</ul>
   <h4 className="mt-3 font-bold">Histórico de ações</h4>
   <ul>{vinculados("conselho-acoes").sort((a,b)=>String(b.data).localeCompare(String(a.data))).map(a=><li key={a.id}>{dataBR(a.data)} · {String(a.tipo)} · {String(a.titulo)}<p>{String(a.descricao??"")}</p>{a.arquivo_url&&<a className="underline" href={String(a.arquivo_url)} target="_blank" rel="noreferrer">Documento da ação</a>}</li>)}</ul>
   <h4 className="mt-3 font-bold">Documentos emitidos</h4><ul>{vinculados("conselho-doc").map(d=><li key={d.id}>{dataBR(d.data)} · {String(d.titulo)}{d.arquivo_url&&<a className="ml-2 underline" href={String(d.arquivo_url)} target="_blank" rel="noreferrer">Abrir documento</a>}</li>)}</ul>
  </article>;
 })}
 </section>;
}
