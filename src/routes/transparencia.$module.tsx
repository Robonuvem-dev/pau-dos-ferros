import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { CovidDetalhado } from "@/components/transparencia/CovidDetalhado";
import { ObrasDetalhadas } from "@/components/transparencia/ObrasDetalhadas";
import { ConselhosDetalhados } from "@/components/transparencia/ConselhosDetalhados";
import { ResumoFiscal } from "@/components/transparencia/ResumoFiscal";
import { ResumoPessoal } from "@/components/transparencia/ResumoPessoal";
import { ResumoConvenios } from "@/components/convenios/ResumoConvenios";
import { PublicTable } from "@/components/site/PublicTable";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { getModule } from "@/lib/modules";
import { moduleQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/transparencia/$module")({
  validateSearch: (s: Record<string, unknown>): { registro?: string; q?: string } => ({ ...(typeof s.registro === 'string' && /^[0-9a-f-]{36}$/i.test(s.registro) ? { registro: s.registro } : {}), ...(typeof s.q === 'string' ? { q: s.q.slice(0, 300) } : {}) }),
  loader: async ({ context, params }) => {
    const mod = getModule(params.module);
    if (!mod || !mod.publico) throw notFound();
    await context.queryClient.ensureQueryData(moduleQuery(mod.key));
    return { label: mod.label, descricao: mod.descricao };
  },
  head: ({ loaderData }) => pageHead(loaderData ? `${loaderData.label} — Transparência` : 'Consulta indisponível', loaderData?.descricao ?? 'Consulta não encontrada no portal da transparência municipal.'),
  component: Consulta,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Consulta() {
  const { module } = Route.useParams();
  const { registro, q } = Route.useSearch();
  const mod = getModule(module);
  if (!mod) return <QueryNotFound />;
  return (
    <>
      <PageHeader title={mod.label} subtitle={mod.descricao}>
        <Link to="/transparencia" className="mt-4 inline-block text-sm underline">← Portal da Transparência</Link>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {["receitas","despesas"].includes(mod.key) && <ResumoFiscal />}
        {mod.key === "servidores" && <ResumoPessoal />}
        <PublicTable key={`${mod.key}-${registro ?? ''}-${q ?? ''}`} mod={mod} registro={registro} initialSearch={q} />
        {mod.key === "covid" && <CovidDetalhado />}
        {mod.key === "obras" && <ObrasDetalhadas />}
        {mod.key === "conselhos" && <ConselhosDetalhados registro={registro} />}
        {mod.key === "convenios" && <ResumoConvenios publico />}
        <p className="mt-4 text-xs text-muted-foreground">Dados públicos disponibilizados em formato aberto, nos termos da Lei 12.527/2011 e da LC 131/2009.</p>
      </div>
    </>
  );
}
