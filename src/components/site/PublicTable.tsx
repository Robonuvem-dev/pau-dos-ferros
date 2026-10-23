import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Download, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { moduleQuery } from '@/lib/queries';
import { formatCell, toCSV, type ModuleDef } from "@/lib/modules";

export function PublicTable({ mod }: { mod: ModuleDef }) {
  const { data } = useSuspenseQuery(moduleQuery(mod.key));
  const [q, setQ] = useState("");
  const [numero, setNumero] = useState("");
  const [ano, setAno] = useState("");
  const [ementa, setEmenta] = useState("");
  const legislacao = ["lei", "decreto", "portaria", "resolucao", "edital", "lrf"].includes(mod.key);
  const cols = mod.fields.filter((f) => !f.hideInTable);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter((r) => {
      if (s && !mod.fields.some((f) => String(r[f.name] ?? "").toLowerCase().includes(s))) return false;
      if (legislacao && numero.trim() && !String(r.numero ?? "").toLowerCase().includes(numero.trim().toLowerCase())) return false;
      if (legislacao && ano.trim() && String(r.ano ?? "").trim() !== ano.trim()) return false;
      if (legislacao && ementa.trim() && !String(r.ementa ?? "").toLowerCase().includes(ementa.trim().toLowerCase())) return false;
      return true;
    });
  }, [data, q, mod.fields, legislacao, numero, ano, ementa]);

  const exportar = (tipo: "csv" | "json") => {
    const content = tipo === "csv" ? "\uFEFF" + toCSV(mod.fields, rows) : JSON.stringify(rows, null, 2);
    const blob = new Blob([content], { type: tipo === "csv" ? "text/csv" : "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${mod.key}.${tipo}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="rounded-lg border bg-card shadow-card">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar nesta consulta..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <span className="text-sm text-muted-foreground">{rows.length} registro(s)</span>
        <Button variant="outline" size="sm" onClick={() => exportar("csv")}><Download className="size-4" />CSV</Button>
        <Button variant="outline" size="sm" onClick={() => exportar("json")}><Download className="size-4" />JSON</Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>Imprimir</Button>
      </div>
      {legislacao && <div className="grid gap-3 border-b p-4 sm:grid-cols-3">
        <Input aria-label="Número do documento" placeholder="Filtrar por número" value={numero} onChange={e => setNumero(e.target.value)} />
        <Input aria-label="Ano do documento" placeholder="Ano (ex.: 2026)" inputMode="numeric" value={ano} onChange={e => setAno(e.target.value)} />
        <Input aria-label="Ementa do documento" placeholder="Palavras da ementa" value={ementa} onChange={e => setEmenta(e.target.value)} />
      </div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-secondary-foreground">
            <tr>{cols.map((c) => <th key={c.name} className="px-4 py-3 font-semibold">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td className="px-4 py-6 text-muted-foreground" colSpan={cols.length}>Nenhum registro encontrado.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t align-top hover:bg-muted">
                {cols.map((c) => (
                  <td key={c.name} className="px-4 py-3">
                    {c.type === "file" ? (
                      r[c.name] ? <a href={String(r[c.name])} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><FileText className="size-4" />Abrir</a> : "—"
                    ) : c.name === "percentual" ? (
                      <div className="flex items-center gap-2"><div className="h-2 w-20 rounded bg-muted"><div className="h-2 rounded bg-teal" style={{ width: `${Number(r[c.name] ?? 0)}%` }} /></div>{String(r[c.name] ?? 0)}%</div>
                    ) : (
                      formatCell(c, r[c.name])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
