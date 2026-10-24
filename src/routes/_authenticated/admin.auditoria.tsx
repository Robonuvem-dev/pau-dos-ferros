import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auditoriaQuery, usuariosQuery } from "@/lib/admin-queries";
import { baixar, toCSV } from "@/lib/versao";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { pageHead } from '@/lib/seo';

export const Route = createFileRoute("/_authenticated/admin/auditoria")({
  head: () => pageHead('Auditoria e acessos', 'Histórico de alterações, entradas e saídas da equipe municipal.'),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(auditoriaQuery), context.queryClient.ensureQueryData(usuariosQuery)]),
  component: Auditoria,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const ACAO: Record<string, string> = { INSERT: "Inclusão", UPDATE: "Alteração", DELETE: "Exclusão", LOGIN: "Entrada", LOGOUT: "Saída" };
const sel = "h-9 rounded-md border bg-background px-2 text-sm";

function Auditoria() {
  const { data } = useSuspenseQuery(auditoriaQuery);
  const { data: users } = useSuspenseQuery(usuariosQuery);
  const nomes = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.nome || u.email])), [users]);
  const [q, setQ] = useState("");
  const [acao, setAcao] = useState("");
  const [usuario, setUsuario] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const rows = data.filter((r) => {
    const d = r.created_at.slice(0, 10);
    return (!q || r.tabela.toLowerCase().includes(q.toLowerCase()))
      && (!acao || r.acao === acao) && (!usuario || r.user_id === usuario)
      && (!de || d >= de) && (!ate || d <= ate);
  });
  const exportar = () => baixar(`auditoria-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(
    ["Data", "Módulo", "Ação", "Usuário", "Registro"],
    rows.map((r) => [new Date(r.created_at).toLocaleString("pt-BR"), r.tabela, ACAO[r.acao] ?? r.acao, r.user_id ? nomes[r.user_id] ?? r.user_id : "público", r.registro_id]),
  ));
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl font-bold">Auditoria</h1>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <Input className="w-48" placeholder="Módulo" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filtrar por módulo" />
        <select className={sel} value={acao} onChange={(e) => setAcao(e.target.value)} aria-label="Ação">
          <option value="">Todas as ações</option>{Object.entries(ACAO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={sel} value={usuario} onChange={(e) => setUsuario(e.target.value)} aria-label="Usuário">
          <option value="">Todos os usuários</option>{users.map((u) => <option key={u.id} value={u.id}>{u.nome || u.email}</option>)}
        </select>
        <label className="text-xs">De<Input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></label>
        <label className="text-xs">Até<Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></label>
        <Button variant="outline" onClick={exportar}><Download className="size-4" /> Exportar CSV</Button>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">{rows.length} registro(s)</p>
      <table className="w-full rounded-lg border bg-card text-sm">
        <thead className="bg-secondary text-left"><tr><th className="p-2">Data</th><th className="p-2">Módulo</th><th className="p-2">Ação</th><th className="p-2">Usuário</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-t"><td className="p-2">{new Date(r.created_at).toLocaleString("pt-BR")}</td><td className="p-2">{r.tabela === "sessao" ? "Acesso ao sistema" : r.tabela}</td><td className="p-2">{ACAO[r.acao] ?? r.acao}</td><td className="p-2">{r.user_id ? nomes[r.user_id] ?? r.user_id.slice(0, 8) : "público"}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
