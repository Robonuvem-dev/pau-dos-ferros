import { Unzip, UnzipInflate, unzipSync } from "fflate";
import { SaxesParser } from "saxes";

function column(reference: string): number {
  let value = 0;
  for (const letter of reference.replace(/\d/g, "")) value = value * 26 + letter.charCodeAt(0) - 64;
  if (value < 1 || value > 500) throw new Error("Planilha com mais de 500 colunas.");
  return value - 1;
}
/** Leitura incremental das planilhas de respostas: o XML completo não fica na memória. */
export async function readLargeOfficialWorkbook(
  bytes: Uint8Array,
  filter: string,
): Promise<{ sheet: string; data: string[][]; sourceRows: number }[]> {
  const metadata = unzipSync(bytes, {
    filter: (file) => ["xl/workbook.xml", "xl/_rels/workbook.xml.rels"].includes(file.name),
  });
  const decoder = new TextDecoder();
  const relationships = new Map<string, string>();
  const rel = new SaxesParser();
  rel.on("opentag", (tag) => {
    if (tag.name === "Relationship") {
      const a = tag.attributes as Record<string, string>;
      relationships.set(a.Id!, a.Target!.replace(/^\//, "").replace(/^xl\//, ""));
    }
  });
  if (metadata["xl/_rels/workbook.xml.rels"])
    rel.write(decoder.decode(metadata["xl/_rels/workbook.xml.rels"])).close();
  const names = new Map<string, string>();
  const book = new SaxesParser();
  book.on("opentag", (tag) => {
    if (tag.name === "sheet") {
      const a = tag.attributes as Record<string, string>,
        target = relationships.get(a["r:id"]!);
      if (target) names.set("xl/" + target, a.name!);
    }
  });
  if (metadata["xl/workbook.xml"]) book.write(decoder.decode(metadata["xl/workbook.xml"])).close();
  const strings: string[] = [];
  const stream = async (wanted: (name: string) => boolean, open: (name: string) => SaxesParser) => {
    const unzip = new Unzip((file) => {
      if (!wanted(file.name)) return;
      const xml = open(file.name),
        decode = new TextDecoder();
      file.ondata = (error, data, final) => {
        if (error) throw error;
        xml.write(decode.decode(data, { stream: !final }));
        if (final) xml.close();
      };
      file.start();
    });
    unzip.register(UnzipInflate);
    for (let offset = 0; offset < bytes.length; offset += 65536) {
      unzip.push(bytes.subarray(offset, offset + 65536), offset + 65536 >= bytes.length);
      if (offset % 655360 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };
  await stream(
    (name) => name === "xl/sharedStrings.xml",
    () => {
      const xml = new SaxesParser();
      let value = "",
        text = false;
      xml.on("opentag", (tag) => {
        if (tag.name === "si") value = "";
        if (tag.name === "t") text = true;
      });
      xml.on("text", (chunk) => {
        if (text) value += chunk;
      });
      xml.on("closetag", (tag) => {
        if (tag.name === "t") text = false;
        if (tag.name === "si") strings.push(value);
      });
      return xml;
    },
  );
  const result: { sheet: string; data: string[][]; sourceRows: number }[] = [];
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const search = normalize(filter.trim());
  let cells = 0;
  await stream(
    (name) => /^xl\/worksheets\/[^/]+\.xml$/.test(name),
    (name) => {
      const sheet = { sheet: names.get(name) ?? name, data: [] as string[][], sourceRows: 0 };
      result.push(sheet);
      const xml = new SaxesParser();
      let row: string[] = [],
        value = "",
        type = "",
        index = 0,
        text = false;
      xml.on("opentag", (tag) => {
        const a = tag.attributes as Record<string, string>;
        if (tag.name === "row") row = [];
        if (tag.name === "c") {
          index = a.r ? column(a.r) : row.length;
          type = a.t ?? "";
          value = "";
        }
        if (tag.name === "v" || tag.name === "t") text = true;
      });
      xml.on("text", (chunk) => {
        if (text) value += chunk;
      });
      xml.on("closetag", (tag) => {
        if (tag.name === "v" || tag.name === "t") text = false;
        if (tag.name === "c")
          row[index] =
            type === "s"
              ? (strings[Number(value)] ?? "")
              : type === "b"
                ? value === "1"
                  ? "true"
                  : "false"
                : value;
        if (tag.name === "row" && row.some((v) => v?.trim())) {
          sheet.sourceRows++;
          if (
            sheet.sourceRows === 1 ||
            !search ||
            row.some((v) => normalize(v ?? "").includes(search))
          ) {
            cells += row.length;
            if (sheet.data.length >= 300_001 || cells > 8_000_000)
              throw new Error(
                "A publicação é muito grande. Informe um município ou órgão no filtro de importação.",
              );
            sheet.data.push(Array.from({ length: row.length }, (_, i) => row[i] ?? ""));
          }
        }
      });
      return xml;
    },
  );
  return result;
}
