// Relatórios do M03: boletim do dia, mapa de licitações e contratos a vencer (itens 3.14, 3.16 e 3.17).
export interface LicitacaoLike {
  numero: string;
  modalidade?: string | null;
  situacao?: string | null;
  data_abertura?: string | null;
  valor_estimado?: number | null;
  secretaria?: string | null;
  objeto?: string | null;
}

export interface ContratoLike {
  numero: string;
  fornecedor?: string | null;
  tipo?: string | null;
  valor?: number | null;
  valor_atualizado?: number | null;
  data_fim?: string | null;
  data_fim_atualizada?: string | null;
  objeto?: string | null;
}

const dia = (v?: string | null) => (v ?? "").slice(0, 10);

export function addDias(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface FiltrosMapa {
  modalidade?: string;
  situacao?: string;
  secretaria?: string;
  de?: string;
  ate?: string;
}

/** Mapa de licitações com filtros avançados (item 3.16). */
export function mapaLicitacoes(rows: LicitacaoLike[], f: FiltrosMapa): LicitacaoLike[] {
  return rows
    .filter(
      (r) =>
        (!f.modalidade || r.modalidade === f.modalidade) &&
        (!f.situacao || r.situacao === f.situacao) &&
        (!f.secretaria || (r.secretaria ?? "") === f.secretaria) &&
        (!f.de || dia(r.data_abertura) >= f.de) &&
        (!f.ate || dia(r.data_abertura) <= f.ate),
    )
    .sort((a, b) => dia(b.data_abertura).localeCompare(dia(a.data_abertura)));
}

export interface Boletim {
  doDia: LicitacaoLike[];
  proximas: LicitacaoLike[];
  porModalidade: [string, number][];
  totalEstimado: number;
}

/** Boletim do dia: aberturas na data e avisos dos próximos 7 dias (item 3.14). */
export function boletimDoDia(rows: LicitacaoLike[], data: string): Boletim {
  const doDia = rows.filter((r) => dia(r.data_abertura) === data);
  const proximas = rows
    .filter((r) => dia(r.data_abertura) > data && dia(r.data_abertura) <= addDias(data, 7))
    .sort((a, b) => dia(a.data_abertura).localeCompare(dia(b.data_abertura)));
  const contagem = new Map<string, number>();
  for (const r of doDia) {
    const m = r.modalidade || "Não informada";
    contagem.set(m, (contagem.get(m) ?? 0) + 1);
  }
  const totalEstimado = doDia.reduce((s, r) => s + (Number(r.valor_estimado) || 0), 0);
  return { doDia, proximas, porModalidade: [...contagem.entries()].sort((a, b) => b[1] - a[1]), totalEstimado };
}

export type ContratoAVencer = ContratoLike & { fim: string; diasRestantes: number };

/** Contratos a vencer: usa a vigência atualizada pelos aditivos, ignora aditivos e adesões (item 3.17). */
export function contratosAVencer(rows: ContratoLike[], hoje: string, dias: number): ContratoAVencer[] {
  const limite = addDias(hoje, dias);
  return rows
    .filter((r) => !r.tipo || r.tipo === "Contrato" || r.tipo === "Ata de Registro de Preços")
    .map((r) => ({ ...r, fim: dia(r.data_fim_atualizada) || dia(r.data_fim) }))
    .filter((r) => r.fim && r.fim >= hoje && r.fim <= limite)
    .map((r) => ({ ...r, diasRestantes: Math.round((Date.parse(r.fim) - Date.parse(hoje)) / 86400000) }))
    .sort((a, b) => a.fim.localeCompare(b.fim));
}
