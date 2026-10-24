import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ResumoConvenios } from "@/components/convenios/ResumoConvenios";
import { PublicTable } from "@/components/site/PublicTable";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dataBR, getModule } from "@/lib/modules";
import { moduleQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/transparencia/$module")({
  loader: async ({ context, params }) => {
    const mod = getModule(params.module);
    if (!mod || !mod.publico) throw notFound();
    await context.queryClient.ensureQueryData(moduleQuery(mod.key));
    return { label: mod.label, descricao: mod.descricao };
  },
  head: ({ loaderData }) => loaderData ? pageHead(`${loaderData.label} — Transparência`, loaderData.descricao) : { meta: [{ title: "Consulta indisponível | Prefeitura de Pau dos Ferros" }, { name: "robots", content: "noindex" }] },
  component: Consulta,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Consulta() {
  const { module } = Route.useParams();
  const mod = getModule(module)!;
  return (
    <>
      <PageHeader title={mod.label} subtitle={mod.descricao}>
        <Link to="/transparencia" className="mt-4 inline-block text-sm underline">← Portal da Transparência</Link>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PublicTable mod={mod} />
        {mod.key === "convenios" && <ResumoConvenios publico />}
        {mod.key === "concurso" && <EtapasConcursos />}
        {mod.key === "licitacoes" && <LinhaDoTempo />}
        <p className="mt-4 text-xs text-muted-foreground">Dados públicos disponibilizados em formato aberto, nos termos da Lei 12.527/2011 e da LC 131/2009.</p>
      </div>
    </>
  );
}

function LinhaDoTempo() {
  const { data } = useSuspenseQuery(moduleQuery("andamentos-licitacao"));
  const porLicitacao = new Map<string, typeof data>();
  for (const a of data) {
    const k = String(a.licitacao_numero ?? "");
    if (!k) continue;
    porLicitacao.set(k, [...(porLicitacao.get(k) ?? []), a]);
  }
  if (!porLicitacao.size) return null;
  return (
    <section className="mt-10">
      <h2 className="section-title">Andamento dos processos</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[...porLicitacao.entries()].map(([numero, itens]) => (
          <div key={numero} className="rounded-lg border bg-card p-5">
            <h3 className="font-display text-lg font-bold">{numero}</h3>
            <ol className="mt-3 space-y-2 border-l-2 border-primary pl-4 text-sm">
              {itens
                .slice()
                .sort((a, b) => String(a.data ?? "").localeCompare(String(b.data ?? "")))
                .map((a) => (
                  <li key={a.id}>
                    <strong>{String(a.fase)}</strong>
                    {a.data ? ` · ${dataBR(a.data)}` : ""}
                    {a.descricao ? <span className="block text-muted-foreground">{String(a.descricao)}</span> : null}
                    {a.arquivo_url ? <a className="block text-primary underline" href={String(a.arquivo_url)} target="_blank" rel="noreferrer">Anexo</a> : null}
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

function EtapasConcursos() {
  const { data } = useSuspenseQuery(moduleQuery("concurso"));
  const comEtapas = data.filter((c) => String(c.etapas ?? "").trim());
  if (!comEtapas.length) return null;
  return (
    <section className="mt-10">
      <h2 className="section-title">Etapas dos concursos e seletivos</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {comEtapas.map((c) => (
          <div key={c.id} className="rounded-lg border bg-card p-5">
            <div className="text-xs font-bold uppercase text-accent">{String(c.situacao ?? "")} {c.data ? `· ${dataBR(c.data)}` : ""}</div>
            <h3 className="font-display text-lg font-bold">{String(c.titulo)}</h3>
            <ol className="mt-3 space-y-2 border-l-2 border-primary pl-4 text-sm">
              {String(c.etapas).split("\n").filter((l) => l.trim()).map((l) => <li key={l}>{l}</li>)}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
