export const MODELO_LOCAL = "Xenova/flan-t5-small";
const RUNTIME_LOCAL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";
type Gerador = (texto:string,options:Record<string,unknown>)=>Promise<{generated_text:string}[]>;
let carregamento: Promise<Gerador>|undefined;
export async function analisarLocalmente(texto:string,onStatus:(s:string)=>void):Promise<string>{
 if(typeof window==="undefined")throw new Error("A análise local precisa ser executada no navegador.");
 onStatus("Carregando modelo gratuito no dispositivo. O primeiro uso baixa os arquivos do modelo.");
 if(!carregamento)carregamento=(async()=>{
  const runtime=await import(/* @vite-ignore */ RUNTIME_LOCAL);
  runtime.env.allowLocalModels=false;
  runtime.env.backends.onnx.wasm.numThreads=1;
  return await runtime.pipeline("text2text-generation",MODELO_LOCAL,{
   dtype:"q8",device:"wasm",progress_callback:(p:{status?:string;progress?:number})=>{
    if(p.status==="progress")onStatus("Baixando modelo local: "+Math.round(p.progress??0)+"%");
   }
  }) as Gerador;
 })().catch(e=>{carregamento=undefined;throw e;});
 const gerador=await carregamento;
 onStatus("Executando IA no dispositivo, sem API de inferência externa...");
 const resultado=await gerador("Responda em português. Sugira ações objetivas para corrigir estas pendências de um portal de transparência municipal: "+texto.slice(0,1700),{max_new_tokens:160,do_sample:false});
 const saida=resultado[0]?.generated_text?.trim();
 if(!saida)throw new Error("O modelo local não retornou análise. Nenhum resultado foi aprovado automaticamente.");
 return saida;
}
