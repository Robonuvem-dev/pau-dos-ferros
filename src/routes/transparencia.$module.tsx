import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { PublicTable } from "@/components/site/PublicTable";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { getModule } from "@/lib/modules";
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
        <p className="mt-4 text-xs text-muted-foreground">Dados públicos disponibilizados em formato aberto, nos termos da Lei 12.527/2011 e da LC 131/2009.</p>
      </div>
    </>
  );
}
