import { formatMaskedValue } from "@/lib/formatting";
import { Button } from '@/components/ui/button';
import { downloadReport } from '@/lib/pdf-report';
import { getModule, formatCell } from '@/lib/modules';
import { useQueries } from "@tanstack/react-query";
import { moduleQuery } from "@/lib/queries";
import { brl,dataBR } from "@/lib/modules";
import type { Row } from "@/lib/data";
export function ObrasDetalhadas() {
 const keys=["obras","obra-andamentos","obra-medicoes","obra-arts","obra-fotos","contratos"];
 const queries=useQueries({queries:keys.map(moduleQuery)});
 if(queries.some(q=>q.error))return <p role="alert">Não foi possível carregar o acompanhamento das obras.</p>;
 if(queries.some(q=>!q.data))return <p>Carregando acompanhamento de obras...</p>;
 const rows=(key:string):Row[]=>queries[keys.indexOf(key)]?.data??[];
 const obras=rows("obras");
 return <section className="my-8"><h2 className="section-title">Acompanhamento físico e financeiro</h2>
 <div className="my-4 grid gap-3 sm:grid-cols-3">{["Em andamento","Paralisada","Concluída"].map(s=><div key={s} className="rounded border p-4"><strong>{obras.filter(o=>o.situacao===s).length}</strong> {s}</div>)}</div>
 {obras.map(o=>{
  const vinculados=(key:string)=>rows(key).filter(r=>r.obra_id===o.id);
  const contrato=rows("contratos").find(c=>c.id===o.contrato_id);
  const aditivos=contrato?rows("contratos").filter(c=>c.tipo==="Aditivo"&&c.contrato_origem_id===contrato.id):[];
  return <article key={o.id} className="my-4 rounded border bg-card p-5">
   <h3 className="font-display text-xl font-bold">{String(o.nome)}</h3>
   <p>{String(o.situacao??"Não informada")} · {brl(o.valor)} · {formatMaskedValue("percent",o.percentual??0)} executado</p>
   <progress className="my-3 w-full" aria-label={"Execução de "+o.nome} value={Math.max(0,Math.min(100,Number(o.percentual)||0))} max={100}/>
   {contrato&&<div className="my-3 rounded bg-secondary p-3"><strong>Contrato de origem: {String(contrato.numero)}</strong><p>{String(contrato.fornecedor??"")} · {brl(contrato.valor_atualizado??contrato.valor)}</p><p>{String(contrato.objeto??"")}</p><p>Vigência: {dataBR(contrato.data_inicio)} a {dataBR(contrato.data_fim_atualizada??contrato.data_fim)}</p><p>Aditivos vinculados: {aditivos.map(a=>String(a.numero)).join(", ")||"Nenhum"}</p></div>}
   <h4 className="mt-3 font-bold">Histórico físico e financeiro</h4>
   <ul>{vinculados("obra-andamentos").sort((a,b)=>String(a.data).localeCompare(String(b.data))).map(a=><li key={a.id}>{dataBR(a.data)} · {String(a.descricao)} · {formatMaskedValue("percent",a.percentual)} · {brl(a.valor_executado)}</li>)}</ul>
   <h4 className="mt-3 font-bold">Medições técnicas</h4><ul>{vinculados("obra-medicoes").map(m=><li key={m.id}>{String(m.numero)} · {dataBR(m.data)} · {brl(m.valor)} · {m.aprovada?"Aprovada":"Aguardando aprovação"} · {String(m.responsavel??"")}{m.arquivo_url&&<a className="ml-2 underline" href={String(m.arquivo_url)} target="_blank" rel="noreferrer">Documento</a>}</li>)}</ul>
   <h4 className="mt-3 font-bold">Responsabilidade técnica</h4><ul>{vinculados("obra-arts").map(a=><li key={a.id}>ART {String(a.numero)} · {String(a.responsavel)} · {String(a.registro_profissional??"")}{a.arquivo_url&&<a className="ml-2 underline" href={String(a.arquivo_url)} target="_blank" rel="noreferrer">ART digital</a>}</li>)}</ul>
   <div className="mt-4 grid gap-4 sm:grid-cols-3">{vinculados("obra-fotos").map(f=><figure key={f.id}><img loading="lazy" src={String(f.foto_url)} alt={String(f.legenda)} className="aspect-video w-full rounded object-cover"/><figcaption>{dataBR(f.data)} · {String(f.legenda)}</figcaption></figure>)}</div>
  </article>;
 })}
 <Button variant="outline" onClick={() => void downloadReport("Relatório de obras", obras.flatMap(o=>[ {title:String(o.nome),columns:["Campo","Informação"],rows:(getModule("obras")?.fields??[]).map(f=>[f.label,formatCell(f,o[f.name])])}, ...["obra-andamentos","obra-medicoes","obra-arts"].map(key=>({title:`${String(o.nome)} — ${getModule(key)?.label}`,columns:["Campo","Informação"],rows:rows(key).filter(r=>r.obra_id===o.id).flatMap(r=>(getModule(key)?.fields??[]).map(f=>[f.label,formatCell(f,r[f.name])]))}))]))}>PDF de obras</Button>
 </section>;
}
