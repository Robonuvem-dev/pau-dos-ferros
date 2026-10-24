// Configuração central dos módulos: dirige o Portal da Transparência e o painel administrativo.
export type FieldType = "text" | "textarea" | "number" | "money" | "date" | "bool" | "file" | "tags" | "select" | "int" | "files" | "relation";

export interface Field {
  name: string;
  label: string;
  type?: FieldType;
  options?: string[];
  required?: boolean;
  hideInTable?: boolean;
  /** Para type "relation": módulo de origem e coluna gravada/exibida. */
  ref?: { module: string; column: string; displayColumn?: string };
}

export interface ModuleDef {
  key: string; // slug da URL
  table: string;
  label: string;
  descricao: string;
  grupo: "Site Oficial" | "Licitações e Contratos" | "Transparência" | "Gestão";
  filtro?: { column: string; value: string }; // para a tabela publicacoes
  orderBy?: string;
  fields: Field[];
  /** Tabela cuja permissão governa este cadastro e suas regras RLS. */
  permissionTable?: string;
  publico?: boolean; // aparece no Portal da Transparência
}

const pubFields = (extra: Field[] = []): Field[] => [
  { name: "titulo", label: "Título", required: true },
  { name: "numero", label: "Número" },
  { name: "data", label: "Data", type: "date" },
  { name: "ementa", label: "Ementa / Descrição", type: "textarea", hideInTable: true },
  { name: "orgao", label: "Órgão" },
  ...extra,
  { name: "acao_emergencial", label: "Ação emergencial vinculada", type: "select", options: ["COVID-19", "Outra emergência"] },
  { name: "ano", label: "Exercício", type: "int" },
  { name: "arquivo_url", label: "Arquivo", type: "file" },
];

const pub = (key: string, label: string, descricao: string, extra: Field[] = []): ModuleDef => ({
  key,
  table: "publicacoes",
  label,
  descricao,
  grupo: "Transparência",
  filtro: { column: "categoria", value: key },
  orderBy: "data",
  fields: pubFields(extra),
  publico: true,
});

export const MODULES: ModuleDef[] = [
 {
 key:"processos-engenharia",table:"processos_engenharia",label:"Processos de engenharia",grupo:"Gestão",publico:true,permissionTable:"obras",orderBy:"data_processo",
 descricao:"Processos de engenharia com data, contrato inicial e fonte de recurso.",
 fields:[
 {name:"numero",label:"Número do processo",required:true},
 {name:"data_processo",label:"Data do processo",type:"date",required:true},
 {name:"valor_contrato_inicial",label:"Valor do contrato inicial",type:"money",required:true},
 {name:"contrato_id",label:"Contrato de origem",type:"relation",required:true,ref:{module:"contratos",column:"id",displayColumn:"numero"}},
 {name:"fonte_recurso",label:"Fonte de recurso",required:true},
 {name:"descricao",label:"Descrição",type:"textarea"}
 ]
 },
  {
   key:"municipio-informacoes",table:"municipio_informacoes",label:"O Município e agenda",grupo:"Site Oficial",publico:true,orderBy:"categoria",
   descricao:"História, localidades, equipamentos públicos, eventos e agenda institucional.",
   fields:[
    {name:"categoria",label:"Seção",type:"select",required:true,options:["História","A cidade","Praças","Sítios","Postos de saúde","Distritos","Escolas","Prédios públicos","Eventos","Agenda do gestor"]},
    {name:"titulo",label:"Título",required:true},
    {name:"descricao",label:"Descrição",type:"textarea",required:true},
    {name:"endereco",label:"Endereço"},{name:"horario",label:"Horário"},
    {name:"contato",label:"Contato"},{name:"data_evento",label:"Data do evento",type:"date"},
    {name:"foto_url",label:"Foto",type:"file"}
   ]
  },
  {
    key: "noticias", table: "noticias", label: "Notícias", grupo: "Site Oficial", orderBy: "publicado_em",
    descricao: "Notícias com fotos, vídeos e áudios.",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "slug", label: "Endereço (slug)", hideInTable: true },
      { name: "categoria", label: "Categoria" },
      { name: "resumo", label: "Resumo", type: "textarea", hideInTable: true },
      { name: "conteudo", label: "Conteúdo", type: "textarea", hideInTable: true },
      { name: "capa_url", label: "Imagem de capa", type: "file", hideInTable: true },
      { name: "video_url", label: "Vídeo (YouTube ou arquivo)", type: "file", hideInTable: true },
      { name: "audio_url", label: "Áudio", type: "file", hideInTable: true },
      { name: "tags", label: "Tags", type: "tags", hideInTable: true },
      { name: "agendar_para", label: "Publicar a partir de (agendamento)", type: "date", hideInTable: true },
      { name: "evento", label: "Evento relacionado", hideInTable: true },
      { name: "evento_data", label: "Data do evento", type: "date", hideInTable: true },
      { name: "evento_local", label: "Local do evento", hideInTable: true },
      { name: "publicado", label: "Publicado", type: "bool" },
    ],
  },
  {
    key: "banners", table: "banners", label: "Banners", grupo: "Site Oficial", orderBy: "ordem",
    descricao: "Destaques rotativos da página inicial.",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "imagem_url", label: "Imagem", type: "file" },
      { name: "link", label: "Link" },
      { name: "ordem", label: "Ordem", type: "int" },
      { name: "inicio", label: "Exibir a partir de", type: "date", hideInTable: true },
      { name: "fim", label: "Exibir até", type: "date" },
      { name: "ativo", label: "Ativo", type: "bool" },
    ],
  },
  {
    key: "links-uteis", table: "links_uteis", label: "Links úteis", grupo: "Site Oficial", orderBy: "ordem",
    descricao: "Atalhos para sites externos exibidos na página inicial.",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "url", label: "Endereço (URL)", required: true },
      { name: "icone", label: "Ícone", type: "select", options: ["Link", "Governo", "Saúde", "Educação", "Documento", "Dinheiro"] },
      { name: "ordem", label: "Ordem", type: "int" },
      { name: "ativo", label: "Ativo", type: "bool" },
    ],
  },
  {
    key: "documentos", table: "documentos", label: "Documentos digitais", grupo: "Site Oficial", orderBy: "data", publico: true,
    descricao: "Biblioteca de documentos em PDF e JPG de qualquer tipo.",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: ["Edital", "Relatório", "Plano", "Manual", "Formulário", "Ofício", "Outros"], required: true },
      { name: "data", label: "Data", type: "date" },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
      { name: "arquivo_url", label: "Arquivo (PDF/JPG)", type: "file" },
    ],
  },
  {
    key: "unidades-gestoras", table: "unidades_gestoras", label: "Unidades gestoras", grupo: "Site Oficial", orderBy: "nome", publico: true,
    descricao: "Unidades gestoras e executoras do município.",
    fields: [
      { name: "nome", label: "Unidade", required: true },
      { name: "codigo", label: "Código" },
      { name: "cnpj", label: "CNPJ" },
      { name: "tipo", label: "Tipo", type: "select", options: ["Gestora", "Executora", "Gestora e executora"] },
      { name: "responsavel", label: "Responsável" },
      { name: "secretaria", label: "Secretaria", type: "relation", ref: { module: "secretarias", column: "nome" } },
    ],
  },
  {
    key: "albuns", table: "albuns", label: "Galeria de fotos", grupo: "Site Oficial", orderBy: "data",
    descricao: "Álbuns de fotos de eventos e ações.",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "data", label: "Data", type: "date" },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
      { name: "capa_url", label: "Capa", type: "file", hideInTable: true },
      { name: "fotos", label: "Fotos do álbum", type: "files", hideInTable: true },
      { name: "legendas", label: "Legendas das fotos (uma por linha, na ordem das fotos)", type: "textarea", hideInTable: true },
    ],
  },
  {
    key: "midias", table: "midias", label: "Vídeos e áudios", grupo: "Site Oficial", orderBy: "data",
    descricao: "Vídeos e áudios informativos.",
    fields: [
      { name: "tipo", label: "Tipo", type: "select", options: ["video", "audio"] },
      { name: "titulo", label: "Título", required: true },
      { name: "url", label: "Link (YouTube) ou arquivo", type: "file" },
      { name: "data", label: "Data", type: "date" },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
    ],
  },
  {
    key: "agentes-politicos", table: "agentes_politicos", label: "Agentes políticos", grupo: "Site Oficial", orderBy: "ordem",
    descricao: "Prefeito, vice-prefeito e secretários.",
    fields: [
      { name: "nome", label: "Nome", required: true },
      { name: "cargo", label: "Cargo", required: true },
      { name: "partido", label: "Partido" },
      { name: "mandato", label: "Mandato", hideInTable: true },
      { name: "email", label: "E-mail" },
      { name: "telefone", label: "Telefone" },
      { name: "foto_url", label: "Foto", type: "file", hideInTable: true },
      { name: "biografia", label: "Biografia", type: "textarea", hideInTable: true },
      { name: "ordem", label: "Ordem", type: "int", hideInTable: true },
      {"name":"origem","label":"Sistema de origem"},
      {"name":"chave_externa","label":"Identificador na origem"},
    ],
  },
  {
    key: "secretarias", table: "secretarias", label: "Secretarias", grupo: "Site Oficial", orderBy: "nome",
    descricao: "Estrutura organizacional e contatos.", publico: true,
    fields: [
      { name: "nome", label: "Nome", required: true },
      { name: "sigla", label: "Sigla" },
      { name: "secretario", label: "Secretário(a)" },
      { name: "telefone", label: "Telefone" },
      { name: "email", label: "E-mail" },
      { name: "endereco", label: "Endereço", hideInTable: true },
      { name: "horario", label: "Horário", hideInTable: true },
      { name: "descricao", label: "Competências", type: "textarea", hideInTable: true },
    ],
  },
  {
    key: "servicos", table: "servicos", label: "Carta de serviços", grupo: "Site Oficial", orderBy: "nome",
    descricao: "Serviços oferecidos ao cidadão.",
    fields: [
      { name: "nome", label: "Serviço", required: true },
      { name: "secretaria", label: "Setor responsável", type: "relation", ref: { module: "secretarias", column: "nome" } },
      { name: "publico", label: "Público-alvo" },
      { name: "prazo", label: "Prazo" },
      { name: "custo", label: "Custo", hideInTable: true },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
      { name: "requisitos", label: "Requisitos", type: "textarea", hideInTable: true },
      { name: "link", label: "Link de acesso online", hideInTable: true },
      { name: "etapas", label: "Etapas (uma por linha)", type: "textarea", hideInTable: true },
      { name: "perfil_atendimento", label: "Perfil responsável pelo atendimento", hideInTable: true },
      { name: "anexo_url", label: "Formulário / anexo", type: "file", hideInTable: true },
      { name: "parecer_status", label: "Parecer do Ouvidor", type: "select", options: ["Aprovado", "Aprovado com ajustes", "Reprovado"] },
      { name: "parecer_ouvidor", label: "Parecer técnico do Ouvidor Geral", type: "textarea", hideInTable: true },
      { name: "tags", label: "Tags", type: "tags", hideInTable: true },
    ],
  },
  {
    key: "licitacoes", table: "licitacoes", label: "Licitações", grupo: "Licitações e Contratos", orderBy: "data_abertura", publico: true,
    descricao: "Processos licitatórios, dispensas e inexigibilidades.",
    fields: [
      { name: "numero", label: "Número", required: true },
      { name: "modalidade", label: "Modalidade", type: "select", options: ["Pregão Eletrônico", "Pregão Presencial", "Concorrência", "Concurso", "Leilão", "Diálogo Competitivo", "Dispensa", "Inexigibilidade", "Credenciamento", "Pré-qualificação", "Manifestação de Interesse"] },
      { name: "tipo", label: "Tipo", type: "select", options: ["Licitação", "Dispensa", "Inexigibilidade"], hideInTable: true },
      { name: "objeto", label: "Objeto", type: "textarea", required: true },
      { name: "situacao", label: "Situação", type: "select", options: ["Em Elaboração", "Publicado", "Aberto", "Em Julgamento", "Homologado", "Concluída", "Suspensa", "Anulada", "Cancelada", "Deserta", "Fracassada", "Revogada", "Inativa"] },
      { name: "data_abertura", label: "Abertura", type: "date" },
      { name: "valor_estimado", label: "Valor estimado", type: "money" },
      { name: "secretaria", label: "Secretaria", hideInTable: true },
      { name: "fundamentacao", label: "Fundamentação legal", type: "textarea", hideInTable: true },
      { name: "arquivo_url", label: "Edital", type: "file" },
    ],
  },
  {
    key: "contratos", table: "contratos", label: "Contratos e aditivos", grupo: "Licitações e Contratos", orderBy: "data_inicio", publico: true,
    descricao: "Contratos firmados, aditivos e vigências.",
    fields: [
      { name: "numero", label: "Número", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: ["Contrato", "Aditivo", "Ata de Registro de Preços", "Adesão (Carona)"] },
      { name: "fornecedor", label: "Fornecedor (credor)", type: "relation", ref: { module: "credores", column: "nome" }, required: true },
      { name: "cnpj", label: "CNPJ/CPF" },
      { name: "objeto", label: "Objeto", type: "textarea", required: true },
      { name: "valor", label: "Valor (no aditivo, apenas a diferença)", type: "money" },
      { name: "data_inicio", label: "Início", type: "date" },
      { name: "data_fim", label: "Fim da vigência", type: "date" },
      { name: "contrato_origem", label: "Contrato/ata de origem (aditivos e adesões)", type: "relation", ref: { module: "contratos", column: "numero" }, hideInTable: true },
      { name: "valor_atualizado", label: "Valor atualizado (automático)", type: "money" },
      { name: "data_fim_atualizada", label: "Vigência atualizada (automática)", type: "date", hideInTable: true },
      { name: "convenio_id", label: "Convênio de origem", type: "relation", ref: { module: "convenios", column: "id", displayColumn: "numero" }, hideInTable: true },
      { name: "licitacao_numero", label: "Licitação de origem", type: "relation", ref: { module: "licitacoes", column: "numero" }, hideInTable: true },
      { name: "secretaria", label: "Secretaria", hideInTable: true },
      { name: "arquivo_url", label: "Documento", type: "file" },
      {"name":"acao_emergencial","label":"Ação emergencial vinculada","type":"select","options":["COVID-19","Outra emergência"]},
    ],
  },
  {
    key: "andamentos-licitacao", table: "licitacao_andamentos", label: "Andamentos das licitações", grupo: "Licitações e Contratos", orderBy: "data", publico: true,
    descricao: "Fases, cronograma e linha do tempo de cada processo licitatório.",
    fields: [
      { name: "licitacao_numero", label: "Licitação", type: "relation", ref: { module: "licitacoes", column: "numero" }, required: true },
      { name: "fase", label: "Fase", type: "select", options: ["Preparação", "Publicação", "Abertura", "Julgamento", "Homologação", "Conclusão"], required: true },
      { name: "data", label: "Data", type: "date" },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
      { name: "arquivo_url", label: "Anexo", type: "file", hideInTable: true },
    ],
  },
  {
    key: "comissoes", table: "comissoes", label: "Comissões de contratação", grupo: "Licitações e Contratos", orderBy: "nome", publico: true,
    descricao: "Comissões de contratação e equipes técnicas permanentes ou especiais.",
    fields: [
      { name: "nome", label: "Nome da comissão/equipe", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: ["Comissão Permanente", "Comissão Especial", "Equipe de Planejamento", "Equipe de Apoio", "Agente de Contratação"] },
      { name: "portaria", label: "Portaria de designação" },
      { name: "data_inicio", label: "Início do mandato", type: "date" },
      { name: "data_fim", label: "Fim do mandato", type: "date" },
    ],
  },
  {
    key: "membros-equipe", table: "membros_equipe", label: "Membros das equipes", grupo: "Licitações e Contratos", orderBy: "nome", publico: true,
    descricao: "Membros das comissões e das equipes de apoio e de contratação.",
    fields: [
      { name: "comissao", label: "Comissão/equipe", type: "relation", ref: { module: "comissoes", column: "nome" } },
      { name: "nome", label: "Nome", required: true },
      { name: "funcao", label: "Função", type: "select", options: ["Presidente", "Membro", "Suplente", "Apoio técnico", "Fiscal de contrato"] },
      { name: "tipo_equipe", label: "Tipo de equipe", type: "select", options: ["Contratação", "Apoio", "Técnica"], hideInTable: true },
    ],
  },
  {
    key: "parcerias", table: "parcerias", label: "Parcerias e acordos", grupo: "Licitações e Contratos", orderBy: "data_inicio", publico: true,
    descricao: "Parcerias e acordos celebrados pelo município.",
    fields: [
      { name: "nome", label: "Nome/identificação", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: ["Parceria", "Acordo", "Protocolo de intenções", "Termo de cooperação"] },
      { name: "entidade", label: "Entidade/órgão parceiro" },
      { name: "objeto", label: "Objeto", type: "textarea", hideInTable: true },
      { name: "valor", label: "Valor", type: "money", hideInTable: true },
      { name: "data_inicio", label: "Início", type: "date" },
      { name: "data_fim", label: "Fim", type: "date", hideInTable: true },
      { name: "arquivo_url", label: "Documento", type: "file", hideInTable: true },
    ],
  },
  {
    key: "termos-fomento", table: "termos_fomento", label: "Termos de fomento (OSC)", grupo: "Licitações e Contratos", orderBy: "data_inicio", publico: true,
    descricao: "Termos de fomento celebrados com Organizações da Sociedade Civil.",
    fields: [
      { name: "numero", label: "Número", required: true },
      { name: "osc", label: "Organização da Sociedade Civil", required: true },
      { name: "cnpj", label: "CNPJ" },
      { name: "objeto", label: "Objeto", type: "textarea", hideInTable: true },
      { name: "valor", label: "Valor", type: "money" },
      { name: "data_inicio", label: "Início", type: "date" },
      { name: "data_fim", label: "Fim", type: "date", hideInTable: true },
      { name: "arquivo_url", label: "Documento", type: "file", hideInTable: true },
    ],
  },
  {
    key: "empresas-inidoneas", table: "empresas_inidoneas", label: "Empresas inidôneas", grupo: "Licitações e Contratos", orderBy: "data_inicio", publico: true,
    descricao: "Empresas punidas ou impedidas de licitar.",
    fields: [
      { name: "razao_social", label: "Razão social", required: true },
      { name: "cnpj", label: "CNPJ" },
      { name: "sancao", label: "Sanção" },
      { name: "data_inicio", label: "Início", type: "date" },
      { name: "data_fim", label: "Fim", type: "date" },
      { name: "motivo", label: "Motivo", type: "textarea", hideInTable: true },
    ],
  },
  {
    key: "credores", table: "credores", label: "Credores", grupo: "Licitações e Contratos", orderBy: "nome", publico: true,
    descricao: "Fornecedores e credores do município, inclusive importados do TCE.",
    fields: [
      { name: "nome", label: "Nome / Razão social", required: true },
      { name: "cpf_cnpj", label: "CPF/CNPJ" },
      { name: "tipo", label: "Tipo", type: "select", options: ["Pessoa jurídica", "Pessoa física"] },
      { name: "municipio", label: "Município" },
      { name: "uf", label: "UF" },
      { name: "origem", label: "Origem", hideInTable: true },
      {"name":"chave_externa","label":"Identificador na origem"},
    ],
  },

  ...(["concedente", "convenente"] as const).map((papel): ModuleDef => ({
    key: papel === "concedente" ? "concedentes" : "convenentes",
    table: "convenio_entidades", permissionTable: "convenios", label: papel === "concedente" ? "Concedentes" : "Convenentes",
    descricao: "Entidades e responsáveis dos convênios públicos.",
    grupo: "Licitações e Contratos", publico: true, orderBy: "nome",
    filtro: { column: "papel", value: papel },
    fields: [
      { name: "nome", label: "Entidade", required: true },
      { name: "responsavel", label: "Responsável", required: true },
      { name: "cnpj", label: "CNPJ" },
    ],
  })),
  {
    key: "tipos-convenio", table: "convenio_tipos", permissionTable: "convenios", label: "Tipos e categorias de convênio",
    descricao: "Categorias configuráveis para classificação dos convênios.",
    grupo: "Licitações e Contratos", publico: true, orderBy: "nome",
    fields: [
      { name: "nome", label: "Categoria", required: true },
      { name: "descricao", label: "Descrição", type: "textarea" },
    ],
  },
  {
    key: "convenios", table: "convenios", label: "Convênios", grupo: "Licitações e Contratos", orderBy: "data_inicio", publico: true,
    descricao: "Convênios e transferências voluntárias.",
    fields: [
      { name: "numero", label: "Número", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: ["Recebido", "Concedido"] },
      { name: "concedente", label: "Concedente", type: "relation", ref: { module: "concedentes", column: "nome" }, required: true },
      { name: "responsavel_concedente", label: "Responsável pelo concedente", required: true },
      { name: "convenente", label: "Convenente", type: "relation", ref: { module: "convenentes", column: "nome" }, required: true },
      { name: "responsavel_convenente", label: "Responsável pelo convenente", required: true },
      { name: "objeto", label: "Objeto", type: "textarea", required: true },
      { name: "valor", label: "Valor de referência", type: "money" },
      { name: "valor_global", label: "Valor global do convênio", type: "money", required: true },
      { name: "contrapartida", label: "Contrapartida", type: "money", hideInTable: true },
      { name: "categoria", label: "Categoria de convênio", type: "relation", ref: { module: "tipos-convenio", column: "nome" } },
      { name: "especificacoes_tecnicas", label: "Especificações técnicas", type: "textarea", hideInTable: true },
      { name: "metas", label: "Metas", type: "textarea", hideInTable: true },
      { name: "plano_aplicacao", label: "Plano de aplicação", type: "textarea", hideInTable: true },
      { name: "contrato_numero", label: "Contrato vinculado", type: "relation", ref: { module: "contratos", column: "numero" } },
      { name: "periodicidade_prestacao", label: "Prestação de contas", hideInTable: true },
      { name: "data_inicio", label: "Início", type: "date" },
      { name: "data_fim", label: "Fim", type: "date" },
      { name: "situacao", label: "Situação", type: "select", options: ["Planejado", "Em execução", "Concluído", "Suspenso", "Rescindido"] },
      { name: "observacoes", label: "Observações", type: "textarea", hideInTable: true },
      { name: "arquivo_url", label: "Documento", type: "file", hideInTable: true },
    ],
  },
  {
    key: "convenio-parcelas", table: "convenio_parcelas", permissionTable: "convenios", label: "Parcelas de convênios", grupo: "Licitações e Contratos", orderBy: "numero", publico: true,
    descricao: "Cronograma de parcelas, valores e recebimentos de convênios.",
    fields: [
      { name: "convenio_id", label: "Convênio", type: "relation", ref: { module: "convenios", column: "id", displayColumn: "numero" }, required: true },
      { name: "numero", label: "Número da parcela", type: "int", required: true },
      { name: "valor", label: "Valor", type: "money", required: true },
      { name: "vencimento", label: "Vencimento", type: "date" },
      { name: "recebido_em", label: "Recebido em", type: "date" },
      { name: "status", label: "Situação", type: "select", options: ["Programada", "Recebida", "Cancelada"], required: true },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
    ],
  },
  {
    key: "convenio-obrigacoes", table: "convenio_obrigacoes", permissionTable: "convenios", label: "Obrigações de convênios", grupo: "Licitações e Contratos", orderBy: "vencimento", publico: true,
    descricao: "Obrigações, prazos e situação da prestação de contas dos convênios.",
    fields: [
      { name: "convenio_id", label: "Convênio", type: "relation", ref: { module: "convenios", column: "id", displayColumn: "numero" }, required: true },
      { name: "titulo", label: "Obrigação", required: true },
      { name: "vencimento", label: "Vencimento", type: "date" },
      { name: "cumprida_em", label: "Cumprida em", type: "date" },
      { name: "situacao", label: "Situação", type: "select", options: ["Pendente", "Cumprida", "Cancelada"], required: true },
      { name: "descricao", label: "Detalhamento", type: "textarea", hideInTable: true },
    ],
  },
  {
    key: "receitas", table: "receitas", label: "Receitas", grupo: "Transparência", orderBy: "mes", publico: true,
    descricao: "Receitas previstas e arrecadadas (LC 131/2009).",
    fields: [
      { name: "ano", label: "Ano", type: "int", required: true },
      { name: "mes", label: "Mês", type: "int", required: true },
      { name: "categoria", label: "Categoria", required: true },
      { name: "descricao", label: "Descrição" },
      { name: "previsto", label: "Previsto", type: "money" },
      { name: "arrecadado", label: "Arrecadado", type: "money" },
      { name: "natureza", label: "Natureza", type: "select", options: ["Orçamentária", "Extraorçamentária"] },
      { name: "data_receita", label: "Data de arrecadação", type: "date" },
      { name: "codigo_receita", label: "Código da receita", type: "text" },
      { name: "fonte_recurso", label: "Fonte de recurso", type: "text" },
      { name: "origem", label: "Sistema de origem", type: "text" },
      { name: "chave_externa", label: "Identificador na origem", type: "text" },
      {"name":"acao_emergencial","label":"Ação emergencial vinculada","type":"select","options":["COVID-19","Outra emergência"]},
    ],
  },
  {
    key: "despesas", table: "despesas", label: "Despesas", grupo: "Transparência", orderBy: "mes", publico: true,
    descricao: "Empenhos, liquidações e pagamentos (LC 131/2009).",
    fields: [
      { name: "ano", label: "Ano", type: "int", required: true },
      { name: "mes", label: "Mês", type: "int", required: true },
      { name: "orgao", label: "Órgão", required: true },
      { name: "funcao", label: "Função", hideInTable: true },
      { name: "elemento", label: "Elemento", hideInTable: true },
      { name: "credor", label: "Credor", type: "relation", ref: { module: "credores", column: "nome" } },
      { name: "empenho", label: "Empenho" },
      { name: "empenhado", label: "Empenhado", type: "money" },
      { name: "liquidado", label: "Liquidado", type: "money" },
      { name: "pago", label: "Pago", type: "money" },
      { name: "natureza", label: "Natureza", type: "select", options: ["Orçamentária", "Extraorçamentária"] },
      { name: "processo", label: "Processo", type: "text" },
      { name: "data_empenho", label: "Data do empenho", type: "date" },
      { name: "liquidacao", label: "Número da liquidação", type: "text" },
      { name: "data_liquidacao", label: "Data da liquidação", type: "date" },
      { name: "ordem_bancaria", label: "Ordem bancária", type: "text" },
      { name: "data_pagamento", label: "Data do pagamento", type: "date" },
      { name: "fonte_recurso", label: "Fonte de recurso", type: "text" },
      { name: "origem", label: "Sistema de origem", type: "text" },
      { name: "chave_externa", label: "Identificador na origem", type: "text" },
      {"name":"acao_emergencial","label":"Ação emergencial vinculada","type":"select","options":["COVID-19","Outra emergência"]},
    ],
  },
  {
    key: "servidores", table: "servidores", label: "Servidores e folha", grupo: "Transparência", orderBy: "nome", publico: true,
    descricao: "Quadro de pessoal e remuneração.",
    fields: [
      { name: "nome", label: "Nome", required: true },
      { name: "matricula", label: "Matrícula" },
      { name: "cargo", label: "Cargo" },
      { name: "vinculo", label: "Vínculo", type: "select", options: ["Efetivo", "Comissionado", "Contratado", "Estagiário", "Eletivo"] },
      { name: "lotacao", label: "Lotação" },
      { name: "admissao", label: "Admissão", type: "date", hideInTable: true },
      { name: "remuneracao", label: "Remuneração", type: "money" },
      { name: "competencia", label: "Competência" },
      { name: "subsidio", label: "Subsídio / vencimento base", type: "money" },
      { name: "vantagens", label: "Vantagens", type: "money" },
      { name: "descontos", label: "Descontos", type: "money" },
      { name: "origem", label: "Sistema de origem", type: "text" },
      { name: "chave_externa", label: "Identificador na origem", type: "text" },
      {"name":"acao_emergencial","label":"Ação emergencial vinculada","type":"select","options":["COVID-19","Outra emergência"]},
    ],
  },
  {
    key: "medicamentos", table: "medicamentos", label: "Medicamentos", grupo: "Transparência", orderBy: "descricao", publico: true,
    descricao: "Itens de medicamentos e classificações de compra e estoque.",
    fields: [
      { name: "descricao", label: "Descrição", type: "text", required: true },
      { name: "unidade_compra", label: "Unidade de compra", type: "text", required: true },
      { name: "unidade_estoque", label: "Unidade de estoque", type: "text", required: true },
      { name: "grupo", label: "Grupo", type: "text", required: true },
      { name: "subgrupo", label: "Subgrupo", type: "text", required: true },
      { name: "categoria", label: "Categoria", type: "text", required: true },
      { name: "subcategoria", label: "Subcategoria", type: "text", required: true },
    ],
  },
  pub("diaria", "Diárias", "Diárias de viagem de agentes públicos.", [
    { name: "beneficiario", label: "Beneficiário" },
    { name: "destino", label: "Destino" },
    { name: "justificativa", label: "Justificativa", type: "textarea" },
    { name: "valor", label: "Valor", type: "money" },
  ]),
  pub("resolucao", "Resoluções", "Resoluções de conselhos e órgãos municipais."),
  pub("edital", "Editais públicos", "Editais municipais, seleções e convocações."),
  pub("lrf", "Lei de Responsabilidade Fiscal", "Legislação e documentos consolidados da responsabilidade fiscal."),
  pub("lei", "Leis", "Leis municipais, incluindo PPA, LDO e LOA."),
  pub("decreto", "Decretos", "Decretos executivos."),
  pub("portaria", "Portarias", "Portarias e atos de pessoal."),
  pub("rreo", "RREO", "Relatório Resumido da Execução Orçamentária."),
  pub("rgf", "RGF", "Relatório de Gestão Fiscal."),
  pub("concurso", "Concursos e seletivos", "Concursos públicos e processos seletivos.", [
    { name: "situacao", label: "Situação", type: "select", options: ["Inscrições abertas", "Em andamento", "Homologado", "Encerrado"] },
    { name: "etapas", label: "Etapas (uma por linha: data — etapa)", type: "textarea", hideInTable: true },
  ]),
  pub("covid", "COVID-19", "Boletins epidemiológicos e ações emergenciais.", [{"name":"casos_confirmados","label":"Casos confirmados","type":"int"},{"name":"casos_ativos","label":"Casos ativos","type":"int"},{"name":"obitos","label":"Óbitos","type":"int"},{"name":"recuperados","label":"Recuperados","type":"int"}]),
  pub("conselho-doc", "Documentos dos conselhos", "Atas, resoluções e documentos dos conselhos.", [{name:"conselho_id",label:"Conselho",type:"relation",ref:{module:"conselhos",column:"id",displayColumn:"nome"},required:true}]),
  {
    key: "obras", table: "obras", label: "Obras públicas", grupo: "Gestão", orderBy: "data_inicio", publico: true,
    descricao: "Acompanhamento de obras, fotos e responsáveis técnicos.",
    fields: [
      { name: "nome", label: "Obra", required: true },
      {name:"processo_engenharia_id",label:"Processo de engenharia",type:"relation",ref:{module:"processos-engenharia",column:"id",displayColumn:"numero"}},
      { name: "local", label: "Local" },
      { name: "empresa", label: "Empresa" },
      { name: "valor", label: "Valor", type: "money" },
      { name: "percentual", label: "% executado", type: "int" },
      { name: "situacao", label: "Situação", type: "select", options: ["Licitação", "Em andamento", "Paralisada", "Concluída"] },
      { name: "data_inicio", label: "Início", type: "date", hideInTable: true },
      { name: "previsao_fim", label: "Previsão de término", type: "date", hideInTable: true },
      { name: "art", label: "ART", hideInTable: true },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
      {"name":"data_fim","label":"Término efetivo","type":"date"},
      {"name":"aditivo_acrescimo","label":"Aditivos de acréscimo","type":"money"},
      {"name":"aditivo_supressao","label":"Aditivos de supressão","type":"money"},
      {"name":"origem_recurso","label":"Origem do recurso","type":"text"},
      {"name":"numero_processo","label":"Número do processo","type":"text"},
      {"name":"tipo_guarda_chuva","label":"Tipo guarda-chuva","type":"text"},
      {"name":"secretaria","label":"Secretaria executora","type":"relation","ref":{"module":"secretarias","column":"nome"}},
      {"name":"objeto_contrato","label":"Objeto do contrato","type":"textarea"},
      {"name":"justificativa","label":"Justificativa","type":"textarea"},
      {"name":"credor_id","label":"Credor responsável","type":"relation","required":false,"ref":{"module":"credores","column":"id","displayColumn":"nome"}},
      {"name":"contrato_id","label":"Contrato de origem","type":"relation","required":false,"ref":{"module":"contratos","column":"id","displayColumn":"numero"}},
    ],
  },
  {
    key: "veiculos", table: "veiculos", label: "Frota municipal", grupo: "Gestão", orderBy: "placa", publico: true,
    descricao: "Veículos e máquinas do município.",
    fields: [
      { name: "placa", label: "Placa", required: true },
      { name: "modelo", label: "Modelo", required: true },
      { name: "ano", label: "Ano", type: "int" },
      { name: "tipo", label: "Tipo" },
      { name: "secretaria", label: "Secretaria" },
      { name: "combustivel", label: "Combustível", hideInTable: true },
      { name: "situacao", label: "Situação", type: "select", options: ["Ativo", "Em manutenção", "Baixado"] },
      {"name":"renavam","label":"Renavam","type":"text"},
      {"name":"entrada_frota","label":"Entrada na frota","type":"date"},
      {"name":"baixa_frota","label":"Saída / baixa","type":"date"},
      {"name":"maquina_obra","label":"Máquina de obra","type":"bool"},
      {"name":"finalidade","label":"Finalidade de uso","type":"textarea"},
      {"name":"foto_url","label":"Foto do veículo","type":"file"},
      {"name":"seguro_vencimento","label":"Vencimento do seguro","type":"date"},
      {"name":"ipva_vencimento","label":"Vencimento do IPVA","type":"date"},
      {"name":"manutencao_prevista","label":"Próxima manutenção","type":"date"},
    ],
  },
  {
    key: "conselhos", table: "conselhos", label: "Conselhos municipais", grupo: "Gestão", orderBy: "nome", publico: true,
    descricao: "Conselhos, composição e contatos.",
    fields: [
      { name: "nome", label: "Conselho", required: true },
      { name: "sigla", label: "Sigla" },
      { name: "lei_criacao", label: "Lei de criação" },
      { name: "presidente", label: "Presidente" },
      { name: "contato", label: "Contato" },
      { name: "descricao", label: "Descrição", type: "textarea", hideInTable: true },
      { name: "membros", label: "Membros", type: "textarea", hideInTable: true },
      {"name":"data_criacao","label":"Data de criação","type":"date"},
      {"name":"vigencia_inicio","label":"Início de vigência","type":"date"},
      {"name":"vigencia_fim","label":"Fim de vigência","type":"date"},
      {"name":"competencias","label":"Competências","type":"textarea"},
      {"name":"cor","label":"Cor da página (hexadecimal)","type":"text"},
      {"name":"imagem_url","label":"Imagem do conselho","type":"file"},
    ],
  },
  {"key":"obra-andamentos","table":"obra_andamentos","label":"Andamentos de obras","descricao":"Andamentos de obras vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"obra_id","label":"Obra","type":"relation","required":true,"ref":{"module":"obras","column":"id","displayColumn":"nome"}},{"name":"data","label":"Data","type":"date","required":true},{"name":"descricao","label":"Andamento","type":"textarea","required":true},{"name":"percentual","label":"Execução física (%)","type":"number"},{"name":"valor_executado","label":"Execução financeira","type":"money"}]},
  {"key":"obra-medicoes","table":"obra_medicoes","label":"Medições de obras","descricao":"Medições de obras vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"obra_id","label":"Obra","type":"relation","required":true,"ref":{"module":"obras","column":"id","displayColumn":"nome"}},{"name":"numero","label":"Número","type":"text","required":true},{"name":"data","label":"Data","type":"date","required":true},{"name":"descricao","label":"Descrição","type":"textarea","required":true},{"name":"valor","label":"Valor medido","type":"money","required":true},{"name":"aprovada","label":"Aprovada","type":"bool"},{"name":"responsavel","label":"Responsável técnico","type":"text"},{"name":"arquivo_url","label":"Documento da medição","type":"file"}]},
  {"key":"obra-arts","table":"obra_arts","label":"ARTs de obras","descricao":"ARTs de obras vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"obra_id","label":"Obra","type":"relation","required":true,"ref":{"module":"obras","column":"id","displayColumn":"nome"}},{"name":"numero","label":"Número da ART","type":"text","required":true},{"name":"responsavel","label":"Engenheiro responsável","type":"text","required":true},{"name":"registro_profissional","label":"Registro profissional","type":"text"},{"name":"data","label":"Data","type":"date"},{"name":"arquivo_url","label":"ART digital","type":"file"}]},
  {"key":"obra-fotos","table":"obra_fotos","label":"Fotos datadas de obras","descricao":"Fotos datadas de obras vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"obra_id","label":"Obra","type":"relation","required":true,"ref":{"module":"obras","column":"id","displayColumn":"nome"}},{"name":"data","label":"Data da foto","type":"date","required":true},{"name":"legenda","label":"Legenda","type":"text","required":true},{"name":"foto_url","label":"Foto","type":"file","required":true}]},
  {"key":"plano-diretor","table":"planos_diretores","label":"Plano Diretor","descricao":"Plano Diretor vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"nome","label":"Plano","type":"text","required":true},{"name":"lei","label":"Lei de aprovação","type":"text"},{"name":"descricao","label":"Descrição","type":"textarea"},{"name":"arquivo_url","label":"Plano completo","type":"file"}]},
  {"key":"plano-diretor-fases","table":"plano_diretor_fases","label":"Fases do Plano Diretor","descricao":"Fases do Plano Diretor vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"plano_id","label":"Plano Diretor","type":"relation","required":true,"ref":{"module":"plano-diretor","column":"id","displayColumn":"nome"}},{"name":"nome","label":"Fase","type":"text","required":true},{"name":"inicio","label":"Início","type":"date"},{"name":"fim","label":"Fim","type":"date"},{"name":"situacao","label":"Situação","type":"text"}]},
  {"key":"plano-diretor-equipe","table":"plano_diretor_equipe","label":"Equipe do Plano Diretor","descricao":"Equipe do Plano Diretor vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"plano_id","label":"Plano Diretor","type":"relation","required":true,"ref":{"module":"plano-diretor","column":"id","displayColumn":"nome"}},{"name":"nome","label":"Integrante","type":"text","required":true},{"name":"funcao","label":"Função","type":"text"},{"name":"representacao","label":"Representação","type":"text"}]},
  {"key":"plano-diretor-eixos","table":"plano_diretor_eixos","label":"Eixos do Plano Diretor","descricao":"Eixos do Plano Diretor vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"plano_id","label":"Plano Diretor","type":"relation","required":true,"ref":{"module":"plano-diretor","column":"id","displayColumn":"nome"}},{"name":"nome","label":"Eixo","type":"text","required":true},{"name":"descricao","label":"Descrição","type":"textarea"}]},
  {"key":"plano-diretor-acoes","table":"plano_diretor_acoes","label":"Ações estratégicas do Plano Diretor","descricao":"Ações estratégicas do Plano Diretor vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"obras","publico":true,"fields":[{"name":"plano_id","label":"Plano Diretor","type":"relation","required":true,"ref":{"module":"plano-diretor","column":"id","displayColumn":"nome"}},{"name":"eixo_id","label":"Eixo","type":"relation","required":true,"ref":{"module":"plano-diretor-eixos","column":"id","displayColumn":"nome"}},{"name":"nome","label":"Ação estratégica","type":"text","required":true},{"name":"descricao","label":"Detalhamento","type":"textarea"},{"name":"prazo","label":"Prazo","type":"date"},{"name":"responsavel","label":"Responsável","type":"text"}]},
  {"key":"conselho-membros","table":"conselho_membros","label":"Membros dos conselhos","descricao":"Membros dos conselhos vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"conselhos","publico":true,"fields":[{"name":"conselho_id","label":"Conselho","type":"relation","required":true,"ref":{"module":"conselhos","column":"id","displayColumn":"nome"}},{"name":"nome","label":"Nome","type":"text","required":true},{"name":"tipo","label":"Tipo","type":"select","options":["Titular","Suplente"],"required":true},{"name":"representacao","label":"Representação","type":"select","options":["Sociedade civil","Governo"],"required":true},{"name":"entidade","label":"Entidade","type":"text"},{"name":"inicio","label":"Início","type":"date"},{"name":"fim","label":"Fim","type":"date"},{"name":"ativo","label":"Ativo","type":"bool"}]},
  {"key":"conselho-acoes","table":"conselho_acoes","label":"Histórico dos conselhos","descricao":"Histórico dos conselhos vinculados ao cadastro principal.","grupo":"Gestão","permissionTable":"conselhos","publico":true,"fields":[{"name":"conselho_id","label":"Conselho","type":"relation","required":true,"ref":{"module":"conselhos","column":"id","displayColumn":"nome"}},{"name":"tipo","label":"Tipo","type":"select","options":["Reunião","Ata","Palestra","Pauta","Outra ação"],"required":true},{"name":"titulo","label":"Título","type":"text","required":true},{"name":"data","label":"Data","type":"date","required":true},{"name":"descricao","label":"Detalhamento","type":"textarea"},{"name":"arquivo_url","label":"Documento","type":"file"}]},
];

export const modulePermissionTable = (mod: ModuleDef) => mod.permissionTable ?? mod.table;

// Preserve the evaluation-sheet URLs while sharing the canonical schema and policies.
export const MODULE_ALIASES: Record<string, string> = {
  leis: 'lei', decretos: 'decreto', portarias: 'portaria', resolucoes: 'resolucao', diarias: 'diaria',
  'categorias-convenio': 'tipos-convenio', 'metas-convenio': 'convenios',
  'planos-aplicacao': 'convenios', 'boletim-epidemiologico': 'covid',
};
export const getModule = (key: string) => MODULES.find((m) => m.key === (MODULE_ALIASES[key] ?? key));

export const brl = (v: unknown) =>
  v == null || v === "" ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dataBR = (v: unknown) => {
  if (!v) return "—";
  const s = String(v);
  const d = new Date(s.length === 10 ? s + "T12:00:00" : s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("pt-BR");
};

export function formatCell(f: Field, v: unknown): string {
  if (f.type === "money") return brl(v);
  if (f.type === "date") return dataBR(v);
  if (f.type === "bool") return v ? "Sim" : "Não";
  if (f.type === "files") return Array.isArray(v) ? `${v.length} arquivo(s)` : "";
  if (f.type === "tags") return Array.isArray(v) ? v.join(", ") : "";
  if (v == null || v === "") return "—";
  return String(v);
}

/** Gera CSV com separador ";" (padrão Excel pt-BR). */
export function toCSV(fields: Field[], rows: Record<string, unknown>[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const head = fields.map((f) => esc(f.label)).join(";");
  const body = rows.map((r) => fields.map((f) => esc(formatCell(f, r[f.name]))).join(";"));
  return [head, ...body].join("\n");
}
