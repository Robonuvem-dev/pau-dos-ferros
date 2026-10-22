import { queryOptions } from '@tanstack/react-query';
import { readEstatisticasAtendimento, readPublicModule } from './public.functions';

export const moduleQuery = (key: string) => queryOptions({
  queryKey: ['public-module', key], queryFn: () => readPublicModule({ data: { key } }), staleTime: 60_000,
});

export const estatisticasQuery = queryOptions({
  queryKey: ['public-estatisticas-atendimento'], queryFn: () => readEstatisticasAtendimento(), staleTime: 60_000,
});
