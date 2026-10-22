import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { usuariosQuery } from "@/lib/admin-queries";
import { dataBR } from "@/lib/modules";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  loader: ({ context }) => context.queryClient.ensureQueryData(usuariosQuery),
  component: Usuarios,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Usuarios() {
  const { data } = useSuspenseQuery(usuariosQuery);
  const { user } = useSession();
  const qc = useQueryClient();
  const toggle = async (id: string, role: "admin" | "editor", on: boolean) => {
    if (id === user?.id && role === "admin" && !on) { toast.error("Você não pode retirar seu próprio acesso de administrador."); return; }
    const { error } = on ? await supabase.from("user_roles").insert({ user_id: id, role }) : await supabase.from("user_roles").delete().eq("user_id", id).eq("role", role);
    if (error) toast.error(error.message); else { toast.success("Permissão atualizada"); void qc.invalidateQueries({ queryKey: ["admin-usuarios"] }); }
  };
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl font-bold">Usuários e perfis</h1>
      <table className="w-full rounded-lg border bg-card text-sm">
        <thead className="bg-secondary text-left"><tr><th className="p-3">Nome / e-mail</th><th className="p-3">Cadastro</th><th className="p-3">Administrador</th><th className="p-3">Editor</th></tr></thead>
        <tbody>{data.map((u) => (
          <tr key={u.id} className="border-t">
            <td className="p-3"><div className="font-semibold">{u.nome || "—"}</div><div className="text-muted-foreground">{u.email}</div></td>
            <td className="p-3">{dataBR(u.created_at)}</td>
            <td className="p-3"><Switch checked={u.roles.includes("admin")} onCheckedChange={(v) => toggle(u.id, "admin", v)} aria-label="Administrador" /></td>
            <td className="p-3"><Switch checked={u.roles.includes("editor")} onCheckedChange={(v) => toggle(u.id, "editor", v)} aria-label="Editor" /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
