import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/data";
import { configQuery } from "@/lib/queries";
import { TEMAS } from "@/lib/temas";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/admin/aparencia")({
  head: () => ({ meta: [{ title: "Aparência do site | Painel" }] }),
  component: Aparencia,
});

const CHAVES = ["tema", "cor_primaria", "cor_destaque", "facebook_url"] as const;

function Aparencia() {
  const { isAdmin } = useSession();
  const qc = useQueryClient();
  const { data } = useQuery(configQuery);
  const [v, setV] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setV(data); }, [data]);
  const set = (k: string, val: string) => setV((o) => ({ ...o, [k]: val }));
  const salvar = async () => {
    const rows = CHAVES.map((chave) => ({ chave, valor: v[chave] ?? "" }));
    const { error } = await db.from("configuracoes_site").upsert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success("Aparência salva. Os visitantes verão a mudança em instantes.");
    await qc.invalidateQueries({ queryKey: configQuery.queryKey });
  };
  if (!isAdmin) return <p>Somente administradores alteram a aparência do site.</p>;
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Aparência do site</h1>
        <p className="text-sm text-muted-foreground">Tema, cores e página do Facebook. A mudança vale para todos os visitantes.</p>
      </div>
      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Tema</legend>
        {Object.entries(TEMAS).map(([k, t]) => (
          <button key={k} type="button" onClick={() => setV((o) => ({ ...o, tema: k, cor_primaria: "", cor_destaque: "" }))}
            className={`rounded-lg border-2 p-3 text-left text-sm ${v.tema === k ? "border-primary" : "border-border"}`} aria-pressed={v.tema === k}>
            <div className="mb-2 flex gap-1">{[t.primary, t.accent, t.highlight].map((c) => <span key={c} className="size-6 rounded" style={{ background: c }} />)}</div>
            {t.nome}
          </button>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5"><Label htmlFor="cp">Cor principal (opcional)</Label><Input id="cp" type="color" value={v.cor_primaria || TEMAS[v.tema ?? "institucional"]?.primary || "#0b5ea8"} onChange={(e) => set("cor_primaria", e.target.value)} /></div>
        <div className="grid gap-1.5"><Label htmlFor="cd">Cor de destaque (opcional)</Label><Input id="cd" type="color" value={v.cor_destaque || TEMAS[v.tema ?? "institucional"]?.accent || "#f08a1c"} onChange={(e) => set("cor_destaque", e.target.value)} /></div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="fb">Endereço da página oficial no Facebook</Label>
        <Input id="fb" placeholder="https://www.facebook.com/prefeituradepaudosferros" value={v.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} />
      </div>
      <Button onClick={salvar}>Salvar aparência</Button>
    </div>
  );
}
