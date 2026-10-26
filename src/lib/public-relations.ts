import { getModule, MODULES, type Field } from './modules';

/** Lookup public records without confusing duplicate labels or ignoring municipal acronyms. */
export function resolvePublicRelation(field: Field, value: unknown, rows: Record<string, unknown>[]) {
  const ref = field.ref;
  if (!ref || !getModule(ref.module)?.publico || value == null || value === '') return null;
  const normalize = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const matches = rows.filter(r => normalize(r[ref.column]) === normalize(value) || (ref.module === 'secretarias' && normalize(r.sigla) === normalize(value)));
  const match = matches.length === 1 ? matches[0] : undefined;
  const record = match?.id;
  return { module: ref.module, label: String(match?.[ref.displayColumn ?? ref.column] ?? value), search: typeof record === 'string' ? { registro: record } : { q: String(value) } };
}

export function reversePublicRelations(module: string, row: Record<string, unknown>) {
  return MODULES.filter(m => m.publico).flatMap(m => m.fields.filter(f => f.ref?.module === module && row[f.ref.column] != null && row[f.ref.column] !== '').map(f => ({ module: m.key, label: m.label, field: f.name, value: String(row[f.ref?.column ?? ''] ?? '') })));
}