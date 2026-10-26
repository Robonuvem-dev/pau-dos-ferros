// Temas do site (item 2.7). Valores aplicados como variáveis de cor em todo o site.
export interface Tema { nome: string; primary: string; primaryDeep: string; accent: string; highlight: string; background?: string }

export const TEMAS: Record<string, Tema> = {
  institucional: { nome: "Institucional Azul", primary: "#0b5ea8", primaryDeep: "#08427a", accent: "#f08a1c", highlight: "#f5d33d" },
  cidadania: { nome: "Cidadania Verde", primary: "#176b52", primaryDeep: "#124d3c", accent: "#b94359", highlight: "#f5d33d", background: "#f4f8f5" },
  cultura: { nome: "Cultura e Patrimônio", primary: "#9b3048", primaryDeep: "#702338", accent: "#177e89", highlight: "#f5d33d", background: "#faf5f7" },
  moderno: { nome: "Municipal Contemporâneo", primary: "#24636a", primaryDeep: "#19464b", accent: "#c44b36", highlight: "#f5d33d", background: "#f4f7f8" },
  contraste: { nome: "Alto Contraste", primary: "#000000", primaryDeep: "#000000", accent: "#c00000", highlight: "#ffe600" },
  comemorativo: { nome: "Datas Comemorativas", primary: "#0a7a3d", primaryDeep: "#065a2c", accent: "#e0a400", highlight: "#ffd500" },
};

const HEX = /^#[0-9a-f]{6}$/i;

/** Monta o CSS do tema; cores personalizadas válidas substituem as do tema base. */
export function temaCss(cfg: Record<string, string>): string {
  const base = TEMAS[cfg.tema ?? ""] ?? TEMAS.institucional as Tema;
  const primary = HEX.test(cfg.cor_primaria ?? "") ? String(cfg.cor_primaria) : base.primary;
  const accent = HEX.test(cfg.cor_destaque ?? "") ? String(cfg.cor_destaque) : base.accent;
  const background = HEX.test(cfg.cor_fundo ?? "") ? cfg.cor_fundo : base.background;
  if (!background && !cfg.tema && primary === base.primary && accent === base.accent) return "";
  return `:root{--primary:${primary};--primary-deep:${base.primaryDeep};--accent:${accent};--highlight:${base.highlight};--ring:${primary};${background ? `--background:${background};` : ""}}`;
}
