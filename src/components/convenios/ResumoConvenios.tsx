import { downloadReport } from '@/lib/pdf-report';
import { getModule, formatCell } from '@/lib/modules';
import { useState } from "react";
import { filtrarConvenios } from "@/lib/convenios/relatorios";
import { municipalDate } from "@/lib/public-content";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminModuleQuery } from "@/lib/admin-queries";
import { moduleQuery } from "@/lib/queries";
import { resumoFinanceiroConvenio, type Parcela } from "@/lib/convenios/validacao";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/modules";
import type { Row } from "@/lib/data";

/** M04 — consolidado por convênio, compartilhado pelo painel e pela consulta pública. */
export function ResumoConvenios({ publico = false }: { publico?: boolean }) {
  const [vigentes,setVigentes] = useState(true);
  const [de,setDe] = useState("");
  const [ate,setAte] = useState("");
  const aplicacoes = useQuery(publico ? moduleQuery("convenio-aplicacoes") : adminModuleQuery("convenio-aplicacoes"));
  const convenios = useQuery(publico ? moduleQuery("convenios") : adminModuleQuery("convenios"));
  const parcelas = useQuery(publico ? moduleQuery("convenio-parcelas") : adminModuleQuery("convenio-parcelas"));
  const obrigacoes = useQuery(publico ? moduleQuery("convenio-obrigacoes") : adminModuleQuery("convenio-obrigacoes"));

  const contratos = useQuery(publico ? moduleQuery("contratos") : adminModuleQuery("contratos"));

  const erro = aplicacoes.error || convenios.error || parcelas.error || obrigacoes.error || contratos.error;
  if (erro) return <p role="alert" className="rounded border border-destructive p-3 text-sm">Não foi possível carregar o consolidado de convênios. Confirme se a migração 0009 já foi aplicada ao ambiente.</p>;
  if (aplicacoes.isPending || convenios.isPending || parcelas.isPending || obrigacoes.isPending || contratos.isPending)
    return <p className="rounded border p-3 text-sm text-muted-foreground">Carregando saldos e obrigações dos convênios...</p>;

  const lista = filtrarConvenios((convenios.data ?? []) as Row[], {vigentes,referencia:municipalDate(),de,ate});
  const cronograma = (parcelas.data ?? []) as Row[];
  const deveres = (obrigacoes.data ?? []) as Row[];
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <section className="my-6 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold">Acompanhamento de convênios</h2>
          <p className="text-sm text-muted-foreground">Parcelas, saldo a programar e obrigações vinculadas ao convênio.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void downloadReport("Relatório de convênios", lista.flatMap(c => [{title:String(c.numero),columns:["Campo","Informação"],rows:(getModule("convenios")?.fields??[]).map(f=>[f.label,formatCell(f,c[f.name])])}, ...["convenio-parcelas","convenio-obrigacoes","convenio-aplicacoes"].map(key=>({title:`${String(c.numero)} — ${getModule(key)?.label}`,columns:["Campo","Informação"],rows:(key==="convenio-parcelas"?cronograma:key==="convenio-obrigacoes"?deveres:aplicacoes.data??[]).filter(r=>r.convenio_id===c.id).flatMap(r=>(getModule(key)?.fields??[]).map(f=>[f.label,formatCell(f,r[f.name])]))}))]), `Vigentes: ${vigentes ? "sim" : "todos"} · Período: ${de || "início"} a ${ate || "hoje"}`)}>PDF de convênios</Button>
        {!publico && <div className="flex gap-3 text-sm">
          <Link to="/admin/$module" params={{ module: "convenio-parcelas" }} className="text-primary underline">Gerenciar parcelas</Link>
          <Link to="/admin/$module" params={{ module: "convenio-obrigacoes" }} className="text-primary underline">Gerenciar obrigações</Link>
        </div>}
      </div>
      <div className="my-4 flex flex-wrap items-center gap-4 text-sm">
        <label><input type="checkbox" checked={vigentes} onChange={e=>setVigentes(e.target.checked)} /> Somente vigentes hoje</label>
        <label>Período a partir de <input className="rounded border p-1" type="date" value={de} onChange={e=>setDe(e.target.value)} /></label>
        <label>Até <input className="rounded border p-1" type="date" value={ate} onChange={e=>setAte(e.target.value)} /></label>
        <span>{lista.length} convênio(s)</span>
      </div>
      {!publico && <Link to="/admin/$module" params={{module:'convenio-aplicacoes'}} className="text-primary underline">Detalhar itens do plano de aplicação</Link>}
      {lista.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Nenhum convênio cadastrado.</p> : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary"><tr>
              <th className="p-2">Convênio</th><th className="p-2">Valor global</th>
              <th className="p-2">Parcelas programadas</th><th className="p-2">Recebido</th>
              <th className="p-2">Saldo a programar</th><th className="p-2">Obrigações</th><th className="p-2">Plano de aplicação detalhado</th><th className="p-2">Contratos vinculados</th>
            </tr></thead>
            <tbody>
              {lista.map((c) => {
                const itens: Parcela[] = cronograma.filter(p => p.convenio_id === c.id).map(p => ({
                  valor: Number(p.valor ?? 0),
                  status: (["Programada", "Recebida", "Cancelada"].includes(String(p.status))
                    ? String(p.status) : "Programada") as Parcela["status"],
                }));
                const valor = Number(c.valor_global ?? c.valor ?? 0);
                const resumo = resumoFinanceiroConvenio(valor, Number(c.contrapartida ?? 0), itens);
                const vinculados = (contratos.data ?? []).filter(t => t.convenio_id === c.id || (c.contrato_numero && t.numero === c.contrato_numero));
                const pendentes = deveres.filter(o => o.convenio_id === c.id && o.situacao === "Pendente");
                const atrasadas = pendentes.filter(o => o.vencimento && String(o.vencimento) < hoje);
                return <tr key={c.id} className="border-t align-top">
                  <td className="p-2 font-medium">{publico ? <Link className="text-primary underline" to="/transparencia/$module" params={{module:"convenios"}} search={{registro:c.id}}>{String(c.numero ?? "Sem número")}</Link> : String(c.numero ?? "Sem número")}</td>
                  <td className="p-2">{brl(valor)}</td>
                  <td className="p-2">{publico ? <Link className="text-primary underline" to="/transparencia/$module" params={{module:"convenio-parcelas"}} search={{filtros:{convenio_id:c.id}}}>{brl(resumo.programado)}</Link> : brl(resumo.programado)}</td>
                  <td className="p-2">{brl(resumo.recebido)}
                    {valor > 0 && <div><meter min={0} max={valor} value={Math.min(resumo.recebido, valor)} aria-label={`Valor recebido do convênio ${String(c.numero)}`} /><span className="block text-xs">{(resumo.recebido / valor * 100).toFixed(1)}% recebido</span></div>}
                  </td>
                  <td className="p-2">
                    <span className={resumo.excedido ? "font-bold text-destructive" : ""}>{brl(resumo.saldo)}</span>
                    {resumo.excedido && <span className="block text-xs text-destructive">Parcelas excedem valor global</span>}
                  </td>
                  <td className="p-2">
                    {pendentes.length} pendente(s)
                    {atrasadas.length > 0 && <span className="block font-semibold text-destructive">{atrasadas.length} vencida(s)</span>}
                  </td>
                  <td className="p-2">{(() => {const itens=(aplicacoes.data??[]).filter(a=>a.convenio_id===c.id);const total=itens.reduce((s,a)=>s+Number(a.valor??0),0);return <><ul>{itens.map(a=><li key={a.id}>{publico ? <Link className="text-primary underline" to="/transparencia/$module" params={{module:"convenio-aplicacoes"}} search={{registro:a.id}}>{String(a.natureza)} · {String(a.descricao)}</Link> : <>{String(a.natureza)} · {String(a.descricao)}</>} · {brl(a.valor)}</li>)}</ul><p>Aplicado: {brl(total)} · A detalhar: {brl(valor-total)}</p></>;})()}</td>
                  <td className="p-2">{vinculados.length ? <ul>{vinculados.map(t => <li key={t.id}>{publico ? <Link className="text-primary underline" to="/transparencia/$module" params={{module:"contratos"}} search={{registro:t.id}}>{String(t.numero)}</Link> : String(t.numero)} · {brl(t.valor_atualizado ?? t.valor)}</li>)}</ul> : "Nenhum vínculo cadastrado"}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Saldo a programar = valor global − parcelas não canceladas. Valores de demonstração dependem da origem e da integridade dos cadastros.</p>
    </section>
  );
}
