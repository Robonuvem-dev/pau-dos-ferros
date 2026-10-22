import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { moduleQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/servicos")({
  head: () => pageHead("Carta de Serviços", "Serviços oferecidos ao cidadão, requisitos, prazos e formas de acesso (Lei 13.460/2017)."),
  loader: ({ context }) => context.queryClient.ensureQueryData(moduleQuery("servicos")),
  component: Servicos,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Servicos() {
  const { data } = useSuspenseQuery(moduleQuery("servicos"));
  const [q, setQ] = useState("");
  const list = data.filter((s) => !q || JSON.stringify(s).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Carta de Serviços" subtitle="Saiba como acessar os serviços públicos municipais." />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Input placeholder="Pesquisar serviço..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Pesquisar serviço" className="mb-6" />
        <Accordion type="multiple" className="rounded-lg border bg-card">
          {list.map((s) => (
            <AccordionItem key={s.id} value={s.id} className="px-4">
              <AccordionTrigger className="text-left">
                <span><span className="block font-semibold">{String(s.nome)}</span><span className="text-sm font-normal text-muted-foreground">{String(s.secretaria ?? "")}</span></span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                {s.descricao ? <p>{String(s.descricao)}</p> : null}
                <dl className="grid gap-2 sm:grid-cols-3">
                  <div><dt className="font-semibold">Público</dt><dd>{String(s.publico ?? "Todos")}</dd></div>
                  <div><dt className="font-semibold">Prazo</dt><dd>{String(s.prazo ?? "—")}</dd></div>
                  <div><dt className="font-semibold">Custo</dt><dd>{String(s.custo ?? "Gratuito")}</dd></div>
                </dl>
                {s.requisitos ? <p><strong>Requisitos:</strong> {String(s.requisitos)}</p> : null}
                {s.link ? <a href={String(s.link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary">Acessar serviço online <ExternalLink className="size-4" /></a> : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {list.length === 0 && <p className="text-muted-foreground">Nenhum serviço encontrado.</p>}
      </div>
    </>
  );
}
