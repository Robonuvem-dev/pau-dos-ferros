import { useRef, useState } from "react";
import { db } from "@/lib/data";
import { cabecalhosExternos, prepararLeiauteExterno } from "@/lib/importacao-mapeamento";
import { IMPORT_COLUNAS, prepararImportacao } from "@/lib/importacao";
import { decodificarCSV, type CodificacaoCSV } from "@/lib/csv-codificacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImportarArquivo({ modulo, onDone }: { modulo: string; onDone: () => void }) {
 const [externo,setExterno]=useState(false);
 const [codificacao,setCodificacao]=useState<CodificacaoCSV>('utf-8');
 const leitura = useRef(0);
 const [raw,setRaw]=useState("");
 const [headers,setHeaders]=useState<string[]>([]);
 const [mapa,setMapa]=useState<Record<string,string>>({});
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
  const tentativa = ++leitura.current;
  setRows([]); setErro(""); setSucesso("");setRaw('');setHeaders([]);setMapa({});
  if (!file) return;
  if (file.size>2_000_000) {setErro("Arquivo acima de 2 MB.");return;}
  try {const bytes=await file.arrayBuffer();if(tentativa!==leitura.current)return;const text=decodificarCSV(bytes,codificacao);setRaw(text);setHeaders(cabecalhosExternos(text));if(!externo)setRows(prepararImportacao(modulo,text));}
  catch(e) {if(tentativa===leitura.current)setErro((e as Error).message);}
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
  <label className="my-3 block"><input type="checkbox" checked={externo} onChange={e=>{++leitura.current;setExterno(e.target.checked);setRows([]);setRaw('');setHeaders([]);setMapa({});setErro("");}} /> Mapear colunas de outro leiaute CSV</label>
  <Button variant="outline" onClick={modelo}>Baixar modelo CSV</Button>
  <label className="my-3 block">Codificação do arquivo <select aria-label="Codificação do arquivo CSV" disabled={busy} className="ml-2 rounded border p-1" value={codificacao} onChange={e=>{++leitura.current;setCodificacao(e.target.value as CodificacaoCSV);setRows([]);setHeaders([]);setMapa({});setRaw('');setErro('');setSucesso('');}}><option value="utf-8">UTF-8</option><option value="windows-1252">Windows-1252 (ANSI)</option></select></label>
  <p className="text-sm text-muted-foreground">Selecione a codificação usada na exportação antes de escolher o arquivo. Ao alterar, escolha o arquivo novamente e revise a prévia.</p>
  <div className="my-3 grid gap-3 sm:grid-cols-2">
   <Input aria-label="Sistema de origem do arquivo" placeholder="Sistema de origem" value={origem} maxLength={120} onChange={e=>setOrigem(e.target.value)} />
   <Input aria-label="Arquivo CSV para importar" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>{void ler(e.target.files?.[0]);e.target.value="";}}/>
  </div>
  {externo && headers.length>0 && <details open className="my-3 rounded border p-3"><summary>Correspondência de colunas</summary>
   <p className="my-2 text-sm">Associe as colunas do arquivo às do portal; campos não associados não serão enviados. O mapeamento não certifica compatibilidade com fornecedor ou TCE.</p>
   <div className="grid gap-2 sm:grid-cols-2">{colunas.map(dest=><label key={dest}>{dest}<select className="ml-2 rounded border p-1" aria-label={'Coluna externa para '+dest} value={mapa[dest]??''} onChange={e=>{setMapa(m=>({...m,[dest]:e.target.value}));setRows([]);}}><option value="">Não importar</option>{headers.map(h=><option key={h} value={h}>{h}</option>)}</select></label>)}</div>
   <Button className="mt-3" variant="outline" onClick={()=>{try{setRows(prepararLeiauteExterno(modulo,raw,mapa));setErro('');}catch(e){setRows([]);setErro((e as Error).message);}}}>Validar correspondências e mostrar prévia</Button>
  </details>}
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
