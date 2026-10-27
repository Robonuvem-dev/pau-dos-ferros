import { FormattedInput } from "@/components/ui/formatted-input";
import { fieldMask } from "@/lib/formatting";
import { initialValues as emptyValues } from "@/lib/normalization";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { FileText, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminModuleQuery } from "@/lib/admin-queries";
import { deleteRow, saveRow, uploadFile, type Row } from "@/lib/data";
import { formatCell, type Field, type ModuleDef } from "@/lib/modules";
import { IntegracaoExterna } from "@/components/admin/IntegracaoExterna";
import { ImportarArquivo } from "@/components/admin/ImportarArquivo";
import { ResumoFiscal } from "@/components/transparencia/ResumoFiscal";
import { ResumoPessoal } from "@/components/transparencia/ResumoPessoal";
import { ResumoConvenios } from "@/components/convenios/ResumoConvenios";

type Values = Record<string, unknown>;


export function CrudModule({ mod, startNew = false }: { mod: ModuleDef; startNew?: boolean }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(adminModuleQuery(mod.key));
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ id?: string; values: Values } | null>(startNew ? { values: emptyValues(mod) } : null);
  const cols = mod.fields.filter((f) => !f.hideInTable && f.type !== "files").slice(0, 6);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? data.filter((r) => mod.fields.some((f) => (String(r[f.name] ?? "") + " " + formatCell(f, r[f.name])).toLowerCase().includes(s))) : data;
  }, [data, q, mod.fields]);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin-module", mod.key] });
    void qc.invalidateQueries({ queryKey: ["public-module", mod.key] });
    void qc.invalidateQueries({ queryKey: ["admin-counts"] });
  };

  const remove = async (r: Row) => {
    if (!window.confirm("Excluir este registro? A ação ficará registrada na auditoria.")) return;
    try { await deleteRow(mod, r.id); toast.success("Registro excluído"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const edit = (r: Row) => {
    const values: Values = {};
    for (const f of mod.fields) values[f.name] = f.type === "tags" && Array.isArray(r[f.name]) ? (r[f.name] as string[]).join(", ") : r[f.name] ?? (f.type === "files" ? [] : "");
    setEditing({ id: r.id, values });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{mod.label}</h1>
          <p className="text-muted-foreground">{mod.descricao}</p>
        </div>
        <Button onClick={() => setEditing({ values: emptyValues(mod) })}><Plus />Novo registro</Button>
      </div>
      <IntegracaoExterna key={mod.key} modulo={mod.key} onDone={refresh} />
      <ImportarArquivo modulo={mod.key} onDone={refresh} />
      {["receitas","despesas"].includes(mod.key) && <ResumoFiscal />}
      {mod.key === "servidores" && <ResumoPessoal />}
      {mod.key === "convenios" && <ResumoConvenios />}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center gap-3 border-b p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="text-sm text-muted-foreground">{rows.length} registro(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-secondary-foreground">
              <tr>{cols.map((c) => <th key={c.name} className="px-3 py-2 font-semibold">{c.label}</th>)}<th className="w-24 px-3 py-2 text-right">Ações</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={cols.length + 1} className="px-3 py-6 text-muted-foreground">Nenhum registro. Use “Novo registro” para começar.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-t align-top hover:bg-muted">
                  {cols.map((c) => (
                    <td key={c.name} className="max-w-xs px-3 py-2">
                      {c.type === "file" ? (r[c.name] ? <a className="text-primary hover:underline" href={String(r[c.name])} target="_blank" rel="noreferrer">Abrir</a> : "—") : <span className="line-clamp-2">{formatCell(c, r[c.name])}</span>}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <Button size="icon" variant="ghost" onClick={() => edit(r)} aria-label="Editar"><Pencil /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r)} aria-label="Excluir"><Trash2 /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo"} — {mod.label}</DialogTitle></DialogHeader>
          {editing && <RowForm mod={mod} initial={editing.values} id={editing.id} onDone={() => { setEditing(null); refresh(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowForm({ mod, initial, id, onDone }: { mod: ModuleDef; initial: Values; id?: string | undefined; onDone: () => void }) {
  const [values, setValues] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const set = (name: string, v: unknown) => setValues((p) => ({ ...p, [name]: v }));

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (uploads > 0) { toast.error("Aguarde o envio dos arquivos terminar antes de salvar."); return; }
    const missing = mod.fields.find((f) => f.required && String(values[f.name] ?? "").trim() === "");
    if (missing) { toast.error(`Preencha o campo “${missing.label}”.`); return; }
    setSaving(true);
    try { await saveRow(mod, values, id); toast.success("Registro salvo"); onDone(); }
    catch (err) { toast.error((err as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      {mod.fields.map((f) => <FieldInput key={f.name} field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} onUploadBusy={(busy) => setUploads(n => Math.max(0, n + (busy ? 1 : -1)))} />)}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saving || uploads > 0}>{uploads > 0 ? "Aguarde os arquivos..." : saving ? "Salvando..." : "Salvar"}</Button>
      </div>
    </form>
  );
}

function FieldInput({ field: f, value, onChange, onUploadBusy }: { field: Field; value: unknown; onChange: (v: unknown) => void; onUploadBusy: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const id = `f-${f.name}`;
  const label = <Label htmlFor={id}>{f.label}{f.required && " *"}</Label>;
  const upload = async (files: FileList | null, multi: boolean) => {
    if (!files?.length) return;
    setBusy(true);
    onUploadBusy(true);
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadFile(file)));
      onChange(multi ? [...((value as string[]) ?? []), ...urls] : urls[0]);
      toast.success("Arquivo enviado");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); onUploadBusy(false); }
  };

  if (f.type === "bool") return <div className="flex items-center gap-3"><Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />{label}</div>;
  if (f.type === "textarea") return <div className="grid gap-1.5">{label}<Textarea id={id} rows={f.name === "conteudo" ? 10 : 4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} /></div>;
  if (f.type === "select") return (
    <div className="grid gap-1.5">{label}
      <select id={id} className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecione...</option>
        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
  if (f.type === "file") {
    const url = String(value ?? "");
    const isImg = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes("/assets/");
    return (
      <div className="grid gap-1.5">{label}
        <div className="flex gap-2">
          <Input id={id} placeholder="Cole um link ou envie um arquivo" value={url} onChange={(e) => onChange(e.target.value)} />
          <Button type="button" variant="outline" asChild disabled={busy}>
            <label className="cursor-pointer"><Upload />{busy ? "Enviando" : "Enviar"}<input type="file" disabled={busy} className="sr-only" onChange={(e) => upload(e.target.files, false)} /></label>
          </Button>
        </div>
        {url && (isImg ? <img src={url} alt="" className="h-24 w-auto rounded border object-cover" /> : <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary"><FileText className="size-4" />Ver arquivo atual</a>)}
      </div>
    );
  }
  if (f.type === "files") {
    const list = (value as string[]) ?? [];
    return (
      <div className="grid gap-1.5">{label}
        <div className="flex flex-wrap gap-2">
          {list.map((u, i) => (
            <div key={u} className="relative">
              <img src={u} alt={`Foto ${i + 1}`} className="size-20 rounded border object-cover" />
              <button type="button" aria-label="Remover foto" className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground" onClick={() => onChange(list.filter((x) => x !== u))}><X className="size-3" /></button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" asChild disabled={busy} className="w-fit">
          <label className="cursor-pointer"><Upload />{busy ? "Enviando..." : "Adicionar fotos"}<input type="file" disabled={busy} multiple accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files, true)} /></label>
        </Button>
      </div>
    );
  }
  if (f.type === "relation" && f.ref) return <RelationInput field={f} value={value} onChange={onChange} label={label} id={id} />;
  const mask = fieldMask(f);
  if (mask) return <div className="grid gap-1.5">{label}<FormattedInput id={id} mask={mask} value={value} onValueChange={onChange} required={f.required} /></div>;
  const type = f.name === "email" ? "email" : f.type === "date" ? "date" : f.type === "int" || f.type === "number" || f.type === "money" ? "number" : "text";
  return (
    <div className="grid gap-1.5">{label}
      <Input id={id} type={type} step={f.type === "money" ? "0.01" : undefined} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={f.type === "tags" ? "separe por vírgulas" : undefined} />
    </div>
  );
}

function RelationInput({ field: f, value, onChange, label, id }: { field: Field; value: unknown; onChange: (v: unknown) => void; label: React.ReactNode; id: string }) {
  const ref = f.ref!;
  const { data = [] } = useQuery({ ...adminModuleQuery(ref.module) });
  const opts = Array.from(
    new Map<string, { value: string; label: string }>(
      data.filter((r) => r[ref.column] != null).map((r) => [
        String(r[ref.column]),
        { value: String(r[ref.column]), label: String(r[ref.displayColumn ?? ref.column] ?? r[ref.column]) },
      ] as const),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  const cur = String(value ?? "");
  return (
    <div className="grid gap-1.5">{label}
      <select id={id} className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={cur} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecione...</option>
        {cur && !opts.some((o) => o.value === cur) && <option value={cur}>{cur} (não cadastrado)</option>}
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
