import { PainelIntegracoes } from "@/components/admin/PainelIntegracoes";
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POC_MODULES, pocResourceLabel } from '@/lib/poc-modules';
import { getModule } from '@/lib/modules';
import { pageHead } from '@/lib/seo';
import { QueryNotFound } from '@/components/site/RouteStates';

export const Route = createFileRoute('/_authenticated/admin/poc/$id')({
  loader: ({ params }) => { const mod = POC_MODULES.find(m => m.id === params.id); if (!mod) throw notFound(); return mod; },
  head: ({ loaderData }) => pageHead(loaderData?.title ?? 'Módulo indisponível', 'Cadastros e consultas do módulo do edital da PoC municipal.'),
  component: ModulePage,
  notFoundComponent: QueryNotFound,
});
function ModulePage() {
  const m = Route.useLoaderData();
  return <div>
    <Button asChild variant="ghost" className="mb-4"><Link to="/admin"><ArrowLeft />Todos os módulos</Link></Button>
    <p className="text-sm font-bold text-primary">M{m.id.padStart(2, '0')}</p>
    <h1 className="mb-6 font-display text-3xl font-bold">{m.title}</h1>
    {(m.id === "7" || m.id === "9") && <PainelIntegracoes key={m.id} somenteFolha={m.id === "9"} />}
    <div className="grid gap-3 sm:grid-cols-2">
      {m.pages?.map(p => <Button asChild key={p.to} variant="outline" className="h-auto min-h-16 justify-between whitespace-normal text-left"><Link to={p.to}>{p.label}<ArrowUpRight /></Link></Button>)}
      {m.keys.map(key => <div key={key} className="flex flex-wrap items-center justify-between gap-2 border-b py-3">
        <Button asChild variant="link" className="h-auto justify-start whitespace-normal px-0 text-left"><Link to="/admin/$module" params={{ module: key }}>{pocResourceLabel(key)}<ArrowUpRight /></Link></Button>
        {getModule(key)?.publico && <Button asChild variant="ghost" size="sm"><Link to="/transparencia/$module" params={{ module: key }}>Consulta pública</Link></Button>}
      </div>)}
      {m.publicKeys?.map(key => <Button key={key} asChild variant="outline"><Link to="/transparencia/$module" params={{ module: key }}>{pocResourceLabel(key)}<ArrowUpRight /></Link></Button>)}
    </div>
  </div>;
}