import { formatMaskedValue } from "@/lib/formatting";
import { MunicipioInformacoes } from "@/components/site/MunicipioInformacoes";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail, Phone, UserRound } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { moduleQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/prefeitura")({
  head: () => pageHead("A Prefeitura", "Gestão municipal, prefeito, vice-prefeito e informações institucionais de Aurora das Veredas."),
  loader: ({ context }) => context.queryClient.ensureQueryData(moduleQuery("agentes-politicos")),
  component: Prefeitura,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Prefeitura() {
  const { data } = useSuspenseQuery(moduleQuery("agentes-politicos"));
  return (
    <>
      <PageHeader title="A Prefeitura" subtitle="Conheça a gestão municipal de Aurora das Veredas." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="section-title">Agentes políticos</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {data.map((a) => (
              <div key={a.id} className="flex gap-4 rounded-lg border bg-card p-4">
                {a.foto_url ? <img src={String(a.foto_url)} alt={String(a.nome)} className="size-24 rounded-md object-cover" /> : <div className="grid size-24 place-items-center rounded-md bg-secondary"><UserRound className="size-10 text-primary" /></div>}
                <div>
                  <div className="text-xs font-bold uppercase text-accent">{String(a.cargo)}</div>
                  <div className="font-display text-lg font-bold">{String(a.nome)}</div>
                  {a.partido || a.mandato ? <div className="text-sm text-muted-foreground">{[a.partido, a.mandato].filter(Boolean).map(String).join(" · ")}</div> : null}
                  {a.biografia ? <p className="mt-1 text-sm text-muted-foreground">{String(a.biografia)}</p> : null}
                  <div className="mt-2 space-y-1 text-sm">
                    {a.email ? <div className="flex items-center gap-1"><Mail className="size-4" />{String(a.email)}</div> : null}
                    {a.telefone ? <div className="flex items-center gap-1"><Phone className="size-4" />{formatMaskedValue("phone", a.telefone)}</div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h2 className="section-title mt-12">O município</h2>
          <MunicipioInformacoes />
          <p className="mt-4 leading-relaxed">Aurora das Veredas reúne serviços municipais voltados ao desenvolvimento da cidade e ao bem-estar da população. A Prefeitura atua por meio de suas secretarias para oferecer serviços públicos de qualidade, com transparência e participação popular.</p>
        </section>
        <aside className="space-y-3">
          <h2 className="font-display text-xl font-bold">Acesso rápido</h2>
          <Link to="/secretarias" className="block rounded-lg border bg-card p-4 hover:border-primary">Secretarias e contatos</Link>
          <Link to="/transparencia/$module" params={{ module: "lei" }} className="block rounded-lg border bg-card p-4 hover:border-primary">Leis municipais</Link>
          <Link to="/transparencia/$module" params={{ module: "decreto" }} className="block rounded-lg border bg-card p-4 hover:border-primary">Decretos</Link>
          <Link to="/galeria" className="block rounded-lg border bg-card p-4 hover:border-primary">Galeria de fotos e vídeos</Link>
          <Link to="/esic" className="block rounded-lg border bg-card p-4 hover:border-primary">Fale com a Prefeitura</Link>
        </aside>
      </div>
    </>
  );
}
