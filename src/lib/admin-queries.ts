import { collectPages } from "./pagination";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db, fetchModule } from "./data";
import { getModule, MODULES } from "./modules";
import type { AtriconStatus } from "./atricon";

export const adminModuleQuery = (key: string) =>
  queryOptions({
    queryKey: ["admin-module", key],
    queryFn: () => {
      const mod = getModule(key);
      if (!mod) throw new Error("Cadastro inexistente");
      return fetchModule(mod);
    },
  });

export const countsQuery = queryOptions({
  queryKey: ["admin-counts"],
  queryFn: async () => {
    const entries = await Promise.all(
      MODULES.map(async (m) => {
        let q = db.from(m.table).select("id", { count: "exact", head: true });
        if (m.filtro) q = q.eq(m.filtro.column, m.filtro.value);
        const { count } = await q;
        return [m.key, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<string, number>;
  },
});

export const noticiasStatsQuery = queryOptions({
  queryKey: ["admin-noticias-stats"],
  refetchInterval: 15_000,
  queryFn: async () => {
    const data = await collectPages((from, to) => supabase.from("noticias").select("id,titulo,slug,visualizacoes,publicado_em").order("visualizacoes", { ascending: false }).order("id").range(from, to));
    return { top: data.slice(0, 10), total: data.reduce((s, n) => s + n.visualizacoes, 0) };
  },
});

export const atendimentosQuery = queryOptions({
  queryKey: ["admin-atendimentos"],
  queryFn: async () => {
    const { data, error } = await supabase.from("atendimentos").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data;
  },
});

export const usuariosQuery = queryOptions({
  queryKey: ["admin-usuarios"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_listar_usuarios");
    if (error) throw error;
    return data;
  },
});

export const auditoriaQuery = queryOptions({
  queryKey: ["admin-auditoria"],
  queryFn: async () => {
    const { data, error } = await supabase.from("auditoria").select("*").order("id", { ascending: false }).limit(300);
    if (error) throw error;
    return data;
  },
});

export const atriconQuery = queryOptions({
  queryKey: ["admin-atricon"],
  queryFn: async () => {
    const { data, error } = await supabase.from("atricon_avaliacoes").select("*");
    if (error) throw error;
    return Object.fromEntries(data.map((r) => [r.criterio, { status: r.status as AtriconStatus, observacao: r.observacao, link: r.link }]));
  },
});

/** Varredura de pendências fiscais do exercício corrente. */
export const pendenciasQuery = queryOptions({
  queryKey: ["admin-pendencias"],
  queryFn: async () => {
    const ano = new Date().getFullYear();
    const mes = new Date().getMonth() + 1;
    const out: string[] = [];
    const pubCount = async (cat: string) => {
      const { count } = await supabase.from("publicacoes").select("id", { count: "exact", head: true }).eq("categoria", cat).eq("ano", ano);
      return count ?? 0;
    };
    const bimestres = Math.floor((mes - 1) / 2);
    const quadrimestres = Math.floor((mes - 1) / 4);
    const rreo = await pubCount("rreo");
    if (rreo < bimestres) out.push(`RREO: ${rreo} de ${bimestres} bimestre(s) publicados em ${ano}.`);
    const rgf = await pubCount("rgf");
    if (rgf < quadrimestres) out.push(`RGF: ${rgf} de ${quadrimestres} quadrimestre(s) publicados em ${ano}.`);
    for (const [tabela, nome] of [["receitas", "Receitas"], ["despesas", "Despesas"]] as const) {
      const { data } = await supabase.from(tabela).select("ano,mes").order("ano", { ascending: false }).order("mes", { ascending: false }).limit(1);
      const ult = data?.[0];
      if (!ult) out.push(`${nome}: nenhum lançamento publicado.`);
      else if (ult.ano * 12 + ult.mes < ano * 12 + mes - 1) out.push(`${nome}: último mês publicado é ${String(ult.mes).padStart(2, "0")}/${ult.ano} (desatualizado).`);
    }
    const { count: semResposta } = await supabase.from("atendimentos").select("id", { count: "exact", head: true }).neq("status", "Respondido").lt("created_at", new Date(Date.now() - 20 * 86400000).toISOString());
    if (semResposta) out.push(`e-SIC/Ouvidoria: ${semResposta} pedido(s) sem resposta há mais de 20 dias (prazo da LAI).`);
    const leis = await supabase.from("publicacoes").select("titulo").eq("categoria", "lei").eq("ano", ano);
    const titulos = (leis.data ?? []).map((l) => l.titulo.toLowerCase()).join(" ");
    if (!titulos.includes("loa") && !titulos.includes("orçamentária anual")) out.push(`LOA de ${ano} não localizada entre as leis publicadas.`);
    if (!titulos.includes("ldo") && !titulos.includes("diretrizes")) out.push(`LDO de ${ano} não localizada entre as leis publicadas.`);
    return out;
  },
});
