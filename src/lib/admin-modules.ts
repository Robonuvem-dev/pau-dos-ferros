import { getModule } from './modules';

export const WEBMAIL_URL = 'https://webmail.atllas.org/login?domain=paudosferros.rn.gov.br';
type Page = '/admin/webmail' | '/admin/usuarios' | '/admin/auditoria' | '/admin/melhorias' | '/admin/aparencia' | '/admin/pendencias' | '/admin/licitacoes-relatorios' | '/admin/esic' | '/admin/atricon' | '/admin/servicos-estatisticas' | '/sobre' | '/conta' | '/';
export interface AdminModule { id: string; title: string; keys: string[]; pages?: { label: string; to: Page }[]; publicKeys?: string[] }
export const ADMIN_MODULES: AdminModule[] = [
  { id: '1', title: 'Infraestrutura, instalação e segurança', keys: [], pages: [{ label: 'Usuários e permissões', to: '/admin/usuarios' }, { label: 'Auditoria e acessos', to: '/admin/auditoria' }, { label: 'Pedidos de melhoria', to: '/admin/melhorias' }, { label: 'Minha conta', to: '/conta' }, { label: 'Versão do sistema', to: '/sobre' }] },
  { id: '2', title: 'Portal institucional oficial', keys: ['banners','noticias','albuns','midias','agentes-politicos','secretarias','links-uteis','documentos','concurso','unidades-gestoras'], pages: [{ label: 'Aparência do site', to: '/admin/aparencia' }, { label: 'Críticas e pendências', to: '/admin/pendencias' }] },
  { id: '3', title: 'Licitações, contratos e aditivos', keys: ['licitacoes','andamentos-licitacao','contratos','credores','empresas-inidoneas','comissoes','membros-equipe','parcerias','termos-fomento'], pages: [{ label: 'Boletim, mapa e contratos a vencer', to: '/admin/licitacoes-relatorios' }, { label: 'Críticas e pendências', to: '/admin/pendencias' }] },
  { id: '4', title: 'Convênios públicos', keys: ['convenios','concedentes','convenentes','categorias-convenio','metas-convenio','planos-aplicacao','convenio-parcelas','convenio-obrigacoes','convenio-aplicacoes'] },
  { id: '5', title: 'Portais e informações municipais', keys: ['municipio-informacoes','leis','decretos','portarias','resolucoes','diarias','lrf','rreo','rgf'], pages: [{ label: 'e-SIC e Ouvidoria', to: '/admin/esic' }] },
  { id: '6', title: 'COVID-19 e emergências', keys: ['boletim-epidemiologico'], publicKeys: ['covid'] },
  { id: '7', title: 'Integrações e importação TCE', keys: ['despesas','receitas','servidores','credores','agentes-politicos'] },
  { id: '8', title: 'LC 131 — transparência fiscal', keys: ['receitas','despesas','medicamentos'] },
  { id: '9', title: 'Pessoal e folha de pagamento', keys: ['servidores'] },
  { id: '10', title: 'Fiscalização de obras públicas', keys: ['processos-engenharia','obras','obra-andamentos','obra-medicoes','obra-arts','obra-fotos','plano-diretor','plano-diretor-fases','plano-diretor-equipe','plano-diretor-eixos','plano-diretor-acoes'] },
  { id: '11', title: 'Veículos e frotas', keys: ['veiculos'] },
  { id: '12', title: 'Conselhos municipais', keys: ['conselhos','conselho-membros','conselho-acoes','conselho-doc'] },
  { id: '13', title: 'Aplicativo Android e iOS', keys: ['noticias','leis','decretos','licitacoes','rreo','rgf'], pages: [{ label: 'Portal do cidadão', to: '/' }, { label: 'Estatísticas de acesso aos serviços', to: '/admin/servicos-estatisticas' }] },
  { id: '14', title: 'Inteligência artificial e ATRICON', keys: [], pages: [{ label: 'Avaliação ATRICON e análise com IA', to: '/admin/atricon' }] },
  { id: '15', title: 'Carta de serviços ao cidadão', keys: ['servicos','servico-solicitacoes'], pages: [{ label: 'Estatísticas de acessos e satisfação', to: '/admin/servicos-estatisticas' }] },
  { id: '16', title: 'Webmail institucional', keys: [], pages: [{ label: 'Abrir webmail', to: '/admin/webmail' }] },
];
export const adminResourceLabel = (key: string) => ({ 'metas-convenio': 'Metas e especificações técnicas', 'planos-aplicacao': 'Planos de aplicação', 'boletim-epidemiologico': 'Boletim epidemiológico' }[key] ?? getModule(key)?.label ?? key);