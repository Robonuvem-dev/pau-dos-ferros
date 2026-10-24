import { queryOptions } from '@tanstack/react-query';
import { readConfiguracoes, readEstatisticasAtendimento, readEstatisticasServicos, readPublicModule } from './public.functions';

export const moduleQuery = (key: string) => queryOptions({
  queryKey: ['public-module', key], queryFn: () => readPublicModule({ data: { key } }), staleTime: 60_000,
});

export const estatisticasQuery = queryOptions({
  queryKey: ['public-estatisticas-atendimento'], queryFn: () => readEstatisticasAtendimento(), staleTime: 15_000, refetchInterval: 15_000,
});

export const configQuery = queryOptions({
  queryKey: ['public-config'], queryFn: () => readConfiguracoes(), staleTime: 30_000,
});

export const servicosStatsQuery = queryOptions({
  queryKey: ['public-servicos-stats'], queryFn: () => readEstatisticasServicos(), staleTime: 30_000,
});
