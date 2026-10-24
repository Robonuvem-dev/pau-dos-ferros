import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { MODULES, modulePermissionTable } from "@/lib/modules";
import { HISTORICO, VERSAO } from "@/lib/versao";
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo | Prefeitura de Pau dos Ferros" }] }),
  component: AdminLayout,
});

const GRUPOS = ["Site Oficial", "Licitações e Contratos", "Transparência", "Gestão"] as const;
const item = "block rounded px-2 py-1 text-sm hover:bg-secondary";
const VERSAO_KEY = "pdf-versao-vista";

function AvisoAtualizacao() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(localStorage.getItem(VERSAO_KEY) !== VERSAO); }, []);
  if (!show) return null;
  const fechar = () => { localStorage.setItem(VERSAO_KEY, VERSAO); setShow(false); };
  return (
    <div role="status" className="mb-4 flex items-start gap-3 rounded-lg border border-primary bg-secondary p-3 text-sm">
      <div className="flex-1">
        <strong>Sistema atualizado para a versão {VERSAO}.</strong> {(HISTORICO[0]?.itens ?? []).slice(0, 2).join(" ")}{" "}
        <Link to="/sobre" className="underline">Ver novidades</Link>
      </div>
      <Button variant="ghost" size="icon" onClick={fechar} aria-label="Fechar aviso"><X className="size-4" /></Button>
    </div>
  );
}

function AdminLayout() {
  const home = useRouterState({ select: (state) => state.location.pathname.replace(/\/$/, '') === '/admin' });
  const { ready, isStaff, isAdmin, user } = useSession();
  const { data: perms } = useQuery({
    queryKey: ["minhas-permissoes", user?.id],
    enabled: !!user && isStaff && !isAdmin,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("permissoes_modulo").select("tabela").eq("user_id", user.id);
      if (error) throw error;
      return data.map((p) => p.tabela);
    },
  });
  if (!ready) return <p className="mx-auto max-w-6xl px-4 py-10">Carregando...</p>;
  if (!isStaff) return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="font-display text-2xl font-bold">Acesso pendente</h1>
      <p className="mt-2 text-muted-foreground">Sua conta foi criada, mas ainda precisa ser liberada por um administrador do portal.</p>
    </div>
  );
  const visiveis = MODULES.filter((m) => isAdmin || !perms?.length || perms.includes(modulePermissionTable(m)));
  return (
    <div className={`mx-auto grid max-w-7xl gap-6 px-4 py-8 ${home ? '' : 'md:grid-cols-[230px_1fr]'}`}>
      {!home && <aside className="space-y-4 rounded-lg border bg-card p-3 md:sticky md:top-4 md:max-h-[90vh] md:overflow-y-auto">
        <nav aria-label="Painel">
          <Link to="/admin" className={item} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary font-semibold" }}>Visão geral</Link>
          {isAdmin && <Link to="/admin/usuarios" className={item}>Usuários e perfis</Link>}
          {isAdmin && <Link to="/admin/auditoria" className={item}>Auditoria</Link>}
          {isAdmin && <Link to="/admin/aparencia" className={item}>Aparência do site</Link>}
          <Link to="/admin/servicos-estatisticas" className={item}>Estatísticas dos serviços</Link>
          <Link to="/admin/pendencias" className={item}>Críticas e pendências</Link>
          <Link to="/admin/licitacoes-relatorios" className={item}>Relatórios de licitações</Link>
          <Link to="/admin/melhorias" className={item}>Pedidos de melhoria</Link>
          <Link to="/sobre" className={item}>Sobre o sistema (v{VERSAO})</Link>
        </nav>
        {GRUPOS.map((g) => {
          const mods = visiveis.filter((m) => m.grupo === g);
          if (!mods.length) return null;
          return (
            <div key={g}>
              <div className="px-2 text-xs font-bold uppercase text-muted-foreground">{g}</div>
              {mods.map((m) => (
                <Link key={m.key} to="/admin/$module" params={{ module: m.key }} className={item} activeProps={{ className: "bg-secondary font-semibold" }}>{m.label}</Link>
              ))}
            </div>
          );
        })}
      </aside>}
      <section className="min-w-0"><AvisoAtualizacao /><Outlet /></section>
    </div>
  );
}
