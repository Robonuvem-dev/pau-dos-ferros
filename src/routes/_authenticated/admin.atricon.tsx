import { useState } from "react";
import { AtriconOfficialData } from "@/components/admin/AtriconOfficialData";
import type { OfficialImport } from "@/lib/atricon-official";
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PainelAtricon } from '@/components/admin/PainelAtricon';
import { fetchModule } from '@/lib/data';
import { getModule } from '@/lib/modules';
import { avaliarPendencias, REGRAS } from '@/lib/criticas';
import { pageHead } from '@/lib/seo';
import { QueryError } from '@/components/site/RouteStates';
import { queryOptions } from '@tanstack/react-query';
const pendencias = queryOptions({ queryKey: ['atricon-pendencias'], queryFn: async () => {
  const rows = await Promise.all(REGRAS.map(async r => {
    const mod = getModule(r.modulo);
    if (!mod) throw new Error('Cadastro indisponível: ' + r.modulo);
    return [r.modulo, await fetchModule(mod)] as const;
  }));
  return avaliarPendencias(Object.fromEntries(rows));
} });
export const Route = createFileRoute('/_authenticated/admin/atricon')({
  head: () => pageHead('IA e avaliação ATRICON', 'Evidências dos critérios de transparência e anexo técnico com análise local.'),
  component: Page, errorComponent: QueryError,
});
function Page() {
  const { data, error, refetch } = useQuery({...pendencias,retry:false});
  const [reference,setReference]=useState<OfficialImport|null>(null);
  return <div><h1 className="mb-5 font-display text-3xl font-bold">Inteligência artificial e ATRICON</h1><AtriconOfficialData onReference={setReference}/>{data?<PainelAtricon pendencias={data} referencia={reference}/>:error?<div role="alert"><p>Não foi possível carregar o diagnóstico dos cadastros. As publicações oficiais continuam disponíveis acima.</p><Button variant="outline" onClick={()=>void refetch()}>Recarregar diagnóstico</Button></div>:<p role="status">Carregando diagnóstico dos cadastros...</p>}</div>;
}