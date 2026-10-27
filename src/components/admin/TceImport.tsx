import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTceCatalog, importTceData } from "@/lib/tce.functions";
import { mapTceRows } from "@/lib/tce";
import { IMPORT_COLUNAS } from "@/lib/importacao";
import { db } from "@/lib/data";
import { getModule, formatCell } from "@/lib/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Result = {
  url: string;
  downloadedAt: string;
  tables: Record<string, Record<string, unknown>[]>;
  data: unknown;
};
export function TceImport({ modulo, onDone }: { modulo: string; onDone: () => void }) {
  const catalog = useQuery({
    queryKey: ["tce-catalog"],
    queryFn: () => getTceCatalog(),
    retry: false,
    staleTime: 300000,
  });
  const [path, setPath] = useState("");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>();
  const [table, setTable] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const endpoint = catalog.data?.endpoints.find((e) => e.path === path);
  const rows = result?.tables[table] ?? [];
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const fields = getModule(modulo)?.fields ?? [];
  const chooseTable = (name: string) => {
    setTable(name);
    setSelected([]);
    setMapping({});
    setPage(0);
  };
  async function download() {
    setBusy(true);
    setError("");
    setSuccess("");
    setResult(undefined);
    try {
      const data = JSON.parse(await importTceData({ data: { path, parameters } })) as Result;
      setResult(data);
      chooseTable(Object.keys(data.tables)[0] ?? "");
      setOpen(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function include() {
    setBusy(true);
    setError("");
    try {
      if (!selected.length || selected.length > 500)
        throw new Error("Selecione entre 1 e 500 registros.");
      if (!mapping.chave_externa)
        throw new Error("Selecione um identificador oficial estável no mapeamento.");
      if (selected.some((i) => !String(rows[i]![mapping.chave_externa!] ?? "").trim()))
        throw new Error("Há registros sem identificador oficial. Revise a seleção.");
      const mapped = mapTceRows(
        modulo,
        selected.map((i) => rows[i]!),
        mapping,
      );
      const response = await db.rpc("importar_dados_poc", {
        _modulo: modulo,
        _origem: "TCE/RN Dados Abertos",
        _linhas: mapped,
      });
      if (response.error)
        throw new Error(
          response.error.code === "23505"
            ? "Há registros já incluídos. O lote foi recusado sem duplicação; revise a seleção."
            : "Inclusão recusada. Confira suas permissões e os campos selecionados.",
        );
      setSuccess(`${response.data} registros incluídos em ${getModule(modulo)?.label}.`);
      setSelected([]);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const messages = (
    <>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {success && <p role="status">{success}</p>}
    </>
  );
  const selectClass = "h-10 max-w-full rounded border bg-background px-2";
  return (
    <section aria-label="Importação TCE/RN" className="mb-5 space-y-3 rounded border p-4">
      <h2 className="font-semibold">TCE/RN — {getModule(modulo)?.label}</h2>
      <p className="text-sm">
        Consulte a fonte oficial, revise os dados e escolha os registros a incluir neste cadastro.
        Os parâmetros de município e unidade gestora devem identificar a entidade de origem. Inclua
        somente registros compatíveis com este cadastro; totais de balanço não substituem
        lançamentos individuais.
      </p>
      {catalog.error && (
        <p role="alert">Não foi possível consultar o Swagger oficial: {catalog.error.message}</p>
      )}
      <Button
        variant="outline"
        disabled={busy || catalog.isFetching}
        onClick={() => void catalog.refetch()}
      >
        {catalog.isFetching ? "Consultando fontes..." : "Atualizar endpoints do TCE"}
      </Button>
      <label className="grid gap-1 text-sm">
        Endpoint oficial
        <select
          className={selectClass}
          value={path}
          disabled={busy}
          onChange={(e) => {
            setPath(e.target.value);
            setParameters({});
            setResult(undefined);
            setError("");
            setSuccess("");
          }}
        >
          <option value="">
            Selecione o serviço de {getModule(modulo)?.label.toLocaleLowerCase("pt-BR")}
          </option>
          {catalog.data?.endpoints.map((e) => (
            <option key={e.path} value={e.path}>
              {e.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-3">
        {endpoint?.parameters.map((p) => (
          <label key={p.name} className="grid gap-1 text-sm" title={p.description}>
            {p.name}
            {p.required ? " *" : ""}
            {p.options ? (
              <select
                className={selectClass}
                value={parameters[p.name] ?? ""}
                disabled={busy}
                onChange={(e) => setParameters((v) => ({ ...v, [p.name]: e.target.value }))}
              >
                <option value="">Selecione</option>
                {p.options.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ) : (
              <Input
                disabled={busy}
                type={["integer", "number"].includes(p.type) ? "number" : "text"}
                value={parameters[p.name] ?? ""}
                onChange={(e) => setParameters((v) => ({ ...v, [p.name]: e.target.value }))}
              />
            )}
            <span className="max-w-72 text-xs text-muted-foreground">{p.description}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          disabled={
            busy ||
            !endpoint ||
            endpoint.parameters.some((p) => p.required && !parameters[p.name]?.trim())
          }
          onClick={() => void download()}
        >
          {busy ? "Processando..." : "Importar dados do TCE"}
        </Button>
        {result && (
          <Button variant="outline" onClick={() => setOpen(true)}>
            Ver dados baixados
          </Button>
        )}
      </div>
      {!open && messages}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!busy) setOpen(v);
        }}
      >
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Dados oficiais do TCE/RN</DialogTitle>
            <DialogDescription>
              A consulta não grava dados automaticamente. Mapeie os campos e selecione até 500
              registros para inclusão. Dados já existentes são recusados sem sobrescrever o
              cadastro.
            </DialogDescription>
          </DialogHeader>
          {messages}
          <p className="break-all text-xs">
            Fonte: {result?.url} ·{" "}
            {result?.downloadedAt && new Date(result.downloadedAt).toLocaleString("pt-BR")}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(result?.data, null, 2)], { type: "application/json" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "tce-resposta.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Baixar resposta original
          </Button>
          <label className="grid text-sm">
            Conjunto de dados
            <select
              className={selectClass}
              value={table}
              disabled={busy}
              onChange={(e) => chooseTable(e.target.value)}
            >
              {Object.keys(result?.tables ?? {}).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <p className="text-sm">
            {rows.length} registros nesta resposta. Se o serviço for paginado, consulte as demais
            páginas pelos parâmetros do endpoint.
          </p>
          {rows.length > 0 && (
            <>
              <details>
                <summary className="cursor-pointer font-medium">
                  Mapeamento para {getModule(modulo)?.label} (obrigatório antes de incluir)
                </summary>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(IMPORT_COLUNAS[modulo] ?? []).map((c) => (
                    <label key={c} className="grid text-sm">
                      {fields.find((f) => f.name === c)?.label ?? c}
                      {c === "chave_externa" && " (identificador oficial único)"}
                      <select
                        className={selectClass}
                        value={mapping[c] ?? ""}
                        disabled={busy}
                        onChange={(e) => setMapping((m) => ({ ...m, [c]: e.target.value }))}
                      >
                        <option value="">Não incluir campo</option>
                        {columns.map((col) => (
                          <option key={col}>{col}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </details>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setSelected(rows.slice(0, 500).map((_, i) => i))}
                >
                  Selecionar primeiros {Math.min(500, rows.length)}
                </Button>
                <Button variant="outline" disabled={busy} onClick={() => setSelected([])}>
                  Limpar seleção
                </Button>
                <Button disabled={busy || !selected.length} onClick={() => void include()}>
                  Incluir {selected.length} selecionados no cadastro
                </Button>
              </div>
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th>Incluir</th>
                      {columns.map((c) => (
                        <th key={c} className="border p-2">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(page * 50, page * 50 + 50).map((r, j) => {
                      const i = page * 50 + j;
                      return (
                        <tr key={i}>
                          <td>
                            <input
                              type="checkbox"
                              aria-label={`Selecionar registro ${i + 1}`}
                              disabled={busy || (!selected.includes(i) && selected.length >= 500)}
                              checked={selected.includes(i)}
                              onChange={(e) =>
                                setSelected((s) =>
                                  e.target.checked ? [...s, i] : s.filter((n) => n !== i),
                                )
                              }
                            />
                          </td>
                          {columns.map((c) => (
                            <td key={c} className="border p-2">
                              {typeof r[c] === "object" && r[c] !== null
                                ? JSON.stringify(r[c])
                                : formatCell(
                                    fields.find((f) => mapping[f.name] === c) ?? {
                                      name: c,
                                      label: c,
                                    },
                                    r[c],
                                  )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span>
                  Página {page + 1} de {Math.ceil(rows.length / 50)}
                </span>
                <Button
                  variant="outline"
                  disabled={(page + 1) * 50 >= rows.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
