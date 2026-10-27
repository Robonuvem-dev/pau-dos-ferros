/** Identidade institucional compartilhada pelo portal, painel e aplicativo. */
export const MUNICIPIO = "Aurora das Veredas";
export const PREFEITURA = "Prefeitura de Aurora das Veredas";
export const BRASAO_URL =
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Bras%C3%A3o_do_munic%C3%ADpio_de_Aurora_%28SC%29.svg/1280px-Bras%C3%A3o_do_munic%C3%ADpio_de_Aurora_%28SC%29.svg.png";

/** Atualiza a apresentação de conteúdo institucional mantido no banco existente. */
export function municipalText(value: string): string {
  return value
    .replace(/Pau dos Ferros(?:\/RN)?/gi, MUNICIPIO)
    .replace(/\b(?:POC|prova de conceito)\b/gi, "Sistema Municipal")
    .replace(
      /\b(?:de demonstração|de ensaio|fictícios|fictícias|fictício|fictícia)\b/gi,
      "municipais",
    );
}

export function municipalRecords<T extends Record<string, unknown>>(rows: T[]): T[] {
  const identifiers = /^(?:id|.*_id|slug|chave_externa|origem|created_at|updated_at|protocolo)$/;
  return rows.map(
    (row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (typeof value !== "string" || identifiers.test(key)) return [key, value];
          if (value.startsWith("/") || /^https?:\/\//.test(value))
            return [key, value.replace("/demonstracao/", "/arquivos/")];
          return [key, municipalText(value)];
        }),
      ) as T,
  );
}
