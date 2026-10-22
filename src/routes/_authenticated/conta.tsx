import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/data";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";

const perfilQuery = queryOptions({
  queryKey: ["meu-perfil"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data } = await supabase.from("profiles").select("*").eq("id", u.user!.id).maybeSingle();
    return { id: u.user!.id, email: u.user!.email ?? "", nome: data?.nome ?? "", avatar_url: data?.avatar_url ?? "" };
  },
});

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [{ title: "Minha conta | Prefeitura de Pau dos Ferros" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(perfilQuery),
  component: Conta,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Conta() {
  const { data } = useSuspenseQuery(perfilQuery);
  const qc = useQueryClient();
  const [nome, setNome] = useState(data.nome);
  const [avatar, setAvatar] = useState(data.avatar_url);
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").upsert({ id: data.id, nome, avatar_url: avatar || null });
    if (error) toast.error(error.message); else { toast.success("Perfil salvo"); void qc.invalidateQueries({ queryKey: ["meu-perfil"] }); }
  };
  const trocar = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: nova, current_password: atual } as { password: string });
    if (error) toast.error(error.message); else { toast.success("Senha alterada"); setAtual(""); setNova(""); }
  };
  return (
    <div className="mx-auto grid max-w-2xl gap-8 px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Minha conta</h1>
      <form onSubmit={salvar} className="grid gap-4 rounded-lg border bg-card p-5">
        <div className="flex items-center gap-4">
          {avatar ? <img src={avatar} alt="Sua foto" className="size-20 rounded-full object-cover" /> : <div className="size-20 rounded-full bg-secondary" />}
          <Input type="file" accept="image/*" aria-label="Enviar foto" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setAvatar(await uploadAvatar(f, data.id)); } catch (err) { toast.error((err as Error).message); } } }} />
        </div>
        <p className="text-sm text-muted-foreground">{data.email}</p>
        <div className="grid gap-1.5"><Label htmlFor="nome">Nome</Label><Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
        <Button className="w-fit">Salvar perfil</Button>
      </form>
      <form onSubmit={trocar} className="grid gap-4 rounded-lg border bg-card p-5">
        <h2 className="font-bold">Trocar senha</h2>
        <div className="grid gap-1.5"><Label htmlFor="a">Senha atual</Label><Input id="a" type="password" value={atual} onChange={(e) => setAtual(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label htmlFor="n">Nova senha</Label><Input id="n" type="password" minLength={8} required value={nova} onChange={(e) => setNova(e.target.value)} /></div>
        <Button className="w-fit">Alterar senha</Button>
      </form>
    </div>
  );
}
