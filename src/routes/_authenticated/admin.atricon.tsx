import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PainelAtricon } from '@/components/admin/PainelAtricon';
import { adminModuleQuery } from '@/lib/admin-queries';
import { avaliarPendencias, REGRAS } from '@/lib/criticas';
import { pageHead } from '@/lib/seo';
import { QueryError } from '@/components/site/RouteStates';
import { queryOptions } from '@tanstack/react-query';
const pendencias = queryOptions({ queryKey: ['atricon-pendencias'], queryFn: async () => {
  const rows = await Promise.all(REGRAS.map(async r => [r.modulo, await adminModuleQuery(r.modulo).queryFn()] as const));
  return avaliarPendencias(Object.fromEntries(rows));
} });
export const Route = createFileRoute('/_authenticated/admin/atricon')({
  head: () => pageHead('IA e avaliação ATRICON', 'Evidências dos critérios de transparência e anexo técnico com análise local.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(pendencias),
  component: Page, errorComponent: QueryError,
});
function Page() { const { data } = useSuspenseQuery(pendencias); return <div><h1 className="mb-5 font-display text-3xl font-bold">Inteligência artificial e ATRICON</h1><PainelAtricon pendencias={data} /></div>; }