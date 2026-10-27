import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { municipalText, municipalRecords, PREFEITURA, BRASAO_URL } from "@/lib/municipal-brand";
import { ADMIN_MODULES } from "@/lib/admin-modules";

describe("identidade municipal", () => {
  it("padroniza o nome e o brasão informado", () => {
    expect(PREFEITURA).toBe("Prefeitura de Aurora das Veredas");
    expect(BRASAO_URL).toContain("Bras%C3%A3o_do_munic%C3%ADpio_de_Aurora");
  });
  it("apresenta o conteúdo institucional armazenado com a nova identidade", () => {
    expect(municipalText("Prefeitura de Pau dos Ferros/RN")).toBe(PREFEITURA);
    expect(municipalText("Notícias da POC de demonstração")).not.toMatch(/POC|demonstração/);
  });
  it("preserva identificadores e os dados numéricos na leitura de cadastros", () => {
    const source = {
      id: "poc-01",
      chave_externa: "POC-ORIGEM",
      valor: 1234.56,
      nome: "Prefeitura de Pau dos Ferros",
      arquivo_url: "/demonstracao/dossie-01.pdf",
    };
    const [row] = municipalRecords([source]);
    expect(row).toMatchObject({
      id: source.id,
      chave_externa: source.chave_externa,
      valor: 1234.56,
      nome: PREFEITURA,
      arquivo_url: "/arquivos/dossie-01.pdf",
    });
    expect(source.nome).toBe("Prefeitura de Pau dos Ferros");
  });
  it("mantém os dezesseis módulos e usa a rota administrativa institucional", () => {
    expect(ADMIN_MODULES).toHaveLength(16);
    const page = readFileSync("src/routes/_authenticated/admin.index.tsx", "utf8");
    expect(page).toContain("/admin/modulos/$id");
    expect(page).not.toContain("/admin/poc/");
    expect(readFileSync("src/routes/__root.tsx", "utf8")).not.toContain("AMBIENTE DE PROVA");
  });
});
