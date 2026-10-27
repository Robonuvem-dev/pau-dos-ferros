import { formatMaskedValue } from "@/lib/formatting";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { moduleQuery } from "@/lib/queries";
import { brl } from "@/lib/modules";
import { agruparPessoal } from "@/lib/fiscal";
export function ResumoPessoal() {
 const {data,error}=useQuery({...moduleQuery("servidores"),refetchInterval:15_000});
 const [por,setPor]=useState<"cargo"|"lotacao"|"vinculo">("cargo"),[competencia,setCompetencia]=useState("");
 if(error)return <p role="alert">Não foi possível carregar o detalhamento de pessoal.</p>;
 if(!data)return <p>Carregando pessoal...</p>;
 const competencias=[...new Set(data.map(r=>String(r.competencia??"")).filter(Boolean))].sort().reverse();
 const rows=agruparPessoal(data,por,competencia);
 return <section className="my-5 rounded border bg-card p-5"><h2 className="font-display text-xl font-bold">Quadro de pessoal por competência</h2>
 <p className="my-2 text-sm">Cada registro corresponde a um servidor em uma competência. Sem filtro de competência, os quantitativos somam os registros de todos os períodos.</p>
 <div className="my-3 flex flex-wrap gap-3">
 <label>Agrupar por <select aria-label="Agrupamento de pessoal" className="rounded border p-2" value={por} onChange={e=>setPor(e.target.value as typeof por)}><option value="cargo">Cargo</option><option value="lotacao">Secretaria</option><option value="vinculo">Vínculo</option></select></label>
 <label>Competência <select aria-label="Competência de pessoal" className="rounded border p-2" value={competencia} onChange={e=>setCompetencia(e.target.value)}><option value="">Todas</option>{competencias.map(c=><option key={c} value={c}>{formatMaskedValue("month",c)}</option>)}</select></label>
 <button className="rounded border px-3" onClick={()=>window.print()}>Imprimir quadro</button>
 </div>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{["Grupo","Registros","Remuneração","Subsídio/base","Vantagens","Descontos"].map(h=><th key={h} className="border p-2 text-left">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.grupo}><td className="border p-2">{r.grupo}</td><td className="border p-2">{r.pessoas}</td>{[r.remuneracao,r.subsidio,r.vantagens,r.descontos].map((v,i)=><td key={i} className="border p-2">{brl(v)}</td>)}</tr>)}</tbody></table></div></section>;
}
