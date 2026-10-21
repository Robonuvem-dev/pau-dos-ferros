import { queryOptions } from '@tanstack/react-query';
import { readPublicModule } from './public.functions';
export const moduleQuery = (key: string) => queryOptions({
  queryKey: ['public-module', key], queryFn: () => readPublicModule({ data: { key } }), staleTime: 60_000,
});