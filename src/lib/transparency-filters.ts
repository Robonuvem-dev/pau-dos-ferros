import type { Field } from './modules';
export function filterPublicRows<T extends Record<string, unknown>>(rows: T[], fields: Field[], q: string, filters: Record<string, string>, record?: string, display?: (field: Field, value: unknown) => string) {
  const normalize = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return rows.filter(r => (!record || r.id === record) && (!q || fields.some(f => normalize(display?.(f, r[f.name]) ?? r[f.name]).includes(normalize(q)))) && fields.every(f => {
    const value = filters[f.name];
    const de = filters[`${f.name}_de`]; const ate = filters[`${f.name}_ate`];
    if (f.type === 'date') return (!de || String(r[f.name] ?? '') >= de) && (!ate || (!!r[f.name] && String(r[f.name]).slice(0, 10) <= ate));
    if (!value) return true;
    return ['select', 'relation', 'bool', 'int'].includes(f.type ?? '') ? String(r[f.name] ?? '') === value : normalize(r[f.name]).includes(normalize(value));
  }));
}