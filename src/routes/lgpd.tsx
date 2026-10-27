import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { NovoPedido } from "./esic";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/lgpd")({
  head: () => pageHead("Proteção de Dados (LGPD)", "Política de privacidade, encarregado de dados e canal para exercer seus direitos como titular (Lei 13.709/2018)."),
  component: Lgpd,
});

function Lgpd() {
  return (
    <>
      <PageHeader title="Proteção de Dados Pessoais" subtitle="Como a Prefeitura de Aurora das Veredas trata seus dados (Lei 13.709/2018)." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[3fr_2fr]">
        <article className="space-y-5 leading-relaxed">
          <section>
            <h2 className="section-title">Encarregado de dados (DPO)</h2>
            <div className="mt-4 rounded-lg border bg-card p-4">
              <p><strong>Encarregado:</strong> Controladoria-Geral do Município</p>
              <p><strong>E-mail:</strong> Consulte os canais de proteção de dados em Secretarias.</p>
              <p><strong>Endereço:</strong> Sede administrativa — Aurora das Veredas</p>
            </div>
          </section>
          <section>
            <h2 className="section-title">Política de privacidade</h2>
            <h3 className="mt-4 font-bold">1. Quais dados coletamos</h3>
            <p>Somente os dados necessários à prestação do serviço solicitado: nome, e-mail, telefone e o conteúdo das manifestações. Os dados de navegação são usados apenas para estatísticas de acesso, sem identificação pessoal.</p>
            <h3 className="mt-4 font-bold">2. Para que usamos</h3>
            <p>Para responder pedidos de informação e manifestações, prestar serviços públicos e cumprir obrigações legais (art. 7º, II e III, e art. 23 da LGPD).</p>
            <h3 className="mt-4 font-bold">3. Compartilhamento</h3>
            <p>Os dados não são vendidos nem compartilhados para fins comerciais. Podem ser compartilhados com órgãos de controle quando exigido por lei.</p>
            <h3 className="mt-4 font-bold">4. Segurança e retenção</h3>
            <p>Os dados ficam em ambiente protegido, com acesso restrito a servidores autorizados e registro de todas as operações (logs de auditoria). São mantidos pelo tempo exigido pela legislação de arquivos públicos.</p>
            <h3 className="mt-4 font-bold">5. Seus direitos</h3>
            <p>Você pode confirmar a existência de tratamento, acessar, corrigir, solicitar a exclusão ou a portabilidade dos seus dados e revogar consentimentos (art. 18 da LGPD), usando o formulário ao lado.</p>
          </section>
        </article>
        <aside>
          <h2 className="font-display text-xl font-bold">Exercer meus direitos</h2>
          <NovoPedido canalFixo="lgpd" />
        </aside>
      </div>
    </>
  );
}
