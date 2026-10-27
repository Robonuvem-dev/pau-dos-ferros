import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { usuariosQuery } from "@/lib/admin-queries";
import { dataBR, MODULES, modulePermissionTable } from "@/lib/modules";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { pageHead } from '@/lib/seo';

const permissoesQuery = queryOptions({
  queryKey: ["admin-permissoes"],
  queryFn: async () => {
    const { data, error } = await supabase.from("permissoes_modulo").select("user_id,tabela");
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => pageHead('Usuários e permissões', 'Gestão das contas, perfis e permissões do portal municipal.'),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(usuariosQuery), context.queryClient.ensureQueryData(permissoesQuery)]),
  component: Usuarios,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

const TABELAS = [...new Map(MODULES.map((m) => [modulePermissionTable(m), modulePermissionTable(m) === "convenios" ? "Convênios, parcelas, obrigações e entidades" : m.table === "publicacoes" ? "Publicações oficiais (todas)" : m.label])).entries()];

function Usuarios() {
  const { data } = useSuspenseQuery(usuariosQuery);
  const { data: perms } = useSuspenseQuery(permissoesQuery);
  const { user } = useSession();
  const qc = useQueryClient();
  const toggle = async (id: string, role: "admin" | "editor", on: boolean) => {
    if (id === user?.id && role === "admin" && !on) { toast.error("Você não pode retirar seu próprio acesso de administrador."); return; }
    const { error } = on ? await supabase.from("user_roles").insert({ user_id: id, role }) : await supabase.from("user_roles").delete().eq("user_id", id).eq("role", role);
    if (error) toast.error(error.message); else { toast.success("Permissão atualizada"); void qc.invalidateQueries({ queryKey: ["admin-usuarios"] }); }
  };
  const togglePerm = async (id: string, tabela: string, on: boolean) => {
    const { error } = on ? await supabase.from("permissoes_modulo").insert({ user_id: id, tabela }) : await supabase.from("permissoes_modulo").delete().eq("user_id", id).eq("tabela", tabela);
    if (error) toast.error(error.message); else void qc.invalidateQueries({ queryKey: ["admin-permissoes"] });
  };
  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">Usuários e perfis</h1>
      <p className="mb-4 text-sm text-muted-foreground">Editores sem módulos marcados podem editar todos os cadastros. Marque módulos para restringir.</p>
      <table className="w-full rounded-lg border bg-card text-sm">
        <thead className="bg-secondary text-left"><tr><th className="p-3">Nome / e-mail</th><th className="p-3">Cadastro</th><th className="p-3">Administrador</th><th className="p-3">Editor</th><th className="p-3">Módulos</th></tr></thead>
        <tbody>{data.map((u) => {
          const meus = perms.filter((p) => p.user_id === u.id).map((p) => p.tabela);
          return (
            <tr key={u.id} className="border-t">
              <td className="p-3"><div className="font-semibold">{u.nome || "—"}</div><div className="text-muted-foreground">{u.email}</div></td>
              <td className="p-3">{dataBR(u.created_at)}</td>
              <td className="p-3"><Switch checked={u.roles.includes("admin")} onCheckedChange={(v) => toggle(u.id, "admin", v)} aria-label="Administrador" /></td>
              <td className="p-3"><Switch checked={u.roles.includes("editor")} onCheckedChange={(v) => toggle(u.id, "editor", v)} aria-label="Editor" /></td>
              <td className="p-3">
                {u.roles.includes("admin") ? <span className="text-muted-foreground">Todos</span> : u.roles.includes("editor") ? (
                  <Dialog>
                    <DialogTrigger asChild><Button variant="outline" size="sm">{meus.length ? `${meus.length} módulo(s)` : "Todos"}</Button></DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Módulos de {u.nome || u.email}</DialogTitle></DialogHeader>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {TABELAS.map(([t, label]) => (
                          <label key={t} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={meus.includes(t)} onCheckedChange={(v) => togglePerm(u.id, t, v === true)} /> {label}
                          </label>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : <span className="text-muted-foreground">—</span>}
              </td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}
