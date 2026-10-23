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
  { modulo: "agentes-politicos", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Agente político sem foto", gravidade: "media", falha: (r) => vazio(r.foto_url) },
  ] },
  { modulo: "secretarias", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Secretaria sem horário de atendimento", gravidade: "media", falha: (r) => vazio(r.horario) },
    { problema: "Secretaria sem responsável", gravidade: "media", falha: (r) => vazio(r.responsavel) },
  ] },
  { modulo: "servicos", nome: (r) => String(r.nome ?? ""), testes: [
    { problema: "Serviço sem setor responsável", gravidade: "alta", falha: (r) => vazio(r.secretaria) },
    { problema: "Serviço sem prazo de atendimento", gravidade: "media", falha: (r) => vazio(r.prazo) },
  ] },
  { modulo: "licitacoes", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Licitação sem edital anexado", gravidade: "alta", falha: (r) => vazio(r.arquivo_url) },
    { problema: "Dispensa/inexigibilidade sem fundamentação legal", gravidade: "alta", falha: (r) => ["Dispensa", "Inexigibilidade"].includes(String(r.modalidade ?? r.tipo)) && vazio(r.fundamentacao) },
  ] },
  { modulo: "contratos", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Contrato vencido", gravidade: "media", falha: (r, h) => vencido(r.data_fim, h) },
    { problema: "Contrato vence em até 30 dias", gravidade: "baixa", falha: (r, h) => !vazio(r.data_fim) && diasAte(r.data_fim, h) >= 0 && diasAte(r.data_fim, h) <= 30 },
    { problema: "Contrato sem documento anexado", gravidade: "alta", falha: (r) => vazio(r.arquivo_url) },
  ] },
  { modulo: "convenios", nome: (r) => String(r.numero ?? ""), testes: [
    { problema: "Convênio vencido", gravidade: "media", falha: (r, h) => vencido(r.data_fim, h) },
    { problema: "Convênio sem documento anexado", gravidade: "media", falha: (r) => vazio(r.arquivo_url) },
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
