import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Headphones, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { MODULES } from "@/lib/modules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/transparencia/")({
  head: () => pageHead("Portal da Transparência", "Receitas, despesas, licitações, contratos, servidores, obras e relatórios fiscais de Pau dos Ferros (LAI e LC 131/2009)."),
  component: Transparencia,
});

const GRUPOS = ["Transparência", "Licitações e Contratos", "Gestão", "Site Oficial"] as const;

function Transparencia() {
  return (
    <>
      <PageHeader title="Portal da Transparência" subtitle="Consulte, pesquise e baixe os dados públicos do município em formatos abertos." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {GRUPOS.map((g) => {
          const mods = MODULES.filter((m) => m.publico && m.grupo === g);
          if (!mods.length) return null;
          return (
            <section key={g} className="mb-10">
              <h2 className="section-title">{g === "Site Oficial" ? "Institucional" : g}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mods.map((m) => (
                  <Link key={m.key} to="/transparencia/$module" params={{ module: m.key }} className="flex gap-3 rounded-lg border bg-card p-4 transition hover:border-primary hover:shadow-card">
                    <FileText className="mt-0.5 size-5 shrink-0 text-accent" />
                    <span><span className="block font-semibold">{m.label}</span><span className="text-sm text-muted-foreground">{m.descricao}</span></span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        <section className="grid gap-3 sm:grid-cols-2">
          <Link to="/esic" className="flex gap-3 rounded-lg bg-primary p-5 text-primary-foreground"><Headphones className="size-6" /><span><span className="block font-bold">e-SIC — Pedido de informação</span><span className="text-sm opacity-90">Lei de Acesso à Informação (Lei 12.527/2011)</span></span></Link>
          <Link to="/lgpd" className="flex gap-3 rounded-lg bg-primary-deep p-5 text-primary-foreground"><ShieldCheck className="size-6" /><span><span className="block font-bold">Proteção de dados (LGPD)</span><span className="text-sm opacity-90">Encarregado e política de privacidade</span></span></Link>
        </section>
      </div>
    </>
  );
}
