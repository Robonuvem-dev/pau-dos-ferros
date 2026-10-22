import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("Nova senha", "Defina uma nova senha de acesso ao painel."),
  component: Reset,
});

function Reset() {
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) { toast.error(error.message); return; }
    toast.success("Senha alterada.");
    await navigate({ to: "/admin" });
  };
  return (
    <form onSubmit={salvar} className="mx-auto grid max-w-md gap-4 px-4 py-14">
      <h1 className="font-display text-3xl font-bold">Definir nova senha</h1>
      <div className="grid gap-1.5"><Label htmlFor="s">Nova senha</Label><Input id="s" type="password" minLength={8} required value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
      <Button>Salvar</Button>
    </form>
  );
}
