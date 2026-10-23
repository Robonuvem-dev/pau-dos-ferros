import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchModule } from "@/lib/data";
import { getModule } from "@/lib/modules";
import { avaliarPendencias, REGRAS } from "@/lib/criticas";

export const Route = createFileRoute("/_authenticated/admin/pendencias")({
  head: () => ({ meta: [{ title: "Críticas e pendências | Painel" }] }),
  component: Pendencias,
});

const cor = { alta: "bg-destructive text-destructive-foreground", media: "bg-accent text-accent-foreground", baixa: "bg-secondary text-secondary-foreground" };

function Pendencias() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pendencias"],
    queryFn: async () => {
      const entries = await Promise.all(REGRAS.map(async (r) => [r.modulo, await fetchModule(getModule(r.modulo)!)] as const));
      return avaliarPendencias(Object.fromEntries(entries));
    },
  });
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Críticas e pendências</h1>
      <p className="mb-4 text-sm text-muted-foreground">Verificação automática de todos os módulos. Corrija pelo link de cada item.</p>
      {isLoading && <p>Verificando...</p>}
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      {data && (
        <>
          <p className="mb-3 text-sm"><strong>{data.length}</strong> pendência(s): {data.filter((d) => d.gravidade === "alta").length} alta(s).</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left"><tr><th className="p-2">Gravidade</th><th className="p-2">Módulo</th><th className="p-2">Registro</th><th className="p-2">Problema</th><th className="p-2"></th></tr></thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2"><span className={`rounded px-2 py-0.5 text-xs font-semibold ${cor[p.gravidade]}`}>{p.gravidade}</span></td>
                    <td className="p-2">{getModule(p.modulo)?.label}</td>
                    <td className="p-2">{p.registro}</td>
                    <td className="p-2">{p.problema}</td>
                    <td className="p-2"><Link to="/admin/$module" params={{ module: p.modulo }} className="text-primary underline">Corrigir</Link></td>
                  </tr>
                ))}
                {!data.length && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhuma pendência.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
