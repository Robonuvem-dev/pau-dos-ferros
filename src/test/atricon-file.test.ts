import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { Blob as NodeBlob } from "node:buffer";
import { readFileSync } from "node:fs";
import { zipSync, strToU8 } from "fflate";
import { parseOfficialFile, officialDocumentBlob } from "@/lib/atricon-file";
import type { OfficialDownload } from "@/lib/atricon-official";
import { compareOfficialCriteria } from "@/lib/ai-evidence";

beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("Blob", NodeBlob);
});
afterEach(() => vi.unstubAllGlobals());
async function file(bytes: Uint8Array, format: string): Promise<OfficialDownload> {
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer as ArrayBuffer);
  return {
    resource: {
      year: 2025,
      url: `https://radardatransparencia.atricon.org.br/2025.${format}`,
      label: `Publicação de referência.${format}`,
      format,
      fetchable: true,
    },
    importedAt: "2026-10-27T12:00:00Z",
    bytes: bytes.length,
    base64: Buffer.from(bytes).toString("base64"),
    sha256: Buffer.from(digest).toString("hex"),
  };
}
function workbook() {
  return zipSync({
    "[Content_Types].xml": strToU8(
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>',
    ),
    "_rels/.rels": strToU8(
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    ),
    "xl/workbook.xml": strToU8(
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Resultados" sheetId="1" r:id="rId1"/></sheets></workbook>',
    ),
    "xl/_rels/workbook.xml.rels": strToU8(
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    ),
    "xl/worksheets/sheet1.xml": strToU8(
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Órgão</t></is></c><c r="B1" t="inlineStr"><is><t>Índice</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Município de referência</t></is></c><c r="B2"><v>87.5</v></c></row></sheetData></worksheet>',
    ),
  });
}
describe("leitura integral das publicações", () => {
  it("lê CSV com vírgula decimal e descrições oficiais sem aprovar os critérios", async () => {
    const result = await parseOfficialFile(
      await file(strToU8('Critério;Índice\n"Divulga a íntegra das receitas";87,5'), "csv"),
    );
    expect(result.imported.sheets[0]?.rows).toEqual([["Divulga a íntegra das receitas", "87,5"]]);
    expect(result.imported.criteria).toEqual(["Divulga a íntegra das receitas"]);
    expect(result.imported).not.toHaveProperty("status");
  });
  it("lê uma planilha XLSX real e preserva seus valores", async () => {
    const result = await parseOfficialFile(await file(workbook(), "xlsx"));
    expect(result.imported.sheets[0]?.headers).toEqual(["Órgão", "Índice"]);
    expect(result.imported.sheets[0]?.rows).toEqual([["Município de referência", "87.5"]]);
  });
  it("abre múltiplos arquivos no ZIP e permite visualizar o PDF preservado", async () => {
    const pdf = readFileSync("public/arquivos/dossie-01.pdf");
    const result = await parseOfficialFile(
      await file(
        zipSync({ "base.csv": strToU8("Órgão;Índice\nReferência;80"), "manual.pdf": pdf }),
        "zip",
      ),
    );
    expect(result.imported.sheets).toHaveLength(1);
    expect(result.imported.documents[0]?.name).toBe("manual.pdf");
    const original = await officialDocumentBlob(result.original, "zip", "manual.pdf");
    expect(Buffer.from(await original.arrayBuffer())).toEqual(pdf);
  });
  it("preserva campos de todos os objetos JSON e recusa falha de integridade ou HTML", async () => {
    const download = await file(
      strToU8(
        JSON.stringify({
          dados: [
            { orgao: "A", indice: 90 },
            { orgao: "B", nivel: "Ouro" },
          ],
        }),
      ),
      "json",
    );
    const result = await parseOfficialFile(download);
    expect(result.imported.sheets[0]?.headers).toEqual(["orgao", "indice", "nivel"]);
    expect(result.imported.sheets[0]?.rows).toHaveLength(2);
    await expect(parseOfficialFile({ ...download, sha256: "0".repeat(64) })).rejects.toThrow(
      "integridade",
    );
    await expect(
      parseOfficialFile(await file(strToU8("<html>Autenticação necessária</html>"), "csv")),
    ).rejects.toThrow("HTML");
  });
  it("rejeita expansão desproporcional antes de descompactar", async () => {
    const zip = zipSync({ "dados.csv": strToU8("A;B\n1;2") });
    for (let i = 0; i < zip.length - 4; i++)
      if (zip[i] === 0x50 && zip[i + 1] === 0x4b && zip[i + 2] === 1 && zip[i + 3] === 2) {
        new DataView(zip.buffer).setUint32(i + 24, 257 * 1024 * 1024, true);
        break;
      }
    await expect(parseOfficialFile(await file(zip, "zip"))).rejects.toThrow("limite seguro");
  });
  it("compara descrições importadas com a página pública correspondente e mantém indícios separados de aprovação", async () => {
    const embed = vi.fn(async (texts: string[]) =>
      texts.map((text) => (text.includes("receitas") ? [1, 0] : [0, 1])),
    );
    const results = await compareOfficialCriteria(
      ["Divulga receitas", "Divulga contratos"],
      [
        {
          criterio: "interno",
          texto: "Dados de receitas",
          link: "https://portal.example/receitas",
          coleta: "lida",
        },
        {
          criterio: "interno",
          texto: "Dados de contratos",
          link: "https://portal.example/contratos",
          coleta: "lida",
        },
      ],
      embed,
    );
    expect(results.map((r) => r.link)).toEqual([
      "https://portal.example/receitas",
      "https://portal.example/contratos",
    ]);
    expect(results.every((r) => r.sinal === "indicio_textual")).toBe(true);
    expect(results[0]).not.toHaveProperty("status");
    expect((await compareOfficialCriteria(["Divulga receitas"], [], embed))[0]?.sinal).toBe(
      "coleta_pendente",
    );
  });
});
