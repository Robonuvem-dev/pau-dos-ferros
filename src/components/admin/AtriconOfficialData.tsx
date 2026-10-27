import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAtriconCatalog, importAtriconPublication } from "@/lib/atricon-official.functions";
import {
  ATRICON_DOWNLOADS,
  ATRICON_YEARS,
  officialResourceKey,
  formatOfficialCell,
  MAX_OFFICIAL_BYTES,
  type OfficialDownload,
  type OfficialImport,
} from "@/lib/atricon-official";
import { parseOfficialFile, officialDocumentBlob } from "@/lib/atricon-file";
import {
  listAtriconImports,
  saveAtriconImport,
  type StoredAtriconImport,
} from "@/lib/atricon-storage";

function downloadOriginal(stored: StoredAtriconImport) {
  const url = URL.createObjectURL(stored.original),
    a = document.createElement("a");
  a.href = url;
  a.download = `ATRICON-${stored.imported.resource.year}.${stored.imported.resource.format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function PdfPreview({ stored, name }: { stored: StoredAtriconImport; name: string }) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true,
      objectUrl = "";
    void officialDocumentBlob(stored.original, stored.imported.resource.format, name)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => setError("Não foi possível abrir este documento. Baixe o arquivo original."));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [stored, name]);
  if (error) return <p role="alert">{error}</p>;
  return url ? (
    <iframe title={`Documento ATRICON: ${name}`} src={url} className="h-[55vh] w-full border" />
  ) : (
    <p>Preparando documento...</p>
  );
}
function ImportDetails({ stored }: { stored: StoredAtriconImport }) {
  const data = stored.imported;
  const [item, setItem] = useState(data.sheets.length ? "sheet:0" : "doc:0");
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(0);
  const [kind, index] = item.split(":"),
    sheet = kind === "sheet" ? data.sheets[Number(index)] : undefined;
  const doc = kind === "doc" ? data.documents[Number(index)] : undefined;
  const rows = useMemo(
    () =>
      sheet?.rows.filter(
        (row) =>
          !search ||
          row.some((v) => v.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))),
      ) ?? [],
    [sheet, search],
  );
  const pages = Math.max(1, Math.ceil(rows.length / 50));
  return (
    <>
      <dl className="grid gap-1 text-sm">
        <div>
          <dt className="inline font-semibold">Ciclo: </dt>
          <dd className="inline">{data.resource.year}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Publicação: </dt>
          <dd className="inline">{data.resource.label}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Importação: </dt>
          <dd className="inline">
            {new Date(data.importedAt).toLocaleString("pt-BR")} ·{" "}
            {(data.bytes / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB
          </dd>
        </div>
        <div className="break-all">
          <dt className="inline font-semibold">SHA-256: </dt>
          <dd className="inline font-mono">{data.sha256}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Origem: </dt>
          <dd className="inline">
            <a
              href={data.resource.url}
              target="_blank"
              rel="noreferrer"
              className="break-all text-primary underline"
            >
              {data.resource.url}
            </a>
          </dd>
        </div>
      </dl>
      {data.resource.archiveEntry && (
        <p className="break-all text-sm">
          Planilha extraída do pacote oficial: {data.resource.archiveEntry}. O download preservou a
          planilha original, sem baixar as demais UFs.{" "}
          <a
            href={data.resource.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            Baixar pacote completo
          </a>
        </p>
      )}
      {data.importFilter && (
        <p className="text-sm">
          Filtro de importação: {data.importFilter}. Foram lidos{" "}
          {data.sourceRows?.toLocaleString("pt-BR")} registros da fonte; a tabela contém somente as
          correspondências.
        </p>
      )}
      {data.resource.provenance === "manual" && (
        <p className="text-sm">
          Arquivo fornecido pelo operador. O conteúdo foi preservado; sua presença no catálogo
          oficial não foi confirmada automaticamente.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-sm">
          Conteúdo
          <select
            className="max-w-full rounded border bg-background p-2"
            value={item}
            onChange={(e) => {
              setItem(e.target.value);
              setSearch("");
              setPage(0);
            }}
          >
            {data.sheets.map((s, i) => (
              <option value={`sheet:${i}`} key={`s${i}`}>
                {s.name} ({s.rows.length} registros)
              </option>
            ))}
            {data.documents.map((d, i) => (
              <option value={`doc:${i}`} key={`d${i}`}>
                {d.name} ({d.type})
              </option>
            ))}
          </select>
        </label>
        <Button className="self-end" variant="outline" onClick={() => downloadOriginal(stored)}>
          Baixar arquivo original
        </Button>
      </div>
      {sheet && (
        <>
          {!!sheet.preamble?.length && (
            <details className="text-sm">
              <summary>Informações iniciais da planilha</summary>
              {sheet.preamble.map((r, i) => (
                <p key={i}>{r.join(" · ")}</p>
              ))}
            </details>
          )}
          <Input
            aria-label="Pesquisar nos dados ATRICON"
            placeholder="Município, órgão, UF, critério ou qualquer valor"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
          <p className="text-sm">
            {rows.length.toLocaleString("pt-BR")} registros encontrados · {sheet.headers.length}{" "}
            colunas
          </p>
          <div className="max-h-[48vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-secondary">
                <tr>
                  {sheet.headers.map((h, i) => (
                    <th key={i} className="whitespace-nowrap border p-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(page * 50, (page + 1) * 50).map((r, i) => (
                  <tr key={i}>
                    {r.map((v, j) => (
                      <td className="min-w-32 max-w-md border p-2 align-top" key={j}>
                        <span className="line-clamp-4 break-words" title={v}>
                          {formatOfficialCell(sheet.headers[j] ?? "", v)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" disabled={!page} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm">
              Página {page + 1} de {pages}
            </span>
            <Button
              variant="outline"
              disabled={page + 1 >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      )}
      {doc &&
        (doc.type === "application/pdf" ? (
          <PdfPreview stored={stored} name={doc.name} />
        ) : (
          <p>
            Este item não é uma tabela ou PDF. Seu conteúdo foi preservado no arquivo original para
            download.
          </p>
        ))}
    </>
  );
}

export function AtriconOfficialData({
  onReference,
}: {
  onReference: (value: OfficialImport | null) => void;
}) {
  const catalog = useQuery({
    queryKey: ["atricon-official-catalog"],
    queryFn: () => getAtriconCatalog(),
    retry: false,
    staleTime: 300_000,
  });
  const [year, setYear] = useState(2025),
    [selectedUrl, setSelectedUrl] = useState("");
  const [imports, setImports] = useState<StoredAtriconImport[]>([]),
    [current, setCurrent] = useState<StoredAtriconImport | null>(null);
  const [importFilter, setImportFilter] = useState("");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false);
  useEffect(() => {
    let active = true;
    void listAtriconImports()
      .then((rows) => {
        if (active) setImports(rows);
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      });
    return () => {
      active = false;
    };
  }, []);
  const resources = (catalog.data ?? []).filter((r) => r.year === year);
  const resource = resources.find((r) => officialResourceKey(r) === selectedUrl) ?? resources[0];
  const years = [
    ...new Set([
      ...ATRICON_YEARS,
      ...(catalog.data ?? []).map((r) => r.year),
      ...imports.map((i) => i.imported.resource.year),
    ]),
  ].sort((a, b) => b - a);
  const selectStored = (value: StoredAtriconImport) => {
    setCurrent(value);
    onReference(value.imported);
    setOpen(false);
  };
  const finish = async (download: OfficialDownload) => {
    setMessage("Lendo o conteúdo e verificando a integridade...");
    const { imported, original } = await parseOfficialFile(download, importFilter);
    const stored = await saveAtriconImport(imported, original);
    setImports((previous) => [stored, ...previous.filter((s) => s.key !== stored.key)]);
    selectStored(stored);
    setMessage(
      `Publicação ${imported.resource.year} importada: ${imported.sheets.reduce((s, t) => s + t.rows.length, 0).toLocaleString("pt-BR")} registros e ${imported.documents.length} documentos. Os dados estão salvos neste navegador.`,
    );
  };
  const remote = async () => {
    if (!resource) return;
    setBusy(true);
    setError("");
    setMessage("Baixando a publicação oficial...");
    try {
      await finish(
        await importAtriconPublication({
          data: {
            year,
            url: resource.url,
            ...(resource.archiveEntry ? { entry: resource.archiveEntry } : {}),
          },
        }),
      );
    } catch (e) {
      setError((e as Error).message || "Não foi possível importar a publicação.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  };
  const local = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("Abrindo o arquivo fornecido...");
    try {
      if (file.size > MAX_OFFICIAL_BYTES) throw new Error("Arquivo acima de 20 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer()),
        digest = await crypto.subtle.digest("SHA-256", bytes.buffer);
      let base64 = "";
      for (let offset = 0; offset < bytes.length; offset += 24576)
        base64 += btoa(String.fromCharCode(...bytes.subarray(offset, offset + 24576)));
      const format = file.name.split(".").at(-1)?.toLowerCase() ?? "";
      if (!["xlsx", "xls", "csv", "json", "zip", "pdf"].includes(format))
        throw new Error("Escolha um arquivo XLSX, CSV, JSON, ZIP ou PDF da publicação.");
      await finish({
        resource: {
          year,
          url: ATRICON_DOWNLOADS,
          label: file.name,
          format,
          fetchable: false,
          provenance: "manual",
        },
        importedAt: new Date().toISOString(),
        sha256: [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join(""),
        bytes: bytes.length,
        base64,
      });
    } catch (e) {
      setError((e as Error).message);
      setMessage("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="mb-6 rounded border bg-card p-5" aria-labelledby="atricon-dados-oficiais">
      <h2 id="atricon-dados-oficiais" className="font-display text-2xl font-bold">
        Publicações oficiais — Radar da Transparência
      </h2>
      <p className="my-2 text-sm">
        Selecione o ciclo e importe os arquivos publicados pela ATRICON. A publicação selecionada
        será registrada como referência das evidências e do anexo técnico. Resultados de outro ano
        não aprovam automaticamente os 88 pontos do portal.
      </p>
      <a
        className="text-sm text-primary underline"
        href={ATRICON_DOWNLOADS}
        target="_blank"
        rel="noreferrer"
      >
        Abrir página oficial de downloads
      </a>
      <div className="my-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          Ciclo ATRICON
          <select
            aria-label="Ciclo ATRICON"
            className="rounded border bg-background p-2"
            value={year}
            disabled={busy}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setSelectedUrl("");
              setCurrent(null);
              onReference(null);
              setMessage("");
              setError("");
            }}
          >
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 flex-1 gap-1 text-sm">
          Publicação
          <select
            aria-label="Publicação ATRICON"
            className="max-w-full rounded border bg-background p-2"
            value={resource ? officialResourceKey(resource) : ""}
            disabled={busy || !resources.length}
            onChange={(e) => setSelectedUrl(e.target.value)}
          >
            <option value="" disabled>
              {catalog.isPending ? "Consultando fonte oficial..." : "Selecione uma publicação"}
            </option>
            {resources.map((r) => (
              <option key={officialResourceKey(r)} value={officialResourceKey(r)}>
                {r.label} · {r.format.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <Input
          className="max-w-sm"
          aria-label="Filtrar importação por município ou órgão"
          placeholder="Município ou órgão (opcional)"
          value={importFilter}
          disabled={busy}
          onChange={(e) => setImportFilter(e.target.value)}
        />
        <Button disabled={busy || !resource?.fetchable} onClick={() => void remote()}>
          {busy ? "Importando..." : "Importar publicação oficial"}
        </Button>
        <Button
          variant="outline"
          disabled={busy || catalog.isFetching}
          onClick={() => void catalog.refetch()}
        >
          Atualizar fontes
        </Button>
      </div>
      {catalog.error && (
        <p role="alert" className="my-2 text-sm text-destructive">
          Não foi possível consultar a fonte oficial: {catalog.error.message}. Abra a página de
          downloads para verificar a disponibilidade.
        </p>
      )}
      {!catalog.isPending && !catalog.error && !resources.length && (
        <p className="my-2 text-sm">
          Nenhum arquivo deste ciclo foi identificado na página oficial. Nenhum endereço de arquivo
          foi presumido.
        </p>
      )}
      {resource && !resource.fetchable && (
        <p className="my-2 text-sm">
          {resource.notice ||
            "A publicação está hospedada em outro domínio. Baixe o arquivo na fonte e abra-o abaixo."}
        </p>
      )}
      <details className="my-3 text-sm">
        <summary className="cursor-pointer">Abrir arquivo já baixado da fonte oficial</summary>
        <p className="my-2">
          A atribuição da origem será registrada como informada pelo operador. Aceita XLSX, CSV,
          JSON, ZIP e PDF, até 20 MB.
        </p>
        <Input
          aria-label="Arquivo ATRICON baixado"
          type="file"
          accept=".xlsx,.xls,.csv,.json,.zip,.pdf"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void local(file);
          }}
        />
      </details>
      {message && (
        <p role="status" className="my-3 text-sm">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="my-3 text-destructive">
          {error}
        </p>
      )}
      {!!imports.length && (
        <label className="my-3 grid gap-1 text-sm">
          Publicações salvas neste navegador
          <select
            aria-label="Publicações importadas"
            className="rounded border bg-background p-2"
            value={current?.key ?? ""}
            disabled={busy}
            onChange={(e) => {
              const value = imports.find((s) => s.key === e.target.value);
              if (value) {
                setYear(value.imported.resource.year);
                selectStored(value);
              }
            }}
          >
            <option value="">Selecionar referência</option>
            {imports.map((s) => (
              <option key={s.key} value={s.key}>
                {s.imported.resource.year} · {s.imported.resource.label} ·{" "}
                {new Date(s.imported.importedAt).toLocaleDateString("pt-BR")}
              </option>
            ))}
          </select>
        </label>
      )}
      {current && (
        <div className="my-3 flex flex-wrap items-center gap-3">
          <span className="text-sm">
            Referência ativa: {current.imported.resource.year} · {current.imported.resource.label}
          </span>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Ver dados baixados
          </Button>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Dados importados da ATRICON</DialogTitle>
            <DialogDescription>
              Conteúdo preservado da publicação selecionada, com origem, ciclo e integridade.
            </DialogDescription>
          </DialogHeader>
          {current && <ImportDetails key={current.key} stored={current} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
