import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { QueryError, QueryNotFound } from "@/components/site/RouteStates";
import { moduleQuery } from "@/lib/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/secretarias")({
  head: () => pageHead("Secretarias", "Estrutura organizacional, secretários, endereços, telefones e horários de atendimento."),
  loader: ({ context }) => context.queryClient.ensureQueryData(moduleQuery("secretarias")),
  component: Secretarias,
  errorComponent: QueryError,
  notFoundComponent: QueryNotFound,
});

function Secretarias() {
  const { data } = useSuspenseQuery(moduleQuery("secretarias"));
  return (
    <>
      <PageHeader title="Secretarias" subtitle="Estrutura organizacional e canais de atendimento." />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 md:grid-cols-2">
        {data.map((s) => (
          <section key={s.id} className="rounded-lg border bg-card p-5 shadow-card">
            {s.sigla ? <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{String(s.sigla)}</span> : null}
            <h2 className="mt-2 font-display text-xl font-bold">{String(s.nome)}</h2>
            {s.secretario ? <p className="text-sm text-muted-foreground">Responsável: {String(s.secretario)}</p> : null}
            {s.descricao ? <p className="mt-2 text-sm">{String(s.descricao)}</p> : null}
            <ul className="mt-3 space-y-1 text-sm">
              {s.endereco ? <li className="flex gap-2"><MapPin className="size-4 shrink-0 text-accent" />{String(s.endereco)}</li> : null}
              {s.telefone ? <li className="flex gap-2"><Phone className="size-4 shrink-0 text-accent" />{String(s.telefone)}</li> : null}
              {s.email ? <li className="flex gap-2"><Mail className="size-4 shrink-0 text-accent" />{String(s.email)}</li> : null}
              {s.horario ? <li className="flex gap-2"><Clock className="size-4 shrink-0 text-accent" />{String(s.horario)}</li> : null}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
