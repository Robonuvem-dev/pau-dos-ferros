<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { moduleQuery, servicosStatsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/servicos-estatisticas")({
  head: () => ({ meta: [{ title: "Estatísticas dos serviços | Painel" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(moduleQuery("servicos")), context.queryClient.ensureQueryData(servicosStatsQuery)]),
  component: Estatisticas,
});

function Estatisticas() {
  const { data: servicos } = useSuspenseQuery(moduleQuery("servicos"));
  const { data: stats } = useSuspenseQuery(servicosStatsQuery);
  const linhas = servicos.map((s) => {
    const st = stats.find((x) => x.servico_id === s.id);
    return { id: String(s.id), nome: String(s.nome), secretaria: String(s.secretaria ?? ""), views: Number(s.visualizacoes ?? 0), aval: Number(st?.avaliacoes ?? 0), media: Number(st?.media ?? 0), uteis: Number(st?.uteis ?? 0) };
  }).sort((a, b) => b.views - a.views);
  const tot = linhas.reduce((t, l) => ({ views: t.views + l.views, aval: t.aval + l.aval }), { views: 0, aval: 0 });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Estatísticas da Carta de Serviços</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4"><div className="text-2xl font-black text-primary">{linhas.length}</div><div className="text-sm">Serviços</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-2xl font-black text-primary">{tot.views}</div><div className="text-sm">Visualizações</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-2xl font-black text-primary">{tot.aval}</div><div className="text-sm">Avaliações</div></div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Serviço</th><th className="p-3">Secretaria</th><th className="p-3 text-right">Visualizações</th><th className="p-3 text-right">Avaliações</th><th className="p-3 text-right">Nota média</th><th className="p-3 text-right">Acharam útil</th></tr></thead>
          <tbody>{linhas.map((l) => <tr key={l.id} className="border-t"><td className="p-3 font-medium">{l.nome}</td><td className="p-3">{l.secretaria}</td><td className="p-3 text-right">{l.views}</td><td className="p-3 text-right">{l.aval}</td><td className="p-3 text-right">{l.aval ? l.media.toLocaleString("pt-BR", {minimumFractionDigits:1,maximumFractionDigits:1}) : "—"}</td><td className="p-3 text-right">{l.aval ? `${Math.round((l.uteis / l.aval) * 100)}%` : "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
=======
import { baixarDocumentoCarta } from "@/lib/documentos-carta";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { moduleQuery, servicosStatsQuery } from "@/lib/queries";
import { pageHead } from '@/lib/seo';

export const Route = createFileRoute("/_authenticated/admin/servicos-estatisticas")({
  head: () => pageHead('Estatísticas dos serviços', 'Acessos e avaliações de satisfação da Carta de Serviços municipal.'),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(moduleQuery("servicos")), context.queryClient.ensureQueryData(servicosStatsQuery)]),
  component: Estatisticas,
});

function Estatisticas() {
  const { data: servicos } = useSuspenseQuery(moduleQuery("servicos"));
  const { data: stats } = useSuspenseQuery(servicosStatsQuery);
  const linhas = servicos.map((s) => {
    const st = stats.find((x) => x.servico_id === s.id);
    return { id: String(s.id), nome: String(s.nome), secretaria: String(s.secretaria ?? ""), solicitacoes: Number(st?.solicitacoes ?? 0), views: Number(s.visualizacoes ?? 0), aval: Number(st?.avaliacoes ?? 0), media: Number(st?.media ?? 0), uteis: Number(st?.uteis ?? 0) };
  }).sort((a, b) => b.views - a.views);
  const tot = linhas.reduce((t, l) => ({ views: t.views + l.views, aval: t.aval + l.aval }), { views: 0, aval: 0 });
  return (
    <div className="space-y-6">
      <Link to="/admin/$module" params={{module:"servico-solicitacoes"}} className="text-primary underline">Tratar solicitações recebidas</Link>
      <Button variant="outline" onClick={()=>void baixarDocumentoCarta("estatisticas").catch(e=>toast.error(e.message))}>Baixar relatório arquivado no banco</Button>
      <h1 className="font-display text-2xl font-bold">Estatísticas da Carta de Serviços</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4"><div className="text-2xl font-black text-primary">{linhas.length}</div><div className="text-sm">Serviços</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-2xl font-black text-primary">{tot.views}</div><div className="text-sm">Visualizações</div></div>
        <div className="rounded-lg border bg-card p-4"><div className="text-2xl font-black text-primary">{tot.aval}</div><div className="text-sm">Avaliações</div></div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Serviço</th><th className="p-3">Secretaria</th><th className="p-3 text-right">Visualizações</th><th className="p-3 text-right">Solicitações</th><th className="p-3 text-right">Avaliações</th><th className="p-3 text-right">Nota média</th><th className="p-3 text-right">Acharam útil</th></tr></thead>
          <tbody>{linhas.map((l) => <tr key={l.id} className="border-t"><td className="p-3 font-medium">{l.nome}</td><td className="p-3">{l.secretaria}</td><td className="p-3 text-right">{l.views}</td><td className="p-3 text-right">{l.solicitacoes}</td><td className="p-3 text-right">{l.aval}</td><td className="p-3 text-right">{l.aval ? l.media.toFixed(1) : "—"}</td><td className="p-3 text-right">{l.aval ? `${Math.round((l.uteis / l.aval) * 100)}%` : "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
>>>>>>> origin/main
