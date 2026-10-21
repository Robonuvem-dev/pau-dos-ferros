import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { MODULES } from './modules';
import type { Row } from './data';

export const readPublicModule = createServerFn({ method: 'GET' })
  .inputValidator((input: { key: string }) => input)
  .handler(async ({ data }) => {
    const mod = MODULES.find(m => m.key === data.key);
    if (!mod) throw new Error('Consulta indisponível');
    const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
    const client = createClient(process.env['SUPABASE_URL']!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const columns = [...new Set(['id', ...mod.fields.map(f => f.name), ...(mod.key === 'noticias' ? ['publicado_em'] : []), ...(mod.key === 'albuns' ? ['fotos'] : [])])].join(',');
    let query = client.from(mod.table).select(columns);
    if (mod.filtro) query = query.eq(mod.filtro.column, mod.filtro.value);
    if (mod.key === 'noticias') query = query.eq('publicado', true);
    if (mod.key === 'banners') query = query.eq('ativo', true);
    if (mod.orderBy) query = query.order(mod.orderBy, { ascending: ['nome','ordem','placa'].includes(mod.orderBy) });
    const { data: rows, error } = await query.limit(1000);
    if (error) throw new Error('Não foi possível carregar a consulta.');
    return rows as unknown as Row[];
  });