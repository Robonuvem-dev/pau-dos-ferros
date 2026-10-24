import type { Row } from './data';

/** Municipal publication periods follow the local civil date, not UTC. */
export function municipalDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function visibleBanners(rows: Row[], today: string): Row[] {
  return rows.filter(row => row.ativo === true && row.imagem_url &&
    (!row.inicio || String(row.inicio) <= today) &&
    (!row.fim || String(row.fim) >= today));
}