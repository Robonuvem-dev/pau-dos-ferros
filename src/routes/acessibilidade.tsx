import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/acessibilidade")({
  head: () => pageHead("Acessibilidade", "Recursos de acessibilidade do portal: alto contraste, aumento de fonte, atalhos e navegação por teclado."),
  component: Acessibilidade,
});

function Acessibilidade() {
  return (
    <>
      <PageHeader title="Acessibilidade" subtitle="Este portal segue as recomendações do eMAG e da WCAG." />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
        <p>Para facilitar o acesso de todas as pessoas, o portal oferece:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Alto contraste:</strong> botão “Contraste” na barra superior.</li>
          <li><strong>Aumento de fonte:</strong> botão “A+” na barra superior, ou as teclas Ctrl + (mais) do navegador.</li>
          <li><strong>Ir para o conteúdo:</strong> pressione Tab ao abrir a página para pular direto ao conteúdo principal.</li>
          <li><strong>Navegação por teclado:</strong> todos os menus, formulários e tabelas funcionam com Tab, Enter e setas.</li>
          <li><strong>Leitores de tela:</strong> imagens têm descrição e formulários têm rótulos.</li>
          <li><strong>Dados abertos:</strong> todas as consultas podem ser baixadas em CSV e JSON.</li>
        </ul>
        <p>Recomendamos o uso do <a className="text-primary underline" href="https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras" target="_blank" rel="noreferrer">VLibras</a> para tradução em Libras.</p>
      </div>
    </>
  );
}
