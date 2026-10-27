import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { moduleQuery } from "@/lib/queries";
import { dataBR } from "@/lib/modules";
import { pageHead } from "@/lib/seo";
import type { Row } from "@/lib/data";
import hero from "@/assets/hero-cidade.jpg";

export const Route = createFileRoute("/galeria")({
  head: () => pageHead("Galeria", "Fotos, vídeos e áudios das ações da Prefeitura de Aurora das Veredas."),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(moduleQuery("albuns")), context.queryClient.ensureQueryData(moduleQuery("midias"))]),
  component: Galeria,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const yt = (u: string) => u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];

function Galeria() {
  const { data: albuns } = useSuspenseQuery(moduleQuery("albuns"));
  const { data: midias } = useSuspenseQuery(moduleQuery("midias"));
  const [aberto, setAberto] = useState<Row | null>(null);
  return (
    <>
      <PageHeader title="Galeria" subtitle="Fotos, vídeos e áudios." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="section-title">Álbuns de fotos</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albuns.map((a) => (
            <button key={a.id} onClick={() => setAberto(a)} className="overflow-hidden rounded-lg border bg-card text-left shadow-card">
              <img src={a.capa_url ? String(a.capa_url) : (Array.isArray(a.fotos) && a.fotos[0]) || hero} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              <div className="p-4"><div className="font-semibold">{String(a.titulo)}</div><div className="text-sm text-muted-foreground">{dataBR(a.data)} · {Array.isArray(a.fotos) ? a.fotos.length : 0} foto(s)</div></div>
            </button>
          ))}
        </div>
        {albuns.length === 0 && <p className="mt-4 text-muted-foreground">Nenhum álbum publicado.</p>}
        <h2 className="section-title mt-14">Vídeos e áudios</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {midias.map((m) => {
            const id = m.url ? yt(String(m.url)) : undefined;
            return (
              <div key={m.id} className="rounded-lg border bg-card p-4">
                <div className="mb-3 font-semibold">{String(m.titulo)}</div>
                {m.tipo === "audio" ? <audio controls src={String(m.url ?? "")} className="w-full" /> : id ? <iframe className="aspect-video w-full rounded" src={`https://www.youtube.com/embed/${id}`} title={String(m.titulo)} allowFullScreen /> : m.url ? <video controls src={String(m.url)} className="w-full rounded" /> : null}
              </div>
            );
          })}
        </div>
        {midias.length === 0 && <p className="mt-4 text-muted-foreground">Nenhum vídeo ou áudio publicado.</p>}
      </div>
      <Dialog open={!!aberto} onOpenChange={(o) => !o && setAberto(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>{String(aberto?.titulo ?? "")}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">{(Array.isArray(aberto?.fotos) ? aberto.fotos : []).map((f, i) => { const leg = String(aberto?.legendas ?? "").split("\n")[i]?.trim(); return <figure key={f}><img src={f} alt={leg || `Foto ${i + 1} do álbum`} className="w-full rounded" />{leg ? <figcaption className="mt-1 text-sm text-muted-foreground">{leg}</figcaption> : null}</figure>; })}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
