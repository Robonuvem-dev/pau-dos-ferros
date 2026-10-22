import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/auth")({
  head: () => pageHead("Área restrita", "Acesso de servidores e gestores ao painel do portal."),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ nome: "", email: "", senha: "" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } };

  const entrar = (e: FormEvent) => { e.preventDefault(); void run(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.senha });
    if (error) throw new Error("E-mail ou senha incorretos.");
    await navigate({ to: "/admin" });
  }); };
  const criar = (e: FormEvent) => { e.preventDefault(); void run(async () => {
    const { error } = await supabase.auth.signUp({ email: f.email, password: f.senha, options: { emailRedirectTo: window.location.origin, data: { nome: f.nome } } });
    if (error) throw new Error(error.message);
    toast.success("Conta criada. Confirme pelo link enviado ao seu e-mail.");
  }); };
  const esqueci = (e: FormEvent) => { e.preventDefault(); void run(async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) throw new Error(error.message);
    toast.success("Enviamos um link para redefinir a senha.");
  }); };
  const google = () => void run(async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) throw new Error("Não foi possível entrar com Google.");
  });

  const email = <div className="grid gap-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={f.email} onChange={set("email")} /></div>;
  const senha = <div className="grid gap-1.5"><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" required minLength={8} value={f.senha} onChange={set("senha")} /></div>;

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="font-display text-3xl font-bold">Área restrita</h1>
      <p className="mb-6 text-muted-foreground">Acesso da equipe de gestão do portal.</p>
      <Tabs defaultValue="entrar" className="rounded-lg border bg-card p-5">
        <TabsList className="w-full"><TabsTrigger value="entrar">Entrar</TabsTrigger><TabsTrigger value="criar">Criar conta</TabsTrigger><TabsTrigger value="esqueci">Esqueci a senha</TabsTrigger></TabsList>
        <TabsContent value="entrar"><form onSubmit={entrar} className="grid gap-4 pt-3">{email}{senha}<Button disabled={busy}>Entrar</Button></form></TabsContent>
        <TabsContent value="criar"><form onSubmit={criar} className="grid gap-4 pt-3"><div className="grid gap-1.5"><Label htmlFor="nome">Nome</Label><Input id="nome" required value={f.nome} onChange={set("nome")} /></div>{email}{senha}<Button disabled={busy}>Criar conta</Button><p className="text-xs text-muted-foreground">O acesso ao painel é liberado por um administrador.</p></form></TabsContent>
        <TabsContent value="esqueci"><form onSubmit={esqueci} className="grid gap-4 pt-3">{email}<Button disabled={busy}>Enviar link</Button></form></TabsContent>
        <Button variant="outline" className="mt-4 w-full" onClick={google} disabled={busy}>Entrar com Google</Button>
      </Tabs>
    </div>
  );
}
