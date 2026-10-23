import { describe, expect, it } from "vitest";
import { temaCss } from "@/lib/temas";

describe("tema do site", () => {
  it("sem configuração mantém o visual padrão", () => expect(temaCss({})).toBe(""));
  it("tema alto contraste usa preto como cor principal", () => expect(temaCss({ tema: "contraste" })).toContain("--primary:#000000"));
  it("cor personalizada válida substitui a do tema", () => expect(temaCss({ tema: "institucional", cor_primaria: "#123456" })).toContain("--primary:#123456"));
  it("cor inválida é ignorada", () => expect(temaCss({ tema: "institucional", cor_primaria: "red;}" })).toContain("--primary:#0b5ea8"));
});
