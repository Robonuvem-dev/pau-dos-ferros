import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { MODULES } from "@/lib/modules";
import { moduleQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

const ALVOS = MODULES.filter((m) => m.publico || m.key === "noticias" || m.key === "servicos");

export const Route = createFileRoute("/busca")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q.slice(0, 100) : "" }),
  head: () => pageHead("Pesquisa", "Pesquise notícias, serviços, leis, licitações, contratos e demais dados do portal."),
  loader: ({ context }) => Promise.all(ALVOS.map((m) => context.queryClient.ensureQueryData(moduleQuery(m.key)))),
  component: Busca,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Busca() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/busca" });
  const [termo, setTermo] = useState(q);
  const results = useSuspenseQueries({ queries: ALVOS.map((m) => moduleQuery(m.key)) });
  const s = q.trim().toLowerCase();
  const grupos = s.length < 2 ? [] : ALVOS.map((m, i) => ({
    mod: m,
    itens: results[i].data.filter((r) => m.fields.some((f) => String(r[f.name] ?? "").toLowerCase().includes(s))).slice(0, 8),
  })).filter((g) => g.itens.length);

  return (
    <>
      <PageHeader title="Pesquisa no portal" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void navigate({ search: { q: termo } }); }}>
          <Input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Digite o que procura" aria-label="Termo de pesquisa" autoFocus />
          <Button type="submit"><Search />Pesquisar</Button>
        </form>
        {s.length >= 2 && <p className="mt-4 text-sm text-muted-foreground">{grupos.reduce((n, g) => n + g.itens.length, 0)} resultado(s) para “{q}”.</p>}
        {grupos.map(({ mod, itens }) => (
          <section key={mod.key} className="mt-8">
            <h2 className="font-display text-xl font-bold">{mod.label}</h2>
            <ul className="mt-3 divide-y rounded-lg border bg-card">
              {itens.map((r) => {
                const titulo = String(r.titulo ?? r.nome ?? r.numero ?? r.razao_social ?? r.placa ?? r.categoria ?? "Registro");
                const sub = String(r.resumo ?? r.objeto ?? r.ementa ?? r.descricao ?? r.cargo ?? "");
                return (
                  <li key={r.id}>
                    {mod.key === "noticias" ? (
                      <Link to="/noticias/$slug" params={{ slug: String(r.slug) }} className="block p-4 hover:bg-muted"><div className="font-semibold text-primary">{titulo}</div><div className="line-clamp-1 text-sm text-muted-foreground">{sub}</div></Link>
                    ) : mod.key === "servicos" ? (
                      <Link to="/servicos" className="block p-4 hover:bg-muted"><div className="font-semibold text-primary">{titulo}</div><div className="line-clamp-1 text-sm text-muted-foreground">{sub}</div></Link>
                    ) : (
                      <Link to="/transparencia/$module" params={{ module: mod.key }} className="block p-4 hover:bg-muted"><div className="font-semibold text-primary">{titulo}</div><div className="line-clamp-1 text-sm text-muted-foreground">{sub}</div></Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {s.length >= 2 && grupos.length === 0 && <p className="mt-8 text-muted-foreground">Nada encontrado. Tente outro termo.</p>}
      </div>
    </>
  );
}
