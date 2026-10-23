// Temas do site (item 2.7). Valores aplicados como variáveis de cor em todo o site.
export interface Tema { nome: string; primary: string; primaryDeep: string; accent: string; highlight: string }

export const TEMAS: Record<string, Tema> = {
  institucional: { nome: "Institucional Azul", primary: "#0b5ea8", primaryDeep: "#08427a", accent: "#f08a1c", highlight: "#f5d33d" },
  contraste: { nome: "Alto Contraste", primary: "#000000", primaryDeep: "#000000", accent: "#c00000", highlight: "#ffe600" },
  comemorativo: { nome: "Datas Comemorativas", primary: "#0a7a3d", primaryDeep: "#065a2c", accent: "#e0a400", highlight: "#ffd500" },
};

const HEX = /^#[0-9a-f]{6}$/i;

/** Monta o CSS do tema; cores personalizadas válidas substituem as do tema base. */
export function temaCss(cfg: Record<string, string>): string {
  const base = TEMAS[cfg.tema ?? ""] ?? TEMAS.institucional!;
  const primary = HEX.test(cfg.cor_primaria ?? "") ? cfg.cor_primaria! : base.primary;
  const accent = HEX.test(cfg.cor_destaque ?? "") ? cfg.cor_destaque! : base.accent;
  if (!cfg.tema && primary === base.primary && accent === base.accent) return "";
  return `:root{--primary:${primary};--primary-deep:${base.primaryDeep};--accent:${accent};--highlight:${base.highlight};--ring:${primary}}`;
}
