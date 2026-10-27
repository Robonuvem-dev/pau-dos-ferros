import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { MODULES } from "@/lib/modules";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { pageHead } from '@/lib/seo';

const melhoriasQuery = queryOptions({
  queryKey: ["admin-melhorias"],
  queryFn: async () => {
    const { data, error } = await supabase.from("solicitacoes_melhoria").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/_authenticated/admin/melhorias")({
  head: () => pageHead('Pedidos de melhoria', 'Registro e acompanhamento de solicitações de melhoria do portal.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(melhoriasQuery),
  component: Melhorias,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const STATUS = ["Aberta", "Em análise", "Aprovada", "Concluída", "Recusada"];
const sel = "h-9 rounded-md border bg-background px-2 text-sm";

function Melhorias() {
  const { data } = useSuspenseQuery(melhoriasQuery);
  const { isAdmin } = useSession();
  const qc = useQueryClient();
  const [form, setForm] = useState({ titulo: "", descricao: "", modulo: "", prioridade: "Média" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-melhorias"] });
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.titulo.trim().length < 3 || !form.descricao.trim()) { toast.error("Informe título e descrição."); return; }
    const { error } = await supabase.from("solicitacoes_melhoria").insert({ ...form, modulo: form.modulo || null });
    if (error) toast.error(error.message); else { toast.success("Pedido enviado"); setForm({ titulo: "", descricao: "", modulo: "", prioridade: "Média" }); void refresh(); }
  };
  const atualizar = async (id: string, patch: { status?: string; resposta?: string }) => {
    const { error } = await supabase.from("solicitacoes_melhoria").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Pedido atualizado"); void refresh(); }
  };
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Pedidos de melhoria</h1>
      <form onSubmit={enviar} className="space-y-3 rounded-lg border bg-card p-4">
        <Input placeholder="Título do pedido" maxLength={150} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        <Textarea placeholder="Descreva a melhoria desejada" maxLength={4000} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        <div className="flex flex-wrap gap-2">
          <select className={sel} value={form.modulo} onChange={(e) => setForm({ ...form, modulo: e.target.value })} aria-label="Módulo">
            <option value="">Sistema em geral</option>{MODULES.map((m) => <option key={m.key} value={m.label}>{m.label}</option>)}
          </select>
          <select className={sel} value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })} aria-label="Prioridade">
            {["Baixa", "Média", "Alta"].map((p) => <option key={p}>{p}</option>)}
          </select>
          <Button type="submit">Enviar pedido</Button>
        </div>
      </form>
      <ul className="space-y-3">
        {data.length === 0 && <li className="text-muted-foreground">Nenhum pedido enviado.</li>}
        {data.map((m) => (
          <li key={m.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">{m.titulo}</div>
              <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString("pt-BR")} · {m.modulo ?? "Sistema em geral"} · Prioridade {m.prioridade}</span>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm">{m.descricao}</p>
            {isAdmin ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <select className={sel} defaultValue={m.status} onChange={(e) => atualizar(m.id, { status: e.target.value })} aria-label="Situação">{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                <Input className="flex-1" placeholder="Resposta ao solicitante" defaultValue={m.resposta ?? ""} onBlur={(e) => e.target.value !== (m.resposta ?? "") && atualizar(m.id, { resposta: e.target.value })} />
              </div>
            ) : (
              <p className="mt-2 text-sm"><strong>Situação:</strong> {m.status}{m.resposta ? ` — ${m.resposta}` : ""}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
