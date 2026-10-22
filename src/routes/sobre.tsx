import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { HISTORICO, VERSAO } from "@/lib/versao";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o sistema | Prefeitura de Pau dos Ferros" },
      { name: "description", content: "Versão, histórico de atualizações e informações do portal da Prefeitura de Pau dos Ferros/RN." },
      { property: "og:title", content: "Sobre o sistema | Prefeitura de Pau dos Ferros" },
      { property: "og:description", content: "Versão e histórico de atualizações do portal municipal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div>
      <PageHeader title="Sobre o sistema" />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-lg border bg-card p-5">
          <p><strong>Versão atual:</strong> {VERSAO}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Portal institucional, Transparência e serviços ao cidadão da Prefeitura Municipal de Pau dos Ferros/RN.
            As atualizações são aplicadas automaticamente, sem necessidade de instalação, e ficam registradas abaixo.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl font-bold">Histórico de atualizações</h2>
          <ol className="space-y-4">
            {HISTORICO.map((h) => (
              <li key={h.versao} className="rounded-lg border bg-card p-4">
                <div className="font-semibold">Versão {h.versao} — {new Date(h.data + "T12:00:00").toLocaleDateString("pt-BR")}</div>
                <ul className="mt-2 list-disc pl-5 text-sm">{h.itens.map((i) => <li key={i}>{i}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
