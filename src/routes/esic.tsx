import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { supabase } from "@/integrations/supabase/client";
import { estatisticasQuery } from "@/lib/queries";
import { dataBR } from "@/lib/modules";
import { pageHead } from "@/lib/seo";
import { db } from "@/lib/data";

export const Route = createFileRoute("/esic")({
  head: () => pageHead("Ouvidoria e e-SIC", "Faça pedidos de informação, reclamações, sugestões e elogios, e acompanhe pelo número de protocolo."),
  loader: ({ context }) => context.queryClient.ensureQueryData(estatisticasQuery),
  component: Esic,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const TIPOS = {
  esic: ["Pedido de informação"],
  ouvidoria: ["Reclamação", "Denúncia", "Sugestão", "Elogio", "Solicitação"],
  lgpd: ["Acesso aos meus dados", "Correção de dados", "Exclusão de dados", "Revogação de consentimento"],
};

const FAQ: [string, string][] = [
  ["Preciso me identificar para pedir informação?", "Para pedidos do e-SIC é necessário informar um nome e um contato para envio da resposta. Na Ouvidoria você pode registrar de forma anônima."],
  ["Qual o prazo de resposta?", "Até 20 dias, prorrogáveis por mais 10 mediante justificativa (art. 11 da Lei 12.527/2011). Na Ouvidoria, até 30 dias (Lei 13.460/2017)."],
  ["Como acompanho meu pedido?", "Guarde o número de protocolo exibido após o envio e consulte na aba “Consultar protocolo”."],
  ["Posso recorrer da resposta?", "Sim. Em até 10 dias após a resposta, registre um novo pedido informando o protocolo original e o motivo do recurso."],
];

function Esic() {
  const { data: stats } = useSuspenseQuery(estatisticasQuery);
  const total = stats.reduce((s, r) => s + r.total, 0);
  const respondidos = stats.filter((r) => r.status === "Respondido").reduce((s, r) => s + r.total, 0);
  return (
    <>
      <PageHeader title="Ouvidoria e e-SIC" subtitle="Serviço de Informação ao Cidadão e canal de manifestações." />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[2fr_1fr]">
        <Tabs defaultValue="novo">
          <TabsList><TabsTrigger value="novo">Nova manifestação</TabsTrigger><TabsTrigger value="consulta">Consultar protocolo</TabsTrigger></TabsList>
          <TabsContent value="novo"><NovoPedido /></TabsContent>
          <TabsContent value="consulta"><Consulta /></TabsContent>
        </Tabs>
        <aside className="space-y-6">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Relatório estatístico</h2>
            <p className="mt-1 text-sm text-muted-foreground">Total de manifestações recebidas</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded bg-secondary p-3"><div className="text-2xl font-black text-primary">{total}</div><div className="text-xs">Recebidas</div></div>
              <div className="rounded bg-secondary p-3"><div className="text-2xl font-black text-primary">{respondidos}</div><div className="text-xs">Respondidas</div></div>
            </div>
            <ul className="mt-3 space-y-1 text-sm">{stats.map((s) => <li key={s.canal + s.status} className="flex justify-between"><span className="uppercase">{s.canal} · {s.status}</span><strong>{s.total}</strong></li>)}</ul>
          </div>
          <div className="rounded-lg border bg-card p-5 text-sm">
            <h2 className="font-display text-lg font-bold">Atendimento presencial (SIC)</h2>
            <p className="mt-2">Av. Getúlio Vargas, 1323, Centro — Pau dos Ferros/RN</p>
            <p>(84) 3351-2000 · Seg a Sex, 7h às 13h</p>
          </div>
        </aside>
        <section className="lg:col-span-2">
          <h2 className="section-title">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-4 rounded-lg border bg-card px-4">
            {FAQ.map(([p, r]) => <AccordionItem key={p} value={p}><AccordionTrigger>{p}</AccordionTrigger><AccordionContent>{r}</AccordionContent></AccordionItem>)}
          </Accordion>
        </section>
      </div>
    </>
  );
}

export function NovoPedido({ canalFixo }: { canalFixo?: keyof typeof TIPOS }) {
  const [canal, setCanal] = useState<keyof typeof TIPOS>(canalFixo ?? "esic");
  const [form, setForm] = useState({ tipo: TIPOS[canalFixo ?? "esic"][0] ?? "", nome: "", email: "", telefone: "", assunto: "", mensagem: "", anonimo: false });
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }) as typeof f);
  const anonimoPermitido = canal === "ouvidoria";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.anonimo && (!form.nome.trim() || !form.email.trim())) { toast.error("Informe nome e e-mail para receber a resposta."); return; }
    if (form.assunto.trim().length < 3 || form.mensagem.trim().length < 10) { toast.error("Descreva o assunto e a mensagem (mínimo de 10 caracteres)."); return; }
    setSending(true);
    const { data, error } = await supabase.rpc("registrar_atendimento", {
      _canal: canal, _tipo: form.tipo, _nome: form.anonimo ? "" : form.nome, _email: form.anonimo ? "" : form.email,
      _telefone: form.anonimo ? "" : form.telefone, _anonimo: form.anonimo, _assunto: form.assunto, _mensagem: form.mensagem,
    });
    setSending(false);
    if (error) { toast.error("Não foi possível registrar. Tente novamente."); return; }
    setProtocolo(data);
  };

  if (protocolo) return (
    <div className="mt-4 rounded-lg border-2 border-teal bg-card p-6">
      <h2 className="font-display text-2xl font-bold">Manifestação registrada</h2>
      <p className="mt-2">Seu número de protocolo é:</p>
      <p className="mt-2 font-mono text-3xl font-black text-primary">{protocolo}</p>
      <p className="mt-3 text-sm text-muted-foreground">Guarde este número para acompanhar sua manifestação.</p>
      <Button className="mt-4" variant="outline" onClick={() => { setProtocolo(null); setForm((f) => ({ ...f, assunto: "", mensagem: "" })); }}>Registrar outra</Button>
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 rounded-lg border bg-card p-6">
      {!canalFixo && (
        <div className="grid gap-1.5">
          <Label htmlFor="canal">Canal</Label>
          <select id="canal" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={canal} onChange={(e) => { const c = e.target.value as keyof typeof TIPOS; setCanal(c); setForm((f) => ({ ...f, tipo: TIPOS[c][0] ?? "", anonimo: false })); }}>
            <option value="esic">e-SIC — Pedido de informação</option>
            <option value="ouvidoria">Ouvidoria</option>
            <option value="lgpd">Direitos do titular (LGPD)</option>
          </select>
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="tipo">Tipo</Label>
        <select id="tipo" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
          {TIPOS[canal].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      {anonimoPermitido && <div className="flex items-center gap-2"><Switch id="anonimo" checked={form.anonimo} onCheckedChange={(v) => set("anonimo", v)} /><Label htmlFor="anonimo">Quero me manter anônimo</Label></div>}
      {!form.anonimo && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5"><Label htmlFor="nome">Nome *</Label><Input id="nome" maxLength={200} value={form.nome} onChange={(e) => set("nome", e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="email">E-mail *</Label><Input id="email" type="email" maxLength={200} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" maxLength={40} value={form.telefone} onChange={(e) => set("telefone", e.target.value)} /></div>
        </div>
      )}
      <div className="grid gap-1.5"><Label htmlFor="assunto">Assunto *</Label><Input id="assunto" maxLength={300} value={form.assunto} onChange={(e) => set("assunto", e.target.value)} /></div>
      <div className="grid gap-1.5"><Label htmlFor="mensagem">Mensagem *</Label><Textarea id="mensagem" rows={6} maxLength={5000} value={form.mensagem} onChange={(e) => set("mensagem", e.target.value)} /></div>
      <p className="text-xs text-muted-foreground">Seus dados serão usados apenas para responder a esta manifestação, conforme a LGPD.</p>
      <Button type="submit" disabled={sending} className="w-fit">{sending ? "Enviando..." : "Enviar manifestação"}</Button>
    </form>
  );
}

type Resultado = { protocolo: string; canal: string; assunto: string; status: string; resposta: string | null; created_at: string; respondido_em: string | null; prorrogado: boolean; prazo_final: string | null; justificativa_prorrogacao: string | null; setor_destino: string | null; protocolo_origem: string | null };

function Consulta() {
  const [protocolo, setProtocolo] = useState("");
  const [res, setRes] = useState<Resultado | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [recurso, setRecurso] = useState("");
  const [recorrendo, setRecorrendo] = useState(false);
  const [protocoloRecurso, setProtocoloRecurso] = useState("");
  const buscar = async (e: FormEvent) => {
    e.preventDefault();
    const { data, error } = await db.rpc("consultar_protocolo_seguro", { _protocolo: protocolo, _email: email });
    if (error) { toast.error("Não foi possível consultar agora."); return; }
    setRes((data as Resultado[])[0] ?? null);
  };
  return (
    <div className="mt-4 rounded-lg border bg-card p-6">
      <form onSubmit={buscar} className="flex flex-wrap gap-2">
        <Label htmlFor="protocolo" className="sr-only">Protocolo</Label>
        <Input id="protocolo" placeholder="Ex.: PF2026123456" value={protocolo} onChange={(e) => setProtocolo(e.target.value)} />
        <Input type="email" aria-label="E-mail cadastrado no pedido" placeholder="E-mail cadastrado (pedidos identificados)" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-52 flex-1" />
        <Button type="submit">Consultar</Button>
      </form>
      {res === null && <p className="mt-4 text-muted-foreground">Protocolo não encontrado ou dados de consulta não conferem.</p>}
      {res && (
        <dl className="mt-5 grid gap-2 text-sm">
          <div><dt className="font-semibold">Assunto</dt><dd>{res.assunto}</dd></div>
          <div><dt className="font-semibold">Registrado em</dt><dd>{dataBR(res.created_at)}</dd></div>
          <div><dt className="font-semibold">Situação</dt><dd><span className="rounded bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground">{res.status}</span></dd></div>
          {res.prazo_final && <div><dt className="font-semibold">Prazo previsto</dt><dd>{dataBR(res.prazo_final)}{res.prorrogado ? " (prorrogado)" : ""}</dd></div>}
          {res.justificativa_prorrogacao && <div><dt className="font-semibold">Justificativa da prorrogação</dt><dd>{res.justificativa_prorrogacao}</dd></div>}
          {res.setor_destino && <div><dt className="font-semibold">Encaminhado ao setor</dt><dd>{res.setor_destino}</dd></div>}
          {res.protocolo_origem && <div><dt className="font-semibold">Recurso referente ao protocolo</dt><dd>{res.protocolo_origem}</dd></div>}
          {res.resposta && <div><dt className="font-semibold">Resposta ({dataBR(res.respondido_em)})</dt><dd className="whitespace-pre-line rounded bg-muted p-3">{res.resposta}</dd></div>}
          {res.canal === "esic" && res.status === "Respondido" && res.respondido_em && Date.now() <= new Date(res.respondido_em).getTime() + 10 * 86400000 && (
            <div className="mt-3 space-y-2">
              <dt className="font-semibold">Interpor recurso (até 10 dias após a resposta)</dt>
              <Textarea aria-label="Justificativa do recurso" placeholder="Descreva o motivo do recurso (mínimo 10 caracteres)" value={recurso} onChange={e => setRecurso(e.target.value)} />
              <Button type="button" disabled={recorrendo || recurso.trim().length < 10} onClick={async () => {
                setRecorrendo(true);
                try {
                  const {data, error} = await db.rpc("registrar_recurso_esic", {_protocolo: protocolo, _email: email, _mensagem: recurso});
                  if (error) throw error;
                  setProtocoloRecurso(String(data));
                  setRecurso("");
                  toast.success("Recurso protocolado.");
                } catch (e) { toast.error((e as Error).message); }
                finally { setRecorrendo(false); }
              }}>Registrar recurso</Button>
              {protocoloRecurso && <p role="status">Protocolo do recurso: <strong>{protocoloRecurso}</strong></p>}
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
