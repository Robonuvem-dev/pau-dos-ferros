import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { moduleQuery } from "@/lib/queries";
import { dataBR } from "@/lib/modules";
import { pageHead } from "@/lib/seo";
import hero from "@/assets/hero-cidade.jpg";

export const Route = createFileRoute("/noticias/")({
  head: () => pageHead("Notícias", "Notícias, ações e comunicados oficiais da Prefeitura de Pau dos Ferros."),
  loader: ({ context }) => context.queryClient.ensureQueryData(moduleQuery("noticias")),
  component: Noticias,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Noticias() {
  const { data } = useSuspenseQuery(moduleQuery("noticias"));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const cats = [...new Set(data.map((n) => String(n.categoria ?? "Geral")))];
  const list = data.filter((n) => (!cat || n.categoria === cat) && (!q || `${n.titulo} ${n.resumo}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageHeader title="Notícias" subtitle="Acompanhe as ações da Prefeitura." />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Input className="max-w-sm" placeholder="Pesquisar notícias..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Pesquisar notícias" />
          <select aria-label="Categoria" className="h-9 rounded-md border border-input bg-card px-3 text-sm" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((n) => (
            <Link key={n.id} to="/noticias/$slug" params={{ slug: String(n.slug) }} className="group overflow-hidden rounded-lg border bg-card shadow-card">
              <img src={n.capa_url ? String(n.capa_url) : hero} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              <div className="p-4">
                <span className="text-xs font-bold uppercase text-accent">{String(n.categoria ?? "Geral")} · {dataBR(n.publicado_em)}</span>
                <h2 className="mt-1 font-display text-lg font-bold leading-snug group-hover:text-primary">{String(n.titulo)}</h2>
                {n.resumo ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{String(n.resumo)}</p> : null}
              </div>
            </Link>
          ))}
        </div>
        {list.length === 0 && <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>}
      </div>
    </>
  );
}
