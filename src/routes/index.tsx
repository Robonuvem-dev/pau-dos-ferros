import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Building2, ClipboardList, FileSearch, Gavel, Hammer, Headphones, Landmark, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { configQuery, moduleQuery } from "@/lib/queries";
import { Facebook, ExternalLink } from "lucide-react";
import { dataBR } from "@/lib/modules";
import { pageHead } from "@/lib/seo";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import hero from "@/assets/hero-cidade.jpg";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [, banners] = await Promise.all([
    context.queryClient.ensureQueryData(moduleQuery("noticias")),
    context.queryClient.ensureQueryData(moduleQuery("banners")),
    context.queryClient.ensureQueryData(moduleQuery("servicos")),
    context.queryClient.ensureQueryData(moduleQuery("links-uteis")),
    context.queryClient.ensureQueryData(configQuery),
    ]);
    return { image: String(banners[0]?.imagem_url ?? '') };
  },
  head: ({ loaderData }) => {
    const head = pageHead("Início", "Portal oficial da Prefeitura de Pau dos Ferros/RN: notícias, serviços ao cidadão, transparência, licitações e ouvidoria.");
    if (loaderData?.image.startsWith('https://')) head.meta.push({ property: 'og:image', content: loaderData.image }, { name: 'twitter:image', content: loaderData.image });
    return head;
  },
  component: Home,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const ATALHOS = [
  { label: "Portal da Transparência", icon: Landmark, to: "/transparencia" as const },
  { label: "Licitações", icon: Gavel, mod: "licitacoes" },
  { label: "Contratos", icon: ClipboardList, mod: "contratos" },
  { label: "Obras públicas", icon: Hammer, mod: "obras" },
  { label: "Servidores", icon: Users, mod: "servidores" },
  { label: "Concursos e seletivos", icon: FileSearch, mod: "concurso" },
  { label: "Secretarias", icon: Building2, to: "/secretarias" as const },
  { label: "Ouvidoria e e-SIC", icon: Headphones, to: "/esic" as const },
];

function Home() {
  const { data: noticias } = useSuspenseQuery(moduleQuery("noticias"));
  const { data: banners } = useSuspenseQuery(moduleQuery("banners"));
  const { data: servicos } = useSuspenseQuery(moduleQuery("servicos"));
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data: links } = useSuspenseQuery(moduleQuery("links-uteis"));
  const { data: config } = useSuspenseQuery(configQuery);
  const vigentes = banners;
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (vigentes.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % vigentes.length), 6000);
    return () => clearInterval(t);
  }, [vigentes.length]);
  const banner = vigentes[slide % Math.max(vigentes.length, 1)];
  const [destaque, ...outras] = noticias;

  return (
    <>
      <section className="relative overflow-hidden">
        <img src={banner ? String(banner.imagem_url) : hero} alt={banner ? String(banner.titulo) : "Vista da cidade de Pau dos Ferros"} width={1600} height={768} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/95 via-primary-deep/70 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-primary-foreground md:py-28">
          <span className="inline-block rounded bg-highlight px-3 py-1 text-sm font-bold uppercase tracking-wide text-highlight-foreground">Avançando com você</span>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-black uppercase leading-tight md:text-6xl">Prefeitura de Pau dos Ferros</h1>
          <p className="mt-3 max-w-xl text-lg opacity-95">Serviços, notícias e as contas do município em um só lugar.</p>
          <form className="mt-8 flex max-w-xl gap-2" onSubmit={(e) => { e.preventDefault(); void navigate({ to: "/busca", search: { q } }); }}>
            <label htmlFor="busca-home" className="sr-only">O que você procura?</label>
            <Input id="busca-home" value={q} onChange={(e) => setQ(e.target.value)} placeholder="O que você procura? Ex.: matrícula, licitação, IPTU" className="h-12 bg-card text-foreground" />
            <Button type="submit" size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90"><Search />Buscar</Button>
          </form>
          {banner?.link && <Button asChild variant="secondary" className="mt-4 max-w-full whitespace-normal"><a href={String(banner.link)}>{String(banner.titulo)}<ExternalLink /></a></Button>}
          {vigentes.length > 1 && <div className="mt-6 flex gap-2" aria-label="Banners">
            {vigentes.map((b, i) => <Button key={b.id} variant="ghost" size="icon" aria-label={`Banner ${i + 1}: ${String(b.titulo)}`} aria-current={i === slide % vigentes.length} onClick={() => setSlide(i)} className="size-8"><span className={`h-2 w-6 rounded-full ${i === slide % vigentes.length ? "bg-highlight" : "bg-primary-foreground"}`} /></Button>)}
          </div>}
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-card p-4 shadow-card md:grid-cols-4">
          {ATALHOS.map((a) => {
            const inner = <><a.icon className="size-7 text-accent" /><span className="text-sm font-semibold">{a.label}</span></>;
            const cls = "flex flex-col items-center gap-2 rounded-lg p-4 text-center transition hover:bg-secondary";
            return a.mod
              ? <Link key={a.label} to="/transparencia/$module" params={{ module: a.mod }} className={cls}>{inner}</Link>
               : a.to ? <Link key={a.label} to={a.to} className={cls}>{inner}</Link> : null;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="section-title">Notícias</h2>
          <Link to="/noticias" className="text-sm font-semibold text-primary hover:underline">Todas as notícias →</Link>
        </div>
        {destaque ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <NewsCard n={destaque} big />
            <div className="grid gap-4">{outras.slice(0, 3).map((n) => <NewsCard key={n.id} n={n} />)}</div>
          </div>
        ) : <p className="text-muted-foreground">Nenhuma notícia publicada ainda.</p>}
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="section-title">Serviços ao cidadão</h2>
            <Link to="/servicos" className="text-sm font-semibold text-primary hover:underline">Carta de serviços →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {servicos.slice(0, 6).map((s) => (
              <Link key={s.id} to="/servicos" className="rounded-lg border bg-card p-5 transition hover:border-primary">
                <div className="font-semibold">{String(s.nome)}</div>
                <div className="mt-1 text-sm text-muted-foreground">{String(s.secretaria ?? "")}</div>
              </Link>
            ))}
            {servicos.length === 0 && <p className="text-muted-foreground">A carta de serviços será publicada em breve.</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="section-title mb-6">Links úteis</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {links.map((l) => (
              <a key={l.id} href={String(l.url)} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border bg-card p-4 font-semibold transition hover:border-primary">
                {String(l.titulo)}<ExternalLink className="size-4 text-accent" />
              </a>
            ))}
            {links.length === 0 && <p className="text-muted-foreground">Nenhum link cadastrado.</p>}
          </div>
        </div>
        {config.facebook_url ? (
          <div>
            <h2 className="section-title mb-6 flex items-center gap-2"><Facebook className="size-6" />Facebook</h2>
            <iframe title="Página oficial da Prefeitura no Facebook" className="h-[500px] w-full rounded-lg border bg-card"
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(config.facebook_url)}&tabs=timeline&width=360&height=500&small_header=true&hide_cover=false`} />
          </div>
        ) : null}
      </section>
    </>
  );
}

function NewsCard({ n, big }: { n: Record<string, unknown>; big?: boolean }) {
  return (
    <Link to="/noticias/$slug" params={{ slug: String(n.slug) }} className={`group overflow-hidden rounded-lg border bg-card shadow-card ${big ? "" : "flex"}`}>
      <img src={n.capa_url ? String(n.capa_url) : hero} alt="" loading="lazy" className={big ? "aspect-video w-full object-cover" : "w-36 shrink-0 object-cover"} />
      <div className="p-4">
        <span className="text-xs font-bold uppercase text-accent">{String(n.categoria ?? "Geral")} · {dataBR(n.publicado_em)}</span>
        <h3 className={`mt-1 font-display font-bold leading-snug group-hover:text-primary ${big ? "text-2xl" : "text-base"}`}>{String(n.titulo)}</h3>
        {big && n.resumo ? <p className="mt-2 text-muted-foreground">{String(n.resumo)}</p> : null}
      </div>
    </Link>
  );
}
