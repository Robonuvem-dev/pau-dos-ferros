import { describe, expect, it } from "vitest";
import { fieldMask, formatMaskedValue, maskText, parseLocalizedNumber } from "@/lib/formatting";
import { formatCell, MODULES } from "@/lib/modules";
import { normalizeField } from "@/lib/normalization";

describe("formatação central de campos", () => {
  it.each([
    ["cpf", "12345678901", "123.456.789-01"],
    ["cnpj", "12345678000190", "12.345.678/0001-90"],
    ["cnpj", "12ABC345000190", "12.ABC.345/0001-90"],
    ["document", "12345678901", "123.456.789-01"],
    ["document", "12345678000190", "12.345.678/0001-90"],
    ["phone", "84999998888", "(84) 99999-8888"],
    ["phone", "8433334444", "(84) 3333-4444"],
    ["phone", "+5584999998888", "+55 (84) 99999-8888"],
    ["cep", "59900000", "59900-000"],
    ["plate", "abc1234", "ABC-1234"],
    ["plate", "abc1d23", "ABC1D23"],
  ] as const)("aplica %s sem alterar a informação", (mask, value, expected) => {
    expect(maskText(mask, value)).toBe(expected);
    expect(maskText(mask, expected)).toBe(expected);
  });
  it("formata valores, datas e competências nas tabelas e exportações", () => {
    expect(
      formatCell({ name: "valor", label: "Valor", type: "money" }, 1234.56).replace(/\s/g, " "),
    ).toBe("R$ 1.234,56");
    expect(formatCell({ name: "data", label: "Data", type: "date" }, "2026-10-27")).toBe(
      "27/10/2026",
    );
    expect(formatCell({ name: "competencia", label: "Competência" }, "2026-10")).toBe("10/2026");
    expect(formatCell({ name: "percentual", label: "Execução", type: "number" }, 42.5)).toBe(
      "42,5%",
    );
    expect(formatCell({ name: "ano", label: "Ano", type: "int" }, 2026)).toBe("2026");
    expect(formatMaskedValue("document", "***.123.***-**")).toBe("***.123.***-**");
    expect(formatMaskedValue("phone", "(84) 3333-4444 / ramal 2")).toBe("(84) 3333-4444 / ramal 2");
  });
  it.each([
    ["R$ 1.234,56", 1234.56],
    ["-12,50", -12.5],
    ["1234.56", 1234.56],
    ["0", 0],
    ["", null],
    ["abc", null],
  ] as const)("normaliza %s antes de gravar", (value, expected) => {
    expect(parseLocalizedNumber(value)).toBe(expected);
    expect(normalizeField({ name: "valor", label: "Valor", type: "money" }, value)).toBe(expected);
  });
  it("formata CNPJ alfanumérico também na exibição", () => {
    expect(formatMaskedValue("document", "12ABC345000190")).toBe("12.ABC.345/0001-90");
    expect(formatMaskedValue("cnpj", "**.***.***/0001-**")).toBe("**.***.***/0001-**");
  });
  it("abrange todos os campos tipados e documentos do catálogo", () => {
    for (const mod of MODULES)
      for (const field of mod.fields) {
        if (field.type === "money") expect(fieldMask(field)).toBe("money");
        if (field.name === "cnpj") expect(["cnpj", "document"]).toContain(fieldMask(field));
        if (field.name === "telefone") expect(fieldMask(field)).toBe("phone");
      }
  });
});
