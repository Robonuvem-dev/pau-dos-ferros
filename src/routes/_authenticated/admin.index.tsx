import { GestaoEsic } from "@/components/admin/GestaoEsic";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { countsQuery, noticiasStatsQuery } from "@/lib/admin-queries";
import { MODULES } from "@/lib/modules";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { POC_MODULES, WEBMAIL_URL } from '@/lib/poc-modules';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Landmark, Mail } from 'lucide-react';
import { pageHead } from '@/lib/seo';

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => pageHead('Módulos da PoC — Painel', 'Acesso aos 16 módulos do edital e visão geral do portal municipal.'),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(countsQuery), context.queryClient.ensureQueryData(noticiasStatsQuery)]),
  component: Painel,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Painel() {
  const { data: counts } = useSuspenseQuery(countsQuery);
  const { data: stats } = useSuspenseQuery(noticiasStatsQuery);
  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-bold">Módulos da PoC</h1>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POC_MODULES.map(m => <Button key={m.id} asChild variant="outline" className="h-auto min-h-40 items-stretch whitespace-normal rounded-lg p-5 text-left">
            {m.id === '16' ? <a href={WEBMAIL_URL} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-4"><span className="flex w-full items-center justify-between text-primary"><Mail /><span className="text-xs font-bold">M16</span></span><span className="flex w-full items-end justify-between gap-3"><span className="font-display text-base font-bold">{m.title}</span><ArrowUpRight /></span></a>
              : <Link to="/admin/poc/$id" params={{ id: m.id }} className="flex flex-col gap-4"><span className="flex w-full items-center justify-between text-primary"><Landmark /><span className="text-xs font-bold">M{m.id.padStart(2,'0')}</span></span><span className="flex w-full items-end justify-between gap-3"><span className="font-display text-base font-bold">{m.title}</span><ArrowUpRight /></span></Link>}
          </Button>)}
        </div>
      </section>
      <h2 className="font-display text-2xl font-bold">Visão geral</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card n={counts["noticias"] ?? 0} t="Notícias" />
        <Card n={stats.total} t="Visualizações de notícias" />
        <Card n={counts["licitacoes"] ?? 0} t="Licitações" />
      </div>
      <section>
        <h2 className="mb-3 font-bold">Notícias mais lidas (atualiza a cada 15 s)</h2>
        <ul className="divide-y rounded-lg border bg-card">{stats.top.map((n) => <li key={n.id} className="flex justify-between p-3 text-sm"><span>{n.titulo}</span><strong>{n.visualizacoes}</strong></li>)}</ul>
      </section>
      <GestaoEsic />
      <section>
        <h2 className="mb-3 font-bold">Cadastros</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => <Link key={m.key} to="/admin/$module" params={{ module: m.key }} className="flex justify-between rounded-lg border bg-card p-3 hover:border-primary"><span>{m.label}</span><strong>{counts[m.key] ?? 0}</strong></Link>)}
        </div>
      </section>
    </div>
  );
}

function Card({ n, t }: { n: number; t: string }) {
  return <div className="rounded-lg border bg-card p-4"><div className="text-3xl font-black text-primary">{n}</div><div className="text-sm text-muted-foreground">{t}</div></div>;
}
