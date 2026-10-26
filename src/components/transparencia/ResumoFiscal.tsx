import { Button } from '@/components/ui/button';
import { downloadReport } from '@/lib/pdf-report';
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { moduleQuery } from "@/lib/queries";
import { brl } from "@/lib/modules";
import { resumoFiscal } from "@/lib/fiscal";
export function ResumoFiscal() {
 const receitas=useQuery({...moduleQuery("receitas"),refetchInterval:15_000});
 const despesas=useQuery({...moduleQuery("despesas"),refetchInterval:15_000});
 const [ano,setAno]=useState(""),[natureza,setNatureza]=useState("");
 if(receitas.error||despesas.error)return <p role="alert">Não foi possível carregar o comparativo fiscal.</p>;
 if(!receitas.data||!despesas.data)return <p>Carregando comparativo fiscal...</p>;
 const anos=[...new Set([...receitas.data,...despesas.data].map(r=>String(r.ano)))].sort().reverse();
 const r=resumoFiscal(receitas.data,despesas.data,ano,natureza);
 return <section className="my-5 rounded border bg-card p-5">
  <h2 className="font-display text-xl font-bold">Comparativo fiscal</h2>
  <p className="my-2 text-sm">Totais dos registros disponíveis, atualizados a cada 15 segundos. Selecione o exercício para comparar períodos equivalentes.</p>
  <div className="my-3 flex flex-wrap gap-3">
   <label>Exercício <select aria-label="Exercício do comparativo" className="rounded border p-2" value={ano} onChange={e=>setAno(e.target.value)}><option value="">Todos</option>{anos.map(a=><option key={a}>{a}</option>)}</select></label>
   <label>Natureza <select aria-label="Natureza do comparativo" className="rounded border p-2" value={natureza} onChange={e=>setNatureza(e.target.value)}><option value="">Todas</option>{["Orçamentária","Extraorçamentária","Sem classificação"].map(n=><option key={n}>{n}</option>)}</select></label>
   <Button variant="outline" onClick={() => void downloadReport("Comparativo fiscal", [{ title: "Totais", columns: ["Indicador", "Valor"], rows: Object.entries(r).map(([k,v]) => [k, brl(v)]) }], `Exercício: ${ano || "todos"} · Natureza: ${natureza || "todas"}`)}>PDF do comparativo</Button>
  </div>
  <dl className="grid gap-3 sm:grid-cols-3">{([["Receita prevista",r.previsto],["Receita arrecadada",r.arrecadado],["Empenhado",r.empenhado],["Liquidado",r.liquidado],["Pago",r.pago],["A liquidar",r.aLiquidar],["A pagar",r.aPagar]] as const).map(([l,v])=><div key={l} className="rounded bg-secondary p-3"><dt>{l}</dt><dd className="text-lg font-bold">{brl(v)}</dd></div>)}</dl>
  {(r.aLiquidar<0||r.aPagar<0)&&<p role="alert" className="mt-3 text-destructive">Há valores acumulados inconsistentes: conferir liquidações e pagamentos na origem.</p>}
 </section>;
}
