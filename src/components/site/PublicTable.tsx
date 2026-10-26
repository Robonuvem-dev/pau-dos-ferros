import { baixarDocumentoCarta } from '@/lib/documentos-carta';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Download, FileText, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { moduleQuery } from '@/lib/queries';
import { formatCell, toCSV, getModule, dataBR, type Field, type ModuleDef } from '@/lib/modules';
import { filterPublicRows } from '@/lib/transparency-filters';
import { moduleReport } from '@/lib/pdf-report';

export function PublicTable({ mod, registro, initialSearch = '' }: { mod: ModuleDef; registro?: string | undefined; initialSearch?: string | undefined }) {
  const { data } = useSuspenseQuery(moduleQuery(mod.key));
  const [q, setQ] = useState(initialSearch);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const relations = useMemo(() => [...new Set(mod.fields.filter(f => f.ref && getModule(f.ref.module)?.publico).map(f => f.ref?.module ?? ''))], [mod]);
  const related = useQueries({ queries: relations.map(moduleQuery) });
  const timeline = useQuery({ ...moduleQuery('andamentos-licitacao'), enabled: mod.key === 'licitacoes' });
  const relationRows = (module: string) => related[relations.indexOf(module)]?.data ?? [];
  const label = (f: Field, value: unknown) => {
    const ref = f.ref;
    if (!ref) return formatCell(f, value);
    const match = relationRows(ref.module).find(r => String(r[ref.column]) === String(value));
    return match ? String(match[ref.displayColumn ?? ref.column] ?? value) : formatCell(f, value);
  };
  const rows = filterPublicRows(data, mod.fields, q, filters, registro, label);
  const cols = mod.fields.filter(f => !f.hideInTable);
  const details = mod.fields.filter(f => f.hideInTable);
  const filterFields = mod.fields.filter(f => !['file', 'files', 'tags'].includes(f.type ?? '') && !f.readOnly);
  const cell = (f: Field, r: Record<string, unknown>) => {
    const value = r[f.name];
    if (value == null || value === '') return '—';
    if (f.ref && getModule(f.ref.module)?.publico) {
      const ref = f.ref;
      const match = relationRows(ref.module).find(row => String(row[ref.column]) === String(value));
      return <Link className="text-primary underline underline-offset-2" to="/transparencia/$module" params={{ module: ref.module }} search={match ? { registro: match.id } : { q: String(value) }}>{label(f, value)}</Link>;
    }
    if (f.type === 'file') return <a href={String(value)} aria-label={`Abrir ${f.label}: ${String(r.titulo ?? r.numero ?? r.nome ?? r.id)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">{f.name === 'foto_url' ? <img src={String(value)} alt={String(r.modelo ?? r.legenda ?? 'Foto do registro')} loading="lazy" className="h-24 w-36 rounded object-cover" /> : <><FileText className="size-4" />{f.label}</>}</a>;
    if (f.type === 'files' && Array.isArray(value)) return <ul>{value.map((url, i) => <li key={String(url)}><a className="text-primary underline" href={String(url)} target="_blank" rel="noreferrer">Arquivo {i + 1}</a></li>)}</ul>;
    return formatCell(f, value);
  };
  const exportar = (type: 'csv' | 'json') => {
    if (mod.key === 'servicos') { void baixarDocumentoCarta(type, rows.map(r => r.id)).catch(e => toast.error(e.message)); return; }
    const url = URL.createObjectURL(new Blob([type === 'csv' ? '\uFEFF' + toCSV(mod.fields, rows) : JSON.stringify(rows, null, 2)], { type: type === 'csv' ? 'text/csv' : 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `${mod.key}.${type}`; a.click(); URL.revokeObjectURL(url);
  };
  const detailList = (r: Record<string, unknown>, fields: Field[]) => <dl className="grid gap-4 sm:grid-cols-2">{fields.map(f => <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}><dt className="text-sm font-semibold text-muted-foreground">{f.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{cell(f, r)}</dd></div>)}</dl>;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3 border-b pb-4">
      <div className="relative min-w-0 flex-1 basis-60"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={`Pesquisar em ${mod.label}`} placeholder="Pesquisar nesta consulta..." value={q} onChange={e => setQ(e.target.value)} className="pl-9" /></div>
      <span className="text-sm text-muted-foreground">{rows.length} registro(s)</span>
      <Sheet><SheetTrigger asChild><Button variant="outline" size="sm"><SlidersHorizontal />Filtros{Object.values(filters).filter(Boolean).length ? ` (${Object.values(filters).filter(Boolean).length})` : ''}</Button></SheetTrigger><SheetContent className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>Filtros — {mod.label}</SheetTitle><SheetDescription>Refinar registros</SheetDescription></SheetHeader><div className="mt-6 grid gap-4">{filterFields.map(f => {
        const set = (key: string, value: string) => setFilters(p => ({ ...p, [key]: value }));
        const options = [...new Set([...(f.options ?? []), ...data.map(r => String(r[f.name] ?? '')).filter(Boolean)])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        const title = f.name === 'secretaria' ? 'Órgão / Secretaria' : f.label;
        if (f.type === 'date') return <fieldset key={f.name} className="grid gap-2"><legend className="font-semibold">{title}</legend><label>De<Input aria-label={`${title} de`} type="date" value={filters[`${f.name}_de`] ?? ''} onChange={e => set(`${f.name}_de`, e.target.value)} /></label><label>Até<Input aria-label={`${title} até`} type="date" value={filters[`${f.name}_ate`] ?? ''} onChange={e => set(`${f.name}_ate`, e.target.value)} /></label></fieldset>;
        return <label key={f.name} className="grid gap-1.5 text-sm font-semibold">{title}{['select', 'relation', 'bool', 'int'].includes(f.type ?? '') ? <select aria-label={`Filtrar ${title}`} className="h-10 w-full rounded-md border bg-background px-3 font-normal" value={filters[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}><option value="">Todos</option>{options.map(o => <option key={o} value={o}>{label(f, o)}</option>)}</select> : <Input aria-label={`Filtrar ${title}`} value={filters[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} />}</label>;
      })}<Button variant="outline" onClick={() => { setFilters({}); setQ(''); }}>Limpar filtros</Button></div></SheetContent></Sheet>
      <Button variant="outline" size="sm" onClick={() => exportar('csv')}><Download />CSV</Button><Button variant="outline" size="sm" onClick={() => exportar('json')}><Download />JSON</Button><Button variant="outline" size="sm" onClick={() => void moduleReport(mod, rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, mod.fields.find(f => f.name === k)?.ref ? label(mod.fields.find(f => f.name === k) as Field, v) : v]))), `Pesquisa: ${q || 'todos'} · Filtros: ${JSON.stringify(filters)}`).catch(e => toast.error(e.message))}><FileText />PDF</Button>
    </div>
    {registro && <Link to="/transparencia/$module" params={{ module: mod.key }} search={{}} className="inline-block text-primary underline">Ver todos os registros</Link>}
    {!rows.length && <p className="py-6 text-muted-foreground">Nenhum registro encontrado.</p>}
    {['concurso', 'licitacoes', 'contratos', 'convenios'].includes(mod.key) ? <div className="space-y-4">{rows.map(r => <article key={r.id} className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-display text-xl font-bold">{String(r.titulo ?? `${mod.label} ${r.numero ?? ''}`)}</h2><span className="text-sm font-semibold text-primary">{String(r.situacao ?? r.tipo ?? '')}</span></div>
      <details open={!!registro} className="mt-4"><summary className="cursor-pointer text-primary">Ver detalhes completos</summary><div className="mt-4">{detailList(r, mod.fields.filter(f => f.name !== 'etapas'))}</div></details>
      {mod.key === 'concurso' && <section className="mt-5"><h3 className="font-semibold">Etapas e cronograma</h3><ol className="mt-3 space-y-3 border-l-2 border-primary pl-4">{String(r.etapas ?? '').split('\n').filter(s => s.trim()).map((s, i) => <li key={i} className="whitespace-pre-wrap">{s}</li>)}</ol>{!r.etapas && <p className="text-sm text-muted-foreground">Etapas ainda não publicadas.</p>}</section>}
      {mod.key === 'licitacoes' && <section className="mt-5"><h3 className="font-semibold">Linha do tempo do processo {String(r.numero)}</h3>{timeline.error ? <p role="alert">Não foi possível carregar os andamentos.</p> : <ol className="mt-3 space-y-4 border-l-2 border-primary pl-4">{(timeline.data ?? []).filter(a => a.licitacao_numero === r.numero).sort((a, b) => String(a.data ?? '').localeCompare(String(b.data ?? ''))).map(a => <li key={a.id}><div className="font-semibold">{String(a.fase)} · {dataBR(a.data)}</div><p className="whitespace-pre-wrap text-sm">{String(a.descricao ?? '')}</p>{a.arquivo_url && <a href={String(a.arquivo_url)} className="text-primary underline" target="_blank" rel="noreferrer">Anexo da fase</a>}</li>)}</ol>}{!timeline.isPending && !(timeline.data ?? []).some(a => a.licitacao_numero === r.numero) && <p className="text-sm text-muted-foreground">Nenhum andamento publicado para este processo.</p>}</section>}
      {mod.key === 'contratos' && r.tipo !== 'Aditivo' && <section className="mt-4"><h3 className="font-semibold">Aditivos vinculados</h3><ul className="mt-2 space-y-2">{data.filter(a => a.tipo === 'Aditivo' && a.contrato_origem_id === r.id).map(a => <li key={a.id}><Link className="text-primary underline" to="/transparencia/$module" params={{ module: 'contratos' }} search={{ registro: a.id }}>{String(a.numero)} · {formatCell({name:'valor',label:'Valor',type:'money'},a.valor)} · {dataBR(a.data_fim)}</Link></li>)}</ul>{!data.some(a => a.tipo === 'Aditivo' && a.contrato_origem_id === r.id) && <p className="text-sm text-muted-foreground">Nenhum aditivo vinculado.</p>}</section>}
      {mod.key === 'convenios' && <section className="mt-5 grid gap-4 sm:grid-cols-2"><div><h3 className="font-semibold">Metas do convênio</h3><p className="whitespace-pre-wrap">{String(r.metas || 'Não informadas')}</p></div><div><h3 className="font-semibold">Especificações técnicas</h3><p className="whitespace-pre-wrap">{String(r.especificacoes_tecnicas || 'Não informadas')}</p></div></section>}
    </article>)}</div> : <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm"><caption className="sr-only">{mod.label}: {rows.length} registro(s)</caption><thead className="bg-secondary text-left"><tr>{cols.map(f => <th key={f.name} scope="col" className="px-4 py-3">{f.label}</th>)}{!!details.length && <th scope="col" className="px-4 py-3">Detalhes</th>}</tr></thead><tbody>{rows.map(r => <tr key={r.id} className="border-t align-top">{cols.map(f => <td key={f.name} className="px-4 py-3">{cell(f, r)}</td>)}{!!details.length && <td className="px-4 py-3"><details open={!!registro}><summary className="cursor-pointer text-primary">Ver informações completas</summary><div className="mt-4 min-w-60">{detailList(r, details)}</div></details></td>}</tr>)}</tbody></table></div>}
  </div>;
}
