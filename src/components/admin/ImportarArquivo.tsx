import { useState } from "react";
import { db } from "@/lib/data";
import { IMPORT_COLUNAS, prepararImportacao } from "@/lib/importacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImportarArquivo({ modulo, onDone }: { modulo: string; onDone: () => void }) {
 const [origem,setOrigem] = useState("");
 const [rows,setRows] = useState<Record<string,unknown>[]>([]);
 const [erro,setErro] = useState("");
 const [sucesso,setSucesso] = useState("");
 const [busy,setBusy] = useState(false);
 const colunas = IMPORT_COLUNAS[modulo];
 if (!colunas) return null;
 const modelo = () => {
  const url=URL.createObjectURL(new Blob(["\uFEFF"+colunas.join(";")+"\n"],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a"); a.href=url; a.download=modulo+"-modelo.csv"; a.click(); URL.revokeObjectURL(url);
 };
 const ler = async (file?: File) => {
  setRows([]); setErro(""); setSucesso("");
  if (!file) return;
  if (file.size>2_000_000) {setErro("Arquivo acima de 2 MB.");return;}
  try {setRows(prepararImportacao(modulo,await file.text()));}
  catch(e) {setErro((e as Error).message);}
 };
 const importar = async () => {
  setBusy(true);setErro("");setSucesso("");
  try {
   const {data,error}=await db.rpc("importar_dados_poc",{_modulo:modulo,_origem:origem,_linhas:rows});
   if(error) throw error;
   setSucesso(String(data)+" registros importados e auditados.");setRows([]);onDone();
  } catch(e) {const code=(e as {code?:string}).code;
   setErro(code==="23505" ? "Esta origem e identificador já foram importados. O reenvio foi recusado sem duplicar registros." : code && /^[0-9A-Z]{5}$/.test(code) ? "Importação recusada: confira os campos e sua permissão. Nenhuma linha deste envio foi gravada." : "Não foi possível confirmar o resultado do envio. Confira os registros antes de reenviar.");}
  finally {setBusy(false);}
 };
 return <details className="mb-5 rounded border bg-card p-4">
  <summary className="cursor-pointer font-semibold">Importar arquivo CSV</summary>
  <p className="my-2 text-sm">Leiaute próprio do portal. Baixe o modelo, informe a origem e revise os registros. O envio é integral: qualquer erro cancela todas as linhas. Reenviar a mesma origem e identificador é bloqueado.</p>
  <p className="my-2 text-sm text-muted-foreground">A compatibilidade com sistemas contábeis, folha e TCE depende da validação de arquivos desses sistemas.</p>
  <Button variant="outline" onClick={modelo}>Baixar modelo CSV</Button>
  <div className="my-3 grid gap-3 sm:grid-cols-2">
   <Input aria-label="Sistema de origem do arquivo" placeholder="Sistema de origem" value={origem} maxLength={120} onChange={e=>setOrigem(e.target.value)} />
   <Input aria-label="Arquivo CSV para importar" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>{void ler(e.target.files?.[0]);e.target.value="";}}/>
  </div>
  {erro && <p role="alert" className="my-2 text-destructive">{erro}</p>}
  {sucesso && <p role="status" className="my-2">{sucesso}</p>}
  {rows.length>0 && <>
   <p className="my-2">{rows.length} registros válidos para revisão.</p>
   <div className="max-h-72 overflow-auto"><table className="w-full text-sm"><thead><tr>{Object.keys(rows[0] ?? {}).map(c=><th key={c} className="border p-2 text-left">{c}</th>)}</tr></thead>
   <tbody>{rows.slice(0,10).map((r,i)=><tr key={i}>{Object.values(r).map((v,j)=><td key={j} className="border p-2">{String(v??"—")}</td>)}</tr>)}</tbody></table></div>
   <p className="my-2 text-xs">Prévia das primeiras 10 linhas; validação executada em todas.</p>
   <Button disabled={busy||origem.trim().length<3} onClick={()=>void importar()}>{busy?"Importando...":"Confirmar importação"}</Button>
  </>}
 </details>;
}
