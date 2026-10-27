import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Facebook, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { moduleQuery } from "@/lib/queries";
import { dataBR } from "@/lib/modules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/noticias/$slug")({
  loader: async ({ context, params }) => {
    const all = await context.queryClient.ensureQueryData(moduleQuery("noticias"));
    const n = all.find((x) => x.slug === params.slug);
    if (!n) throw notFound();
    return { titulo: String(n.titulo), resumo: String(n.resumo ?? ""), capa: String(n.capa_url ?? "") };
  },
  head: ({ loaderData }) => {
    const head = pageHead(loaderData?.titulo ?? 'Notícia indisponível', loaderData?.resumo || loaderData?.titulo || 'Notícia não encontrada no portal municipal.');
    if (loaderData?.capa.startsWith('https://')) head.meta.push({ property: 'og:image', content: loaderData.capa }, { name: 'twitter:image', content: loaderData.capa });
    return head;
  },
  component: Noticia,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const youtubeId = (url: string) => url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];

function Noticia() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(moduleQuery("noticias"));
  const n = data.find((x) => x.slug === slug);
  const [share, setShare] = useState('');
  const outras = data.filter((x) => x.slug !== slug).slice(0, 3);
  useEffect(() => { void supabase.rpc("registrar_visualizacao", { _slug: slug }); }, [slug]);
  useEffect(() => { setShare(encodeURIComponent(window.location.href)); }, [slug]);
  if (!n) return <QueryNotFound />;
  const yt = n.video_url ? youtubeId(String(n.video_url)) : undefined;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/noticias" className="text-sm text-primary hover:underline">← Notícias</Link>
      <p className="mt-4 text-sm font-bold uppercase text-accent">{String(n.categoria ?? "Geral")} · {dataBR(n.publicado_em)}</p>
      <h1 className="mt-2 font-display text-3xl font-black leading-tight md:text-4xl">{String(n.titulo)}</h1>
      {n.resumo ? <p className="mt-3 text-lg text-muted-foreground">{String(n.resumo)}</p> : null}
      {n.capa_url ? <img src={String(n.capa_url)} alt="" className="mt-6 w-full rounded-lg" /> : null}
      {n.evento ? <aside className="mt-6 rounded-lg border-l-4 border-accent bg-secondary p-4"><div className="text-xs font-bold uppercase text-accent">Evento</div><div className="font-semibold">{String(n.evento)}</div><div className="text-sm">{[n.evento_data ? dataBR(n.evento_data) : "", n.evento_local ? String(n.evento_local) : ""].filter(Boolean).join(" · ")}</div></aside> : null}
      <div className="mt-6 whitespace-pre-line text-lg leading-relaxed">{String(n.conteudo ?? "")}</div>
      {yt ? <div className="mt-6 aspect-video"><iframe className="h-full w-full rounded-lg" src={`https://www.youtube.com/embed/${yt}`} title="Vídeo da notícia" allowFullScreen /></div> : n.video_url ? <video controls preload="metadata" src={String(n.video_url)} aria-label="Vídeo da notícia" className="mt-6 w-full rounded-lg" /> : null}
      {n.audio_url ? <audio controls src={String(n.audio_url)} className="mt-6 w-full" /> : null}
      {Array.isArray(n.tags) && n.tags.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{n.tags.map((t) => <span key={t} className="rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground">#{t}</span>)}</div>}
      <div className="mt-6 flex gap-3 border-t pt-4 text-sm">
        <span>Compartilhar:</span>
        <a className="inline-flex items-center gap-1 text-primary" href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noreferrer"><Facebook className="size-4" />Facebook</a>
        <a className="inline-flex items-center gap-1 text-primary" href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />WhatsApp</a>
      </div>
      {outras.length > 0 && (
        <aside className="mt-10">
          <h2 className="section-title">Leia também</h2>
          <ul className="mt-4 space-y-2">{outras.map((o) => <li key={o.id}><Link to="/noticias/$slug" params={{ slug: String(o.slug) }} className="text-primary hover:underline">{String(o.titulo)}</Link></li>)}</ul>
        </aside>
      )}
    </article>
  );
}
