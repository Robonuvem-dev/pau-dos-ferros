import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { MODULES } from './modules';
import type { Row } from './data';

function publicClient() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const readPublicModule = createServerFn({ method: 'GET' })
  .inputValidator((input: { key: string }) => input)
  .handler(async ({ data }) => {
    const mod = MODULES.find(m => m.key === data.key);
    if (!mod) throw new Error('Consulta indisponível');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = publicClient() as any;
    const columns = [...new Set(['id', ...mod.fields.map(f => f.name), ...(mod.key === 'servicos' ? ['visualizacoes'] : []), ...(mod.key === 'noticias' ? ['publicado_em'] : [])])].join(',');
    let query = client.from(mod.table).select(columns);
    if (mod.filtro) query = query.eq(mod.filtro.column, mod.filtro.value);
    if (mod.key === 'noticias') query = query.eq('publicado', true).or(`agendar_para.is.null,agendar_para.lte.${new Date().toISOString().slice(0, 10)}`);
    if (mod.key === 'banners') query = query.eq('ativo', true);
    if (mod.key === 'links-uteis') query = query.eq('ativo', true);
    if (mod.orderBy) query = query.order(mod.orderBy, { ascending: ['nome','ordem','placa'].includes(mod.orderBy) });
    const { data: rows, error } = await query.limit(1000);
    if (error) throw new Error('Não foi possível carregar a consulta.');
    return rows as unknown as Row[];
  });

export const readEstatisticasAtendimento = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await publicClient().rpc('estatisticas_atendimentos');
  if (error) throw new Error('Não foi possível carregar as estatísticas.');
  return (data ?? []).map((r) => ({ canal: r.canal, status: r.status, total: Number(r.total) }));
});

export const readConfiguracoes = createServerFn({ method: 'GET' }).handler(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (publicClient() as any).from('configuracoes_site').select('chave,valor');
  if (error) return {} as Record<string, string>;
  return Object.fromEntries((data as { chave: string; valor: string | null }[]).map((r) => [r.chave, r.valor ?? ''])) as Record<string, string>;
});

export const readEstatisticasServicos = createServerFn({ method: 'GET' }).handler(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (publicClient() as any).rpc('estatisticas_servicos');
  if (error) return [] as { servico_id: string; avaliacoes: number; media: number; uteis: number }[];
  return data as { servico_id: string; avaliacoes: number; media: number; uteis: number }[];
});
