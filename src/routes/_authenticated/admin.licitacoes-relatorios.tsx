import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchModule, type Row } from "@/lib/data";
import { getModule, dataBR, brl } from "@/lib/modules";
import { boletimDoDia, contratosAVencer, mapaLicitacoes, type ContratoLike, type LicitacaoLike } from "@/lib/compras/relatorios";
import { BIDDING_MODALITIES, BIDDING_STATUS } from "@/lib/compras/bidding-workflow";
import { baixar, toCSV } from "@/lib/versao";

export const Route = createFileRoute("/_authenticated/admin/licitacoes-relatorios")({
  head: () => ({ meta: [{ title: "Relatórios de licitações | Painel" }] }),
  component: Relatorios,
});

const hojeISO = () => new Date().toISOString().slice(0, 10);

function useDados() {
  return useQuery({
    queryKey: ["relatorios-licitacoes"],
    queryFn: async () => ({
      licitacoes: (await fetchModule(getModule("licitacoes")!)) as unknown as LicitacaoLike[],
      contratos: (await fetchModule(getModule("contratos")!)) as unknown as ContratoLike[],
    }),
  });
}

function Relatorios() {
  const { data, isLoading, error } = useDados();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Relatórios de licitações e contratos</h1>
      <p className="mb-4 text-sm text-muted-foreground">Boletim do dia, mapa de licitações e contratos a vencer (itens 3.14, 3.16 e 3.17 do edital).</p>
      {isLoading && <p>Gerando...</p>}
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      {data && (
        <Tabs defaultValue="boletim">
          <TabsList>
            <TabsTrigger value="boletim">Boletim do dia</TabsTrigger>
            <TabsTrigger value="mapa">Mapa de licitações</TabsTrigger>
            <TabsTrigger value="vencer">Contratos a vencer</TabsTrigger>
          </TabsList>
          <TabsContent value="boletim"><Boletim licitacoes={data.licitacoes} /></TabsContent>
          <TabsContent value="mapa"><Mapa licitacoes={data.licitacoes} /></TabsContent>
          <TabsContent value="vencer"><AVencer contratos={data.contratos} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Boletim({ licitacoes }: { licitacoes: LicitacaoLike[] }) {
  const [data, setData] = useState(hojeISO());
  const b = boletimDoDia(licitacoes, data);
  return (
    <div className="mt-4 rounded-lg border bg-card p-6 print:border-0">
      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div className="grid gap-1.5">
          <Label htmlFor="data-boletim">Data do boletim</Label>
          <Input id="data-boletim" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Imprimir</Button>
      </div>
      <div className="mt-6">
        <h2 className="font-display text-xl font-bold">Boletim de licitações — {dataBR(data)}</h2>
        <p className="text-sm text-muted-foreground">Prefeitura Municipal de Pau dos Ferros/RN</p>
        <h3 className="mt-4 font-semibold">Aberturas do dia ({b.doDia.length})</h3>
        {b.doDia.length ? (
          <table className="mt-2 w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-2">Número</th><th className="p-2">Modalidade</th><th className="p-2">Objeto</th><th className="p-2 text-right">Valor estimado</th></tr></thead>
            <tbody>
              {b.doDia.map((l) => (
                <tr key={l.numero} className="border-t">
                  <td className="p-2">{l.numero}</td><td className="p-2">{l.modalidade}</td>
                  <td className="p-2 line-clamp-2">{l.objeto}</td><td className="p-2 text-right">{brl(l.valor_estimado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="mt-2 text-sm text-muted-foreground">Nenhuma abertura nesta data.</p>}
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          {b.porModalidade.map(([m, n]) => <span key={m} className="rounded bg-secondary px-2 py-1">{m}: <strong>{n}</strong></span>)}
          <span className="rounded bg-secondary px-2 py-1">Total estimado: <strong>{brl(b.totalEstimado)}</strong></span>
        </div>
        <h3 className="mt-5 font-semibold">Avisos — aberturas nos próximos 7 dias ({b.proximas.length})</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {b.proximas.map((l) => <li key={l.numero}><strong>{dataBR(l.data_abertura)}</strong> · {l.numero} — {l.modalidade}</li>)}
          {!b.proximas.length && <li className="text-muted-foreground">Nenhuma abertura programada.</li>}
        </ul>
      </div>
    </div>
  );
}

function Mapa({ licitacoes }: { licitacoes: LicitacaoLike[] }) {
  const [f, setF] = useState({ modalidade: "", situacao: "", secretaria: "", de: "", ate: "" });
  const rows = mapaLicitacoes(licitacoes, { modalidade: f.modalidade || undefined, situacao: f.situacao || undefined, secretaria: f.secretaria || undefined, de: f.de || undefined, ate: f.ate || undefined });
  const secretarias = [...new Set(licitacoes.map((l) => l.secretaria).filter(Boolean))] as string[];
  const total = rows.reduce((s, r) => s + (Number(r.valor_estimado) || 0), 0);
  const exportar = () => baixar(`mapa-licitacoes-${hojeISO()}.csv`, toCSV(
    ["Número", "Modalidade", "Situação", "Abertura", "Secretaria", "Valor estimado", "Objeto"],
    rows.map((r) => [r.numero, r.modalidade, r.situacao, r.data_abertura, r.secretaria, r.valor_estimado, r.objeto]),
  ));
  const sel = "h-9 rounded-md border border-input bg-background px-3 text-sm";
  return (
    <div className="mt-4 rounded-lg border bg-card p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5"><Label>Modalidade</Label>
          <select className={sel} value={f.modalidade} onChange={(e) => setF({ ...f, modalidade: e.target.value })}>
            <option value="">Todas</option>{BIDDING_MODALITIES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5"><Label>Situação</Label>
          <select className={sel} value={f.situacao} onChange={(e) => setF({ ...f, situacao: e.target.value })}>
            <option value="">Todas</option>{Object.values(BIDDING_STATUS).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5"><Label>Secretaria</Label>
          <select className={sel} value={f.secretaria} onChange={(e) => setF({ ...f, secretaria: e.target.value })}>
            <option value="">Todas</option>{secretarias.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5"><Label>Abertura de</Label><Input type="date" value={f.de} onChange={(e) => setF({ ...f, de: e.target.value })} /></div>
        <div className="grid gap-1.5"><Label>até</Label><Input type="date" value={f.ate} onChange={(e) => setF({ ...f, ate: e.target.value })} /></div>
        <Button variant="outline" onClick={exportar}><Download className="size-4" /> Exportar CSV</Button>
      </div>
      <p className="mt-4 text-sm"><strong>{rows.length}</strong> processo(s) · valor estimado total: <strong>{brl(total)}</strong></p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-2">Número</th><th className="p-2">Modalidade</th><th className="p-2">Situação</th><th className="p-2">Abertura</th><th className="p-2">Secretaria</th><th className="p-2 text-right">Valor estimado</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.numero} className="border-t">
                <td className="p-2">{r.numero}</td><td className="p-2">{r.modalidade}</td><td className="p-2">{r.situacao}</td>
                <td className="p-2">{r.data_abertura ? dataBR(r.data_abertura) : "—"}</td><td className="p-2">{r.secretaria}</td>
                <td className="p-2 text-right">{brl(r.valor_estimado)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nenhum processo com esses filtros.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AVencer({ contratos }: { contratos: ContratoLike[] }) {
  const [dias, setDias] = useState(60);
  const rows = contratosAVencer(contratos, hojeISO(), dias);
  const exportar = () => baixar(`contratos-a-vencer-${hojeISO()}.csv`, toCSV(
    ["Número", "Fornecedor", "Vigência atualizada", "Dias restantes", "Valor atualizado", "Objeto"],
    rows.map((r) => [r.numero, r.fornecedor, r.fim, r.diasRestantes, r.valor_atualizado ?? r.valor, r.objeto]),
  ));
  return (
    <div className="mt-4 rounded-lg border bg-card p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5"><Label>Vencendo em até</Label>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={dias} onChange={(e) => setDias(Number(e.target.value))}>
            <option value={30}>30 dias</option><option value={60}>60 dias</option><option value={90}>90 dias</option><option value={180}>180 dias</option>
          </select>
        </div>
        <Button variant="outline" onClick={exportar}><Download className="size-4" /> Exportar CSV</Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-2">Alerta</th><th className="p-2">Contrato</th><th className="p-2">Fornecedor</th><th className="p-2">Vigência atualizada</th><th className="p-2 text-right">Valor atualizado</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.numero} className="border-t">
                <td className="p-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${r.diasRestantes <= 30 ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"}`}>
                    {r.diasRestantes} dia(s)
                  </span>
                </td>
                <td className="p-2">{r.numero}</td><td className="p-2">{r.fornecedor}</td>
                <td className="p-2">{dataBR(r.fim)}</td>
                <td className="p-2 text-right">{brl(r.valor_atualizado ?? r.valor)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhum contrato vencendo no período.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
