import { createFileRoute, notFound } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/CrudModule";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { adminModuleQuery } from "@/lib/admin-queries";
import { getModule } from "@/lib/modules";
import { pageHead } from '@/lib/seo';

export const Route = createFileRoute("/_authenticated/admin/$module")({
  validateSearch: (s: Record<string, unknown>): { novo?: boolean } => (s.novo === true || s.novo === "1" || s.novo === 1 ? { novo: true } : {}),
  loader: ({ context, params }) => {
    const mod = getModule(params.module);
    if (!mod) throw notFound();
    return context.queryClient.ensureQueryData(adminModuleQuery(mod.key));
  },
  head: ({ params }) => pageHead(getModule(params.module)?.label ?? 'Cadastro indisponível', getModule(params.module)?.descricao ?? 'Cadastro administrativo municipal.'),
  component: Page,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Page() {
  const { module } = Route.useParams();
  const { novo } = Route.useSearch();
  const mod = getModule(module);
  if (!mod) return <QueryNotFound />;
  return <CrudModule key={mod.key} mod={mod} startNew={novo ?? false} />;
}
