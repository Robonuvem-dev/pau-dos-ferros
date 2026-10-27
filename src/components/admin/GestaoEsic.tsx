import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/data";
import { prazoAtendimento } from "@/lib/atendimento/prazos";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type Atendimento = {
  id: string; protocolo: string; canal: string; tipo: string | null;
  assunto: string; status: string; created_at: string;
  prorrogado: boolean; justificativa_prorrogacao: string | null;
  setor_destino: string | null; resposta: string | null; respondido_em: string | null;
};

export function GestaoEsic() {
  const qc = useQueryClient();
  const { data = [], error, isPending } = useQuery({
    queryKey: ["gestao-esic"],
    queryFn: async (): Promise<Atendimento[]> => {
      const { data, error } = await db.from("atendimentos")
        .select("id,protocolo,canal,tipo,assunto,status,created_at,prorrogado,justificativa_prorrogacao,setor_destino,resposta,respondido_em")
        .order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data as Atendimento[];
    },
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const setDraft = (id: string, value: string) => setDrafts(p => ({...p, [id]: value}));
  const action = async (id: string, rpc: string, args: Record<string,string>) => {
    setBusy(id);
    try {
      const { error } = await db.rpc(rpc, { _id: id, ...args });
      if (error) throw error;
      toast.success("Registro atualizado e auditado.");
      await qc.invalidateQueries({ queryKey: ["gestao-esic"] });
      await qc.invalidateQueries({ queryKey: ["admin-atendimentos"] });
      await qc.invalidateQueries({ queryKey: ["public-estatisticas-atendimento"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };
  return <section id="gestao-esic" className="mt-8 rounded-lg border bg-card p-5">
    <h2 className="font-display text-xl font-bold">e-SIC e Ouvidoria — gestão de prazos e respostas</h2>
    <p className="mt-1 text-sm text-muted-foreground">Visualização exclusiva da equipe autenticada. Prorrogações de e-SIC requerem justificativa e só podem ocorrer uma vez durante o prazo original.</p>
    {isPending && <p>Carregando atendimentos...</p>}
    {error && <p role="alert" className="text-destructive">{(error as Error).message}. Verifique a migração 0010.</p>}
    <div className="mt-4 space-y-4">{data.map(a => {
      const prazo = prazoAtendimento(new Date(a.created_at), a.canal, a.prorrogado, a.tipo);
      const hojePartes = new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      const hoje = (key: string) => hojePartes.find(p => p.type === key)?.value ?? "";
      const now = `${hoje("year")}-${hoje("month")}-${hoje("day")}`;
      const vencido = !a.respondido_em && prazo.toISOString().slice(0, 10) < now;
      const podeProrrogar = a.canal === "esic" && a.tipo !== "Recurso" && !a.prorrogado && !a.respondido_em
        && prazo.toISOString().slice(0,10) >= now;
      return <article key={a.id} className="rounded border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong className="min-w-0 break-all">{a.protocolo} · {a.canal.toUpperCase()} {a.tipo === "Recurso" ? "· Recurso" : ""}</strong>
          <span className={vencido ? "font-semibold text-destructive" : "text-muted-foreground"}>
            {a.status} · Prazo previsto: {prazo.toLocaleDateString("pt-BR", {timeZone: "UTC"})}{vencido ? " · VENCIDO" : ""}
          </span>
        </div>
        <p className="mt-2 text-sm">{a.assunto}</p>
        {a.setor_destino && <p className="text-sm">Encaminhado: {a.setor_destino}</p>}
        {a.prorrogado && <p className="text-sm">Prorrogação justificada: {a.justificativa_prorrogacao}</p>}
        {a.respondido_em && <p className="text-sm">Respondido em {new Date(a.respondido_em).toLocaleDateString("pt-BR")}</p>}
        {!a.respondido_em && <div className="mt-3 space-y-2">
          <Input aria-label={`Setor ou justificativa de ${a.protocolo}`} placeholder="Setor de encaminhamento ou justificativa (mín. 10 caracteres)" value={drafts[a.id] ?? ""} onChange={e => setDraft(a.id,e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => action(a.id, "encaminhar_atendimento", { _setor: drafts[a.id] ?? "" })}>Encaminhar</Button>
            {podeProrrogar && <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => action(a.id, "prorrogar_esic", { _justificativa: drafts[a.id] ?? "" })}>Prorrogar 10 dias</Button>}
          </div>
          <Textarea aria-label={`Resposta para ${a.protocolo}`} placeholder="Resposta oficial (mín. 10 caracteres)" value={drafts[a.id + ":resposta"] ?? ""} onChange={e => setDraft(a.id + ":resposta",e.target.value)}/>
          <Button size="sm" disabled={busy === a.id || (drafts[a.id + ":resposta"] ?? "").trim().length < 10}
            onClick={() => action(a.id, "responder_atendimento", { _resposta: drafts[a.id + ":resposta"] ?? "" })}>Publicar resposta</Button>
        </div>}
      </article>;
    })}</div>
  </section>;
}
