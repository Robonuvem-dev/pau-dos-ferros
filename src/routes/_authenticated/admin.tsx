import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo | Prefeitura de Pau dos Ferros" }] }),
  component: AdminLayout,
});

const GRUPOS = ["Site Oficial", "Licitações e Contratos", "Transparência", "Gestão"] as const;
const item = "block rounded px-2 py-1 text-sm hover:bg-secondary";

function AdminLayout() {
  const { ready, isStaff, isAdmin } = useSession();
  if (!ready) return <p className="mx-auto max-w-6xl px-4 py-10">Carregando...</p>;
  if (!isStaff) return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="font-display text-2xl font-bold">Acesso pendente</h1>
      <p className="mt-2 text-muted-foreground">Sua conta foi criada, mas ainda precisa ser liberada por um administrador do portal.</p>
    </div>
  );
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[230px_1fr]">
      <aside className="space-y-4 rounded-lg border bg-card p-3 md:sticky md:top-4 md:max-h-[90vh] md:overflow-y-auto">
        <nav aria-label="Painel">
          <Link to="/admin" className={item} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary font-semibold" }}>Visão geral</Link>
          {isAdmin && <Link to="/admin/usuarios" className={item}>Usuários e perfis</Link>}
          {isAdmin && <Link to="/admin/auditoria" className={item}>Auditoria</Link>}
        </nav>
        {GRUPOS.map((g) => (
          <div key={g}>
            <div className="px-2 text-xs font-bold uppercase text-muted-foreground">{g}</div>
            {MODULES.filter((m) => m.grupo === g).map((m) => (
              <Link key={m.key} to="/admin/$module" params={{ module: m.key }} className={item} activeProps={{ className: "bg-secondary font-semibold" }}>{m.label}</Link>
            ))}
          </div>
        ))}
      </aside>
      <section className="min-w-0"><Outlet /></section>
    </div>
  );
}
