import { useQueries } from "@tanstack/react-query";
import { moduleQuery } from "@/lib/queries";
import { brl,dataBR,getModule } from "@/lib/modules";
export function CovidDetalhado() {
 const keys=["diaria","contratos","portaria","lei","decreto","receitas","despesas","servidores"];
 const consultas=useQueries({queries:keys.map(moduleQuery)});
 if(consultas.some(q=>q.error))return <p role="alert">Não foi possível carregar as ações emergenciais.</p>;
 if(consultas.some(q=>!q.data))return <p>Carregando ações emergenciais...</p>;
 return <section className="my-8"><h2 className="section-title">Ações vinculadas ao enfrentamento da COVID-19</h2>
 <p className="my-3 text-sm">Somente registros explicitamente classificados na origem como COVID-19. Os boletins diários e seus anexos estão na consulta acima.</p>
 {keys.map((key,i)=>{
  const rows=consultas[i]?.data?.filter(r=>r.acao_emergencial==="COVID-19")??[];
  return <section key={key} className="my-4 rounded border bg-card p-4"><h3 className="font-bold">{getModule(key)?.label} ({rows.length})</h3>
  <ul>{rows.map(r=><li key={r.id} className="my-2 border-t pt-2"><strong>{String(r.titulo??r.numero??r.nome??r.descricao??r.categoria??r.empenho??"Registro")}</strong><p>{String(r.objeto??r.ementa??r.justificativa??r.cargo??"")}</p><p>{dataBR(r.data??r.data_inicio??r.data_receita??r.data_empenho)} · {brl(r.valor??r.arrecadado??r.pago??r.remuneracao)}</p>{r.arquivo_url&&<a className="underline" href={String(r.arquivo_url)} target="_blank" rel="noreferrer">Documento</a>}</li>)}</ul>
  {!rows.length&&<p className="text-sm text-muted-foreground">Nenhum registro vinculado.</p>}
  <a className="text-primary underline" href={"/transparencia/"+key}>Consulta detalhada</a></section>;
 })}</section>;
}
