/** Versão e histórico do sistema, exibidos na página "Sobre" e no aviso de atualização do painel. */
export const VERSAO = "1.1.0";

export const HISTORICO: { versao: string; data: string; itens: string[] }[] = [
  {
    versao: "1.1.0",
    data: "2026-10-22",
    itens: [
      "Permissões de edição por módulo para editores.",
      "Registro de entradas e saídas do sistema na auditoria.",
      "Filtros por período, ação e usuário na auditoria, com exportação CSV.",
      "Pedidos de melhoria enviados pela equipe e respondidos pelo administrador.",
      "Página Sobre o sistema e aviso de atualização automática.",
    ],
  },
  {
    versao: "1.0.0",
    data: "2026-10-15",
    itens: [
      "Portal institucional, Transparência, e-SIC e Ouvidoria.",
      "Entrada com e-mail, Google e recuperação de senha.",
      "Painel administrativo com cadastros por módulo, usuários, perfis e auditoria.",
    ],
  },
];

/** Converte linhas em CSV com separador ";" (padrão de planilhas em português). */
export function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "\uFEFF" + [headers, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

export function baixar(nome: string, conteudo: string, tipo = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url; a.download = nome; a.click();
  URL.revokeObjectURL(url);
}
