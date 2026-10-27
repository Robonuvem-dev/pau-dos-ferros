import { describe, expect, it } from "vitest";
import { consultarApiExterna, ORIGENS_API } from "@/lib/integracao-externa";

describe("adaptadores de API externa da POC", () => {
  for (const [modulo, origens] of Object.entries(ORIGENS_API)) {
    for (const origem of origens) {
      it(`valida o lote completo de ${modulo} / ${origem} e mantém as chaves de reenvio`, async () => {
        const rows = await consultarApiExterna(modulo, origem, "2026-10");
        expect(rows).toHaveLength(3);
        expect(new Set(rows.map((r) => r.chave_externa)).size).toBe(3);
        expect(await consultarApiExterna(modulo, origem, "2026-10")).toEqual(rows);
        if (modulo === "servidores") {
          for (const r of rows) {
            expect(r.competencia).toBe("2026-10");
            expect(r.remuneracao).toBe(
              Number(r.subsidio) + Number(r.vantagens) - Number(r.descontos),
            );
          }
        }
      });
    }
  }
  it("recusa origem incompatível e competência inválida", async () => {
    await expect(consultarApiExterna("receitas", "TCE", "2026-10")).rejects.toThrow();
    await expect(consultarApiExterna("receitas", "Contabilidade", "2026-13")).rejects.toThrow();
  });
});
