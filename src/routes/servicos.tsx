import { baixarDocumentoCarta } from "@/lib/documentos-carta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { SolicitarServico } from "@/components/site/SolicitarServico";
import { useRef, useState } from "react";
import { ExternalLink, FileText, Printer, Star } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { moduleQuery, servicosStatsQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/servicos")({
  head: () => pageHead("Carta de Serviços", "Serviços oferecidos ao cidadão, requisitos, etapas, prazos e formas de acesso (Lei 13.460/2017)."),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(moduleQuery("servicos")),
    context.queryClient.ensureQueryData(servicosStatsQuery),
  ]),
  component: Servicos,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Servicos() {
  const { data } = useSuspenseQuery(moduleQuery("servicos"));
  const { data: stats } = useSuspenseQuery(servicosStatsQuery);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const tags = Array.from(new Set(data.flatMap((s) => (Array.isArray(s.tags) ? s.tags : [])))).sort();
  const list = data.filter((s) => (!q || JSON.stringify(s).toLowerCase().includes(q.toLowerCase())) && (!tag || (Array.isArray(s.tags) && s.tags.includes(tag))));
  const visto = useRef(new Set<string>());
  const abrir = (ids: string[]) => ids.forEach((id) => { if (!visto.current.has(id)) { visto.current.add(id); void supabase.rpc("registrar_visualizacao_servico", { _id: id }).then(({error})=>{if(error){visto.current.delete(id);toast.error("Não foi possível registrar a visualização.");}}); } });
  return (
    <>
      <PageHeader title="Carta de Serviços" subtitle="Saiba como acessar os serviços públicos municipais." />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input placeholder="Pesquisar serviço..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Pesquisar serviço" className="flex-1" />
          <Button variant="outline" onClick={()=>void baixarDocumentoCarta("csv",list.map(s=>s.id)).catch(e=>toast.error(e.message))}>Baixar CSV</Button>
          <Button variant="outline" onClick={()=>void baixarDocumentoCarta("json",list.map(s=>s.id)).catch(e=>toast.error(e.message))}>Baixar JSON</Button>
          <Button variant="outline" asChild><Link to="/servicos/ficha"><Printer />Ficha em branco</Link></Button>
        </div>
        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2" aria-label="Filtrar por tag">
            {["", ...tags].map((t) => (
              <button key={t || "todas"} onClick={() => setTag(t)} aria-pressed={tag === t} className={`rounded-full border px-3 py-1 text-xs ${tag === t ? "bg-primary text-primary-foreground" : "bg-card"}`}>{t || "Todas"}</button>
            ))}
          </div>
        )}
        <Accordion type="multiple" className="rounded-lg border bg-card" onValueChange={abrir}>
          {list.map((s) => {
            const st = stats.find((x) => x.servico_id === s.id);
            const etapas = String(s.etapas ?? "").split("\n").map((e) => e.trim()).filter(Boolean);
            return (
              <AccordionItem key={s.id} value={s.id} className="px-4">
                <AccordionTrigger className="text-left">
                  <span><span className="block font-semibold">{String(s.nome)}</span><span className="text-sm font-normal text-muted-foreground">{String(s.secretaria ?? "")}{st ? ` · nota ${st.media} (${st.avaliacoes})` : ""}</span></span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  {s.descricao ? <p>{String(s.descricao)}</p> : null}
                  <dl className="grid gap-2 sm:grid-cols-4">
                    <div><dt className="font-semibold">Público-alvo</dt><dd>{String(s.publico ?? "Todos")}</dd></div>
                    <div><dt className="font-semibold">Prazo</dt><dd>{String(s.prazo ?? "—")}</dd></div>
                    <div><dt className="font-semibold">Custo</dt><dd>{String(s.custo ?? "Gratuito")}</dd></div>
                    <div><dt className="font-semibold">Atendimento</dt><dd>{String(s.perfil_atendimento ?? "—")}</dd></div>
                  </dl>
                  {s.requisitos ? <p><strong>Requisitos:</strong> {String(s.requisitos)}</p> : null}
                  {etapas.length > 0 && <div><strong>Etapas</strong><ol className="ml-5 list-decimal">{etapas.map((e, i) => <li key={i}>{e}</li>)}</ol></div>}
                  <div className="flex flex-wrap gap-4">
                    {s.link ? <a href={String(s.link)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary">Acessar serviço online <ExternalLink className="size-4" /></a> : null}
                    {s.anexo_url ? <a href={String(s.anexo_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary"><FileText className="size-4" />Formulário</a> : null}
                  </div>
                  {s.parecer_status ? <p className="text-xs text-muted-foreground">Parecer do Ouvidor Geral: {String(s.parecer_status)}</p> : null}
                  <SolicitarServico id={s.id} />
                  <Avaliar id={s.id} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        {list.length === 0 && <p className="text-muted-foreground">Nenhum serviço encontrado.</p>}
      </div>
    </>
  );
}

function Avaliar({ id }: { id: string }) {
  const qc = useQueryClient();
  const [nota, setNota] = useState(0);
  const [enviado, setEnviado] = useState(false);
  if (enviado) return <p className="font-semibold text-primary">Obrigado pela avaliação!</p>;
  const enviar = async (util: boolean) => {
    if (!nota) { toast.error("Escolha uma nota de 1 a 5."); return; }
    const { error } = await supabase.rpc("avaliar_servico", { _servico: id, _nota: nota, _util: util, _comentario: "" });
    if (error) { toast.error("Não foi possível registrar a avaliação."); return; }
    setEnviado(true);
    void qc.invalidateQueries({ queryKey: servicosStatsQuery.queryKey });
  };
  return (
    <div className="rounded-md border bg-secondary p-3">
      <p className="mb-2 font-semibold">Este serviço foi útil?</p>
      <div className="mb-2 flex gap-1" role="radiogroup" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={nota === n} aria-label={`Nota ${n}`} onClick={() => setNota(n)}>
            <Star className={`size-6 ${n <= nota ? "fill-accent text-accent" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <div className="flex gap-2"><Button size="sm" onClick={() => enviar(true)}>Sim, foi útil</Button><Button size="sm" variant="outline" onClick={() => enviar(false)}>Não foi útil</Button></div>
    </div>
  );
}
