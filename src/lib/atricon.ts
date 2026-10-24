// 88 pontos de avaliação de transparência (matriz ATRICON / PNTP), agrupados por dimensão.
// "fonte": módulo para orientar a busca de evidências; contagem não comprova conformidade.
// Todos os resultados positivos exigem evidência registrada pela equipe.
export type AtriconStatus = "atende" | "nao_atende" | "terceiro";
export interface Criterio { id: string; dimensao: string; descricao: string; fonte: string | null }

const raw: [string, string, string | null][] = [
  ["Informações prioritárias", "Possui sítio oficial próprio na internet", "portal"],
  ["Informações prioritárias", "Possui portal da transparência próprio", "portal"],
  ["Informações prioritárias", "Acesso ao portal da transparência visível na capa do site", "portal"],
  ["Informações prioritárias", "Site e portal possuem ferramenta de pesquisa de conteúdo", "portal"],
  ["Informações institucionais", "Divulga a estrutura organizacional", "secretarias"],
  ["Informações institucionais", "Divulga competências e atribuições dos órgãos", "secretarias"],
  ["Informações institucionais", "Identifica os dirigentes e agentes políticos", "agentes-politicos"],
  ["Informações institucionais", "Divulga endereços, telefones e e-mails das unidades", "secretarias"],
  ["Informações institucionais", "Divulga horários de atendimento", "secretarias"],
  ["Informações institucionais", "Divulga as leis municipais", "lei"],
  ["Informações institucionais", "Divulga os decretos municipais", "decreto"],
  ["Informações institucionais", "Divulga as portarias", "portaria"],
  ["Informações institucionais", "Disponibiliza perguntas frequentes (FAQ)", "portal"],
  ["Informações institucionais", "Divulga a agenda do gestor", null],
  ["Informações institucionais", "Divulga as redes sociais oficiais", "portal"],
  ["Receitas", "Divulga a receita prevista e arrecadada", "receitas"],
  ["Receitas", "Classifica a receita por categoria", "receitas"],
  ["Receitas", "Atualiza a receita em tempo real (até o 1º dia útil)", "receitas"],
  ["Receitas", "Divulga a inscrição e arrecadação da dívida ativa", null],
  ["Receitas", "Divulga as renúncias de receita", null],
  ["Despesas", "Divulga a despesa empenhada, liquidada e paga", "despesas"],
  ["Despesas", "Classifica a despesa por órgão e função", "despesas"],
  ["Despesas", "Identifica o credor/favorecido", "despesas"],
  ["Despesas", "Informa o número do empenho", "despesas"],
  ["Despesas", "Atualiza a despesa em tempo real", "despesas"],
  ["Despesas", "Divulga a ordem cronológica de pagamentos", null],
  ["Despesas", "Divulga a relação de credores/fornecedores", "credores"],
  ["Convênios e transferências", "Divulga transferências recebidas", "convenios"],
  ["Convênios e transferências", "Divulga transferências realizadas", "convenios"],
  ["Convênios e transferências", "Divulga acordos firmados sem transferência de recursos", null],
  ["Convênios e transferências", "Divulga emendas parlamentares recebidas", null],
  ["Recursos humanos", "Divulga a relação nominal de servidores", "servidores"],
  ["Recursos humanos", "Informa cargo, função e vínculo", "servidores"],
  ["Recursos humanos", "Informa a lotação dos servidores", "servidores"],
  ["Recursos humanos", "Divulga a remuneração individualizada", "servidores"],
  ["Recursos humanos", "Divulga a tabela de padrão remuneratório dos cargos", null],
  ["Recursos humanos", "Divulga a lista de estagiários", "servidores"],
  ["Recursos humanos", "Divulga a lista de terceirizados", null],
  ["Recursos humanos", "Divulga concursos públicos e processos seletivos", "concurso"],
  ["Diárias", "Identifica beneficiário e cargo das diárias", "diaria"],
  ["Diárias", "Divulga valor, período e motivo das diárias", "diaria"],
  ["Diárias", "Divulga a tabela de valores de diárias", null],
  ["Licitações", "Divulga a relação das licitações", "licitacoes"],
  ["Licitações", "Informa número, modalidade, objeto e situação", "licitacoes"],
  ["Licitações", "Disponibiliza a íntegra dos editais", "licitacoes"],
  ["Licitações", "Divulga dispensas e inexigibilidades com fundamentação", "licitacoes"],
  ["Licitações", "Divulga as atas de registro de preços", "contratos"],
  ["Licitações", "Divulga o plano de contratações anual", null],
  ["Licitações", "Divulga empresas inidôneas e suspensas", "empresas-inidoneas"],
  ["Licitações", "Divulga o regulamento interno de licitações", null],
  ["Contratos", "Divulga a relação dos contratos", "contratos"],
  ["Contratos", "Disponibiliza a íntegra dos contratos", "contratos"],
  ["Contratos", "Divulga os termos aditivos", "contratos"],
  ["Contratos", "Identifica os fiscais de contrato", null],
  ["Contratos", "Divulga a ordem cronológica dos pagamentos contratuais", null],
  ["Obras", "Divulga obras com objeto, valor e situação", "obras"],
  ["Obras", "Informa o percentual executado", "obras"],
  ["Obras", "Informa obras paralisadas e os motivos", "obras"],
  ["Obras", "Identifica a empresa contratada e o responsável técnico", "obras"],
  ["Planejamento e prestação de contas", "Divulga o Plano Plurianual (PPA)", "lei"],
  ["Planejamento e prestação de contas", "Divulga a Lei de Diretrizes Orçamentárias (LDO)", "lei"],
  ["Planejamento e prestação de contas", "Divulga a Lei Orçamentária Anual (LOA)", "lei"],
  ["Planejamento e prestação de contas", "Divulga a prestação de contas anual e o parecer prévio do TCE", null],
  ["Planejamento e prestação de contas", "Divulga os conselhos municipais e sua composição", "conselhos"],
  ["Planejamento e prestação de contas", "Divulga o julgamento das contas pela Câmara", null],
  ["Responsabilidade fiscal", "Divulga o RREO", "rreo"],
  ["Responsabilidade fiscal", "Divulga o RGF", "rgf"],
  ["Responsabilidade fiscal", "Divulga versão simplificada do RREO e RGF", null],
  ["Transparência passiva", "Informa endereço, telefone e horário do SIC físico", "secretarias"],
  ["Transparência passiva", "Permite pedido de informação eletrônico (e-SIC)", "portal"],
  ["Transparência passiva", "Não exige identificação que inviabilize o pedido", "portal"],
  ["Transparência passiva", "Permite acompanhar o pedido por protocolo", "portal"],
  ["Transparência passiva", "Divulga relatório estatístico dos pedidos", "portal"],
  ["Transparência passiva", "Divulga a norma municipal que regulamenta a LAI", null],
  ["Transparência passiva", "Divulga o rol de informações classificadas e desclassificadas", null],
  ["Ouvidoria", "Disponibiliza canal eletrônico de ouvidoria", "portal"],
  ["Ouvidoria", "Divulga a carta de serviços ao usuário", "servicos"],
  ["Ouvidoria", "Divulga o relatório anual da ouvidoria", null],
  ["Acessibilidade", "Oferece recurso de alto contraste", "portal"],
  ["Acessibilidade", "Oferece aumento de fonte", "portal"],
  ["Acessibilidade", "Disponibiliza mapa do site", "portal"],
  ["Acessibilidade", "Permite exportação em formatos abertos (CSV/JSON)", "portal"],
  ["LGPD e governo digital", "Identifica o encarregado de dados (DPO)", "portal"],
  ["LGPD e governo digital", "Publica a política de privacidade", "portal"],
  ["LGPD e governo digital", "Oferece serviços públicos digitais", "servicos"],
  ["LGPD e governo digital", "Divulga a regulamentação municipal da LGPD", null],
  ["Setoriais", "Divulga o plano municipal de saúde e relatórios de gestão", null],
  ["Setoriais", "Divulga o plano municipal de educação", null],
];

export const CRITERIOS: Criterio[] = raw.map(([dimensao, descricao, fonte], i) => ({ id: String(i + 1).padStart(2, "0"), dimensao, descricao, fonte }));

export interface EvidenciaAtricon {
  status: AtriconStatus;
  observacao?: string | null | undefined;
  link?: string | null | undefined;
}
export interface Avaliacao extends Criterio {
  status: AtriconStatus;
  automatico: boolean;
  observacao?: string | null | undefined;
  link?: string | null | undefined;
}

function evidenciaValida(m: EvidenciaAtricon): boolean {
  if ((m.observacao ?? "").trim().length < 10) return false;
  try {
    const url = new URL(m.link ?? "");
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

/** Contagens localizam cadastros; jamais homologam um ponto ATRICON.
 * Uma marcação positiva é declaração manual com URL e registro de verificação.
 * A execução da matriz da PoC permanece uma etapa independente.
 */
export function avaliar(counts: Record<string, number>, manuais: Record<string, EvidenciaAtricon>): Avaliacao[] {
  void counts;
  return CRITERIOS.map((c) => {
    const m = manuais[c.id];
    if (m?.status === "nao_atende") return { ...c, ...m, automatico: false };
    if (m && evidenciaValida(m)) return { ...c, ...m, automatico: false };
    return {
      ...c,
      status: "nao_atende",
      automatico: false,
      observacao: m ? "Marcação sem URL de evidência e registro suficiente de verificação." : "Sem evidência de execução registrada.",
    };
  });
}

export const STATUS_LABEL: Record<AtriconStatus, string> = { atende: "Atende", nao_atende: "Não atende", terceiro: "Portal de terceiro" };
