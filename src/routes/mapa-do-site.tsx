import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { MODULES } from "@/lib/modules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/mapa-do-site")({
  head: () => pageHead("Mapa do site", "Todas as páginas e consultas do portal da Prefeitura de Pau dos Ferros."),
  component: Mapa,
});

function Mapa() {
  const link = "text-primary hover:underline";
  return (
    <>
      <PageHeader title="Mapa do site" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <section>
          <h2 className="font-display text-lg font-bold">Portal</h2>
          <ul className="mt-2 space-y-1">
            <li><Link className={link} to="/">Início</Link></li>
            <li><Link className={link} to="/prefeitura">A Prefeitura</Link></li>
            <li><Link className={link} to="/secretarias">Secretarias</Link></li>
            <li><Link className={link} to="/servicos">Carta de serviços</Link></li>
            <li><Link className={link} to="/noticias">Notícias</Link></li>
            <li><Link className={link} to="/galeria">Galeria</Link></li>
            <li><Link className={link} to="/busca" search={{ q: "" }}>Pesquisa</Link></li>
            <li><Link className={link} to="/acessibilidade">Acessibilidade</Link></li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold">Transparência</h2>
          <ul className="mt-2 space-y-1">
            <li><Link className={link} to="/transparencia">Portal da Transparência</Link></li>
            {MODULES.filter((m) => m.publico).map((m) => <li key={m.key}><Link className={link} to="/transparencia/$module" params={{ module: m.key }}>{m.label}</Link></li>)}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold">Atendimento</h2>
          <ul className="mt-2 space-y-1">
            <li><Link className={link} to="/esic">Ouvidoria e e-SIC</Link></li>
            <li><Link className={link} to="/lgpd">Proteção de dados (LGPD)</Link></li>
            <li><Link className={link} to="/auth">Área restrita</Link></li>
          </ul>
        </section>
      </div>
    </>
  );
}
