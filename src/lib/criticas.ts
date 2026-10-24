// Motor único de críticas e pendências (itens 2.14, 3.18, 4.13, 5.17, 10.12, 11.3, 12.4, 15.14).
export type Gravidade = "alta" | "media" | "baixa";
export interface Pendencia { modulo: string; registro: string; id: string; problema: string; gravidade: Gravidade }
type R = Record<string, unknown> & { id: string };
type Regra = { modulo: string; nome: (r: R) => string; testes: { problema: string; gravidade: Gravidade; falha: (r: R, hoje: string) => boolean }[] };

const vazio = (v: unknown) => v == null || String(v).trim() === "" || (Array.isArray(v) && v.length === 0);
const vencido = (v: unknown, hoje: string) => !vazio(v) && String(v).slice(0, 10) < hoje;
const diasAte = (v: unknown, hoje: string) => (Date.parse(String(v)) - Date.parse(hoje)) / 86400000;

export const REGRAS: Regra[] = [
  { modulo: "noticias", nome: (r) => String(r.titulo ?? ""), testes: [
    { problema: "Notícia sem imagem de capa", gravidade: "baixa", falha: (r) => vazio(r.capa_url) },
    { problema: "Notícia sem resumo", gravidade: "baixa", falha: (r) => vazio(r.resumo) },
  ] },
  { modulo: "banners", nome: (r) => String(r.titulo ?? ""), testes: [
    { problema: "Banner vencido ainda ativo", gravidade: "baixa", falha: (r, h) => r.ativo === true && vencido(r.fim, h) },
    { problema: "Banner sem imagem", gravidade: "media", falha: (r) => vazio(r.imagem_url) },
  ] },
  { modulo: "documentos", nome: (r) => String(r.titulo ?? ""), testes: [
    { problema: "Documento sem arquivo", gravidade: "alta", falha: (r) => vazio(r.arquivo_url) },
  ] },
  { modulo: "agentes-politicos", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Agente político sem foto", gravidade: "media", falha: (r) => vazio(r.foto_url) },
  ] },
  { modulo: "secretarias", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Secretaria sem horário de atendimento", gravidade: "media", falha: (r) => vazio(r.horario) },
    { problema: "Secretaria sem responsável", gravidade: "media", falha: (r) => vazio(r.secretario) },
  ] },
  { modulo: "servicos", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Serviço sem setor responsável", gravidade: "alta", falha: (r) => vazio(r.secretaria) },
    { problema: "Serviço sem prazo de atendimento", gravidade: "media", falha: (r) => vazio(r.prazo) },
    { problema: "Serviço sem etapas", gravidade: "media", falha: (r) => vazio(r.etapas) },
    { problema: "Serviço sem link de acesso", gravidade: "baixa", falha: (r) => vazio(r.link) },
    { problema: "Serviço sem parecer do Ouvidor", gravidade: "media", falha: (r) => vazio(r.parecer_status) },
  ] },
  { modulo: "licitacoes", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Licitação sem edital anexado", gravidade: "alta", falha: (r) => vazio(r.arquivo_url) },
    { problema: "Dispensa/inexigibilidade sem fundamentação legal", gravidade: "alta", falha: (r) => ["Dispensa", "Inexigibilidade"].includes(String(r.modalidade ?? r.tipo)) && vazio(r.fundamentacao) },
    { problema: "Licitação sem data de abertura", gravidade: "media", falha: (r) => vazio(r.data_abertura) },
    { problema: "Licitação sem valor estimado", gravidade: "baixa", falha: (r) => vazio(r.valor_estimado) },
  ] },
  { modulo: "contratos", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Contrato vencido", gravidade: "media", falha: (r, h) => vencido(r.data_fim_atualizada ?? r.data_fim, h) && r.tipo !== "Aditivo" },
    { problema: "Contrato vence em até 30 dias", gravidade: "baixa", falha: (r, h) => { const f = r.data_fim_atualizada ?? r.data_fim; return r.tipo !== "Aditivo" && !vazio(f) && diasAte(f, h) >= 0 && diasAte(f, h) <= 30; } },
    { problema: "Contrato sem documento anexado", gravidade: "alta", falha: (r) => vazio(r.arquivo_url) },
    { problema: "Aditivo sem contrato de origem", gravidade: "alta", falha: (r) => r.tipo === "Aditivo" && vazio(r.contrato_origem) },
    { problema: "Adesão (carona) sem ata de origem", gravidade: "alta", falha: (r) => r.tipo === "Adesão (Carona)" && vazio(r.contrato_origem) },
    { problema: "Contrato sem valor", gravidade: "media", falha: (r) => (!r.tipo || r.tipo === "Contrato") && vazio(r.valor) },
  ] },
  { modulo: "empresas-inidoneas", nome: (r) => String(r.razao_social ?? ""), testes: [
    { problema: "Empresa com sanção vigente (impedida de licitar)", gravidade: "alta", falha: (r, h) => vazio(r.data_fim) || String(r.data_fim).slice(0, 10) >= h },
  ] },
  { modulo: "comissoes", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Comissão com mandato vencido", gravidade: "media", falha: (r, h) => vencido(r.data_fim, h) },
    { problema: "Comissão sem portaria de designação", gravidade: "media", falha: (r) => vazio(r.portaria) },
  ] },
  { modulo: "termos-fomento", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Termo de fomento vencido", gravidade: "media", falha: (r, h) => vencido(r.data_fim, h) },
    { problema: "Termo de fomento sem documento", gravidade: "media", falha: (r) => vazio(r.arquivo_url) },
  ] },
  { modulo: "parcerias", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Parceria sem documento anexado", gravidade: "media", falha: (r) => vazio(r.arquivo_url) },
  ] },
  { modulo: "convenios", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Convênio vencido", gravidade: "media", falha: (r, h) => vencido(r.data_fim, h) },
    { problema: "Convênio sem documento anexado", gravidade: "media", falha: (r) => vazio(r.arquivo_url) },
    { problema: "Convênio sem responsável concedente", gravidade: "media", falha: (r) => vazio(r.responsavel_concedente) },
    { problema: "Convênio sem responsável convenente", gravidade: "media", falha: (r) => vazio(r.responsavel_convenente) },
    { problema: "Convênio sem metas ou plano de aplicação", gravidade: "alta", falha: (r) => vazio(r.metas) || vazio(r.plano_aplicacao) },
    { problema: "Convênio sem valor global", gravidade: "alta", falha: (r) => vazio(r.valor_global) },
  ] },
  { modulo: "convenio-obrigacoes", nome: (r) => String(r.titulo ?? ""), testes: [
    { problema: "Obrigação de convênio vencida", gravidade: "alta", falha: (r, h) => r.situacao === "Pendente" && vencido(r.vencimento, h) },
  ] },
  { modulo: "convenio-parcelas", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Parcela de convênio vencida", gravidade: "alta", falha: (r, h) => r.status === "Programada" && vencido(r.vencimento, h) },
  ] },
  { modulo: "obras", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Obra paralisada", gravidade: "alta", falha: (r) => r.situacao === "Paralisada" },
    { problema: "Obra sem ART", gravidade: "alta", falha: (r) => vazio(r.art) },
    { problema: "Obra com prazo vencido e não concluída", gravidade: "alta", falha: (r, h) => vencido(r.previsao_fim, h) && r.situacao !== "Concluída" },
  ] },
  { modulo: "veiculos", nome: (r) => String(r.placa ?? ""), testes: [
    { problema: "Veículo sem secretaria", gravidade: "media", falha: (r) => vazio(r.secretaria) },
  ] },
  { modulo: "conselhos", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Conselho sem lei de criação", gravidade: "media", falha: (r) => vazio(r.lei_criacao) },
  ] },
];

export function avaliarPendencias(dados: Record<string, R[]>, hoje = new Date().toISOString().slice(0, 10)): Pendencia[] {
  const out: Pendencia[] = [];
  for (const regra of REGRAS) for (const r of dados[regra.modulo] ?? []) for (const t of regra.testes)
    if (t.falha(r, hoje)) out.push({ modulo: regra.modulo, registro: regra.nome(r) || "(sem nome)", id: r.id, problema: t.problema, gravidade: t.gravidade });
  const peso = { alta: 0, media: 1, baixa: 2 };
  return out.sort((a, b) => peso[a.gravidade] - peso[b.gravidade]);
}
