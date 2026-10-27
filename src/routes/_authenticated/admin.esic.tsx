import { createFileRoute } from '@tanstack/react-router';
import { GestaoEsic } from '@/components/admin/GestaoEsic';
import { pageHead } from '@/lib/seo';
export const Route = createFileRoute('/_authenticated/admin/esic')({
  head: () => pageHead('Gestão de e-SIC e Ouvidoria', 'Atendimentos, encaminhamentos, respostas e prazos do cidadão.'),
  component: Page,
});
function Page() { return <div><h1 className="font-display text-3xl font-bold">e-SIC e Ouvidoria</h1><GestaoEsic /></div>; }