import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { auditoriaQuery } from "@/lib/admin-queries";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";

export const Route = createFileRoute("/_authenticated/admin/auditoria")({
  loader: ({ context }) => context.queryClient.ensureQueryData(auditoriaQuery),
  component: Auditoria,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const ACAO: Record<string, string> = { INSERT: "Inclusão", UPDATE: "Alteração", DELETE: "Exclusão" };

function Auditoria() {
  const { data } = useSuspenseQuery(auditoriaQuery);
  const [q, setQ] = useState("");
  const rows = data.filter((r) => !q || `${r.tabela} ${r.acao} ${r.user_id}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl font-bold">Auditoria</h1>
      <Input className="mb-3 max-w-sm" placeholder="Filtrar por módulo ou ação" value={q} onChange={(e) => setQ(e.target.value)} />
      <table className="w-full rounded-lg border bg-card text-sm">
        <thead className="bg-secondary text-left"><tr><th className="p-2">Data</th><th className="p-2">Módulo</th><th className="p-2">Ação</th><th className="p-2">Usuário</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-t"><td className="p-2">{new Date(r.created_at).toLocaleString("pt-BR")}</td><td className="p-2">{r.tabela}</td><td className="p-2">{ACAO[r.acao] ?? r.acao}</td><td className="p-2 font-mono text-xs">{r.user_id?.slice(0, 8) ?? "público"}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
