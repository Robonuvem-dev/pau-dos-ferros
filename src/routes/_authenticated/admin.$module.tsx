import { createFileRoute, notFound } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/CrudModule";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { adminModuleQuery } from "@/lib/admin-queries";
import { getModule } from "@/lib/modules";

export const Route = createFileRoute("/_authenticated/admin/$module")({
  validateSearch: (s: Record<string, unknown>): { novo?: boolean } => (s.novo === true || s.novo === "1" || s.novo === 1 ? { novo: true } : {}),
  loader: ({ context, params }) => {
    if (!getModule(params.module)) throw notFound();
    return context.queryClient.ensureQueryData(adminModuleQuery(params.module));
  },
  component: Page,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Page() {
  const { module } = Route.useParams();
  const { novo } = Route.useSearch();
  return <CrudModule key={module} mod={getModule(module)!} startNew={novo ?? false} />;
}
