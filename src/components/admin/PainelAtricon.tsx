import { useState } from "react";
import { useQuery,useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/data";
import { avaliar,STATUS_LABEL,type AtriconStatus,type EvidenciaAtricon } from "@/lib/atricon";
import { montarAnexo } from "@/lib/atricon-anexo";
import { analisarLocalmente,MODELO_LOCAL } from "@/lib/ai-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
type Pendencia={modulo:string;problema:string};
type Registro={criterio:string;status:AtriconStatus;link:string|null;observacao:string|null};
export function PainelAtricon({pendencias}:{pendencias:Pendencia[]}){
 const qc=useQueryClient();
 const {data:registros=[],error}=useQuery({queryKey:["atricon-avaliacoes"],queryFn:async():Promise<Registro[]>=>{
  const {data,error}=await db.from("atricon_avaliacoes").select("criterio,status,link,observacao");if(error)throw error;return data;
 }});
 const [filtro,setFiltro]=useState("todos"),[drafts,setDrafts]=useState<Record<string,EvidenciaAtricon>>({});
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(""),[texto,setTexto]=useState(""),[erro,setErro]=useState("");
 const manuais=Object.fromEntries(registros.map(r=>[r.criterio,r]));
 const itens=avaliar({},manuais);
 const mudar=(id:string,p:Partial<EvidenciaAtricon>)=>setDrafts(d=>({...d,[id]:{status:"nao_atende",...manuais[id],...d[id],...p}}));
 const salvar=async(id:string)=>{
  setErro("");const v=drafts[id]??manuais[id];if(!v)return;
  if(v.status!=="nao_atende"){
   try{const u=new URL(v.link??"");if(!["http:","https:"].includes(u.protocol)||u.username||u.password||(v.observacao??"").trim().length<10)throw new Error();}
   catch{setErro("Para marcar atendimento ou terceiro, informe URL válida e verificação com pelo menos 10 caracteres.");return;}
  }
  const {error}=await db.from("atricon_avaliacoes").upsert({criterio:id,status:v.status,link:v.link||null,observacao:v.observacao||null});
  if(error){setErro(error.message);return;}setStatus("Evidência "+id+" salva e auditada.");await qc.invalidateQueries({queryKey:["atricon-avaliacoes"]});
 };
 const gerar=async()=>{
  setBusy(true);setErro("");setTexto("");
  try{
   const analise=await analisarLocalmente(pendencias.map(p=>p.problema).join("; ")||"Conferir individualmente as evidências dos 88 itens. Não presumir atendimento.",setStatus);
   const anexo=montarAnexo(itens,pendencias,analise,MODELO_LOCAL,new Date().toISOString());
   const {error}=await db.from("atricon_relatorios").insert({modelo:MODELO_LOCAL,texto:anexo,analise_ia:analise,resultados:itens});
   if(error)throw error;
   setTexto(anexo);setStatus("IA local executada. Anexo com 88 itens salvo e auditado. Revise o texto antes da apresentação.");
  }catch(e){setErro("Não foi possível concluir a análise local: "+(e as Error).message);}
  finally{setBusy(false);}
 };
 const baixar=()=>{
  const url=URL.createObjectURL(new Blob([texto],{type:"text/plain;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="anexo-tecnico-poc.txt";a.click();URL.revokeObjectURL(url);
 };
 return <section className="mb-8 rounded border bg-card p-5" id="atricon">
 <h2 className="font-display text-2xl font-bold">Transparência — avaliação dos 88 pontos</h2>
 <p className="my-2 text-sm">A contagem de cadastros não comprova atendimento. Registre URL, passo executado e resultado de cada ponto. A IA produz sugestões; não aprova requisitos.</p>
 <p className="my-2 text-sm">A análise semântica usa modelo neural gratuito no próprio dispositivo e classifica até 50 alertas por execução. No primeiro uso há download dos arquivos do modelo; não há prompts nem API de IA paga.</p>
 <p className="my-3 font-semibold">{itens.filter(i=>i.status==="atende").length} atendem · {itens.filter(i=>i.status==="nao_atende").length} não atendem · {itens.filter(i=>i.status==="terceiro").length} em portal de terceiro</p>
 <div className="my-3 flex flex-wrap gap-3">
 <label>Mostrar <select className="rounded border p-2" aria-label="Filtrar pontos ATRICON" value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="todos">Todos</option>{Object.entries(STATUS_LABEL).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label>
 <Button disabled={busy||!!error} onClick={()=>void gerar()}>{busy?"Executando análise local...":"Executar varredura com IA local e gerar anexo"}</Button>
 {texto&&<><Button variant="outline" onClick={baixar}>Baixar anexo técnico</Button><Button variant="outline" onClick={()=>window.print()}>Imprimir avaliação</Button></>}
 </div>
 {status&&<p role="status" className="my-2">{status}</p>}
 {(erro||error)&&<p role="alert" className="my-2 text-destructive">{erro||"Não foi possível carregar as evidências."}</p>}
 {texto&&<details className="my-4 rounded border p-3"><summary>Ver anexo técnico gerado</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-sm">{texto}</pre></details>}
 <div className="max-h-[36rem] space-y-2 overflow-y-auto">{itens.filter(i=>filtro==="todos"||i.status===filtro).map(i=>{
  const v=drafts[i.id]??manuais[i.id]??{status:"nao_atende" as const,link:"",observacao:""};
  return <details key={i.id} className="rounded border p-3"><summary className="cursor-pointer"><strong>{i.id}. {i.descricao}</strong> — {STATUS_LABEL[i.status]}</summary>
  <p className="my-2 text-xs">{i.dimensao}</p>
  <select className="my-2 rounded border p-2" aria-label={"Resultado do ponto "+i.id} value={v.status} onChange={e=>mudar(i.id,{status:e.target.value as AtriconStatus})}>{Object.entries(STATUS_LABEL).map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
  <Input className="my-2" aria-label={"URL da evidência "+i.id} placeholder="https://... URL onde o resultado foi verificado" value={v.link??""} onChange={e=>mudar(i.id,{link:e.target.value})}/>
  <Textarea className="my-2" aria-label={"Verificação do ponto "+i.id} placeholder="Passo executado, resultado observado e referência da evidência" value={v.observacao??""} onChange={e=>mudar(i.id,{observacao:e.target.value})}/>
  <Button size="sm" onClick={()=>void salvar(i.id)}>Salvar evidência {i.id}</Button>
  </details>;
 })}</div>
 </section>;
}
