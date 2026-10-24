import { useQuery } from "@tanstack/react-query";
import { moduleQuery } from "@/lib/queries";
import { dataBR } from "@/lib/modules";
export function MunicipioInformacoes(){
 const {data,error}=useQuery(moduleQuery("municipio-informacoes"));
 if(error)return <p role="alert">Não foi possível carregar as informações do município.</p>;
 if(!data)return <p>Carregando informações do município...</p>;
 const categorias=["História","A cidade","Praças","Sítios","Postos de saúde","Distritos","Escolas","Prédios públicos","Eventos","Agenda do gestor"];
 return <div>{categorias.map(c=>{
  const itens=data.filter(r=>r.categoria===c);
  return <section className="mt-8" key={c}><h3 className="font-display text-xl font-bold">{c}</h3>
  {!itens.length&&<p className="text-sm text-muted-foreground">Nenhuma informação cadastrada nesta seção.</p>}
  {itens.map(r=><article key={r.id} className="my-3 rounded border bg-card p-4">
   <h4 className="font-bold">{String(r.titulo)}</h4><p className="whitespace-pre-wrap">{String(r.descricao)}</p>
   {r.foto_url&&<img className="my-3 max-h-60 rounded object-contain" src={String(r.foto_url)} alt={String(r.titulo)}/>}
   {r.endereco&&<p>Endereço: {String(r.endereco)}</p>}{r.horario&&<p>Horário: {String(r.horario)}</p>}{r.contato&&<p>Contato: {String(r.contato)}</p>}{r.data_evento&&<p>Data: {dataBR(r.data_evento)}</p>}
  </article>)}</section>;
 })}</div>;
}