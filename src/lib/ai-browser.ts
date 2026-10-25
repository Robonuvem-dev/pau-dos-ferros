import { comparePublicEvidence, type EvidenceInput } from "./ai-evidence";
export const MODELO_LOCAL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const RUNTIME_LOCAL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1";
const TEMAS = ["Receitas, arrecadação, classificação da receita e categoria orçamentária","Despesas, empenhos, liquidações, pagamentos e ordem bancária","Problemas no cadastro de servidores públicos: folha de pagamento, remuneração, competência mensal, cargo, vínculo e lotação.","Licitações, editais, contratos, aditivos e documentos da contratação","Convênios, repasses, metas, parcelas e prestação de contas","Obras, ART, medições, execução física e financeira","Veículos, seguro, IPVA e manutenção da frota","Problemas em conselhos municipais: lei de criação, conselheiros, mandatos, atas e reuniões.","Serviços, prazos, etapas, Ouvidoria e e-SIC","Site institucional, notícias, imagens, banners e secretarias"];
type Extrator=(texto:string[],opcoes:Record<string,unknown>)=>Promise<{tolist:()=>number[][]}>;
let carregamento:Promise<Extrator>|undefined;
export async function analisarLocalmente(texto:string,onStatus:(s:string)=>void):Promise<string>{
 if(typeof window==="undefined")throw new Error("A análise local precisa ser executada no navegador.");
 onStatus("Carregando modelo semântico gratuito no dispositivo. O primeiro uso baixa os arquivos do modelo.");
 const extrator=await carregarExtrator(onStatus);
 const frases=[...new Set(texto.split(";").map(t=>t.trim()).filter(Boolean))].slice(0,50);
 if(!frases.length)throw new Error("Não há observações suficientes para analisar.");
 const temas=(await extrator(TEMAS,{pooling:"mean",normalize:true})).tolist();
 const saida=["Análise semântica de "+frases.length+" alertas por modelo neural multilíngue executado localmente. Sem prompts, geração de texto livre ou API paga. As similaridades não comprovam atendimento de requisito."];
 for(let start=0;start<frases.length;start+=8){
  onStatus("Analisando alertas "+(start+1)+" a "+Math.min(start+8,frases.length)+" de "+frases.length+" no dispositivo...");
  const lote=frases.slice(start,start+8);
  const vetores=(await extrator(lote,{pooling:"mean",normalize:true})).tolist();
  lote.forEach((frase,i)=>{
   const vetor=vetores[i];if(!vetor)throw new Error("Resposta neural incompleta.");
   const ranks=temas.map((v,j)=>({tema:TEMAS[j]!,score:v.reduce((s,n,k)=>s+n*(vetor[k]??0),0)})).sort((a,b)=>b.score-a.score);
   const melhor=ranks[0];if(!melhor||!Number.isFinite(melhor.score))throw new Error("Resultado neural inválido.");
   saida.push("- "+frase+"\n  Tema sugerido: "+(melhor.score>=0.28?melhor.tema:"Revisão humana necessária")+"\n  Similaridade semântica: "+melhor.score.toFixed(3)+". Conferir o cadastro de origem, corrigir a pendência e registrar evidência pública.");
  });
 }
 return saida.join("\n");
}

async function carregarExtrator(onStatus:(s:string)=>void):Promise<Extrator>{
 if(!carregamento)carregamento=(async()=>{
  const runtime=await import(/* @vite-ignore */ RUNTIME_LOCAL);
  runtime.env.allowLocalModels=false;
  runtime.env.backends.onnx.wasm.numThreads=1;
  return await runtime.pipeline("feature-extraction",MODELO_LOCAL,{dtype:"q8",device:"wasm",progress_callback:(p:{status?:string;progress?:number})=>{
   if(p.status==="progress")onStatus("Baixando modelo local: "+Math.round(p.progress??0)+"%");
  }}) as Extrator;
 })().catch(e=>{carregamento=undefined;throw e;});
 return await carregamento;
}

export async function analisarEvidenciasPublicas(cases:EvidenceInput[],onStatus:(s:string)=>void):Promise<string>{
 if(typeof window==='undefined')throw new Error('A análise precisa ser executada no navegador.');
 onStatus('Carregando modelo semântico local para comparar o conteúdo público com os critérios que possuem fonte configurada.');
 const extrator=await carregarExtrator(onStatus);
 const results=await comparePublicEvidence(cases,async texts=>(await extrator(texts,{pooling:'mean',normalize:true})).tolist());
 return ['Varredura do conteúdo público: '+results.length+' pontos registrados; '+results.filter(r=>!r.coleta||r.coleta==='lida').length+' com leitura concluída; '+results.filter(r=>r.sinal==='revisao_necessaria').length+' com coleta pendente. Modelo neural local, sem prompts ou API paga.',
  'Um indício textual não comprova conformidade jurídica, atualização, completude ou conteúdo dos PDFs. Evidência não localizada deve ser revisada pelo setor responsável.',
  ...results.map(r=>r.criterio+'\n'+(r.sinal==='revisao_necessaria'?'COLETA PENDENTE: '+(r.detalhe??r.coleta):r.sinal==='evidencia_nao_localizada'?'PENDÊNCIA: evidência textual não localizada com similaridade suficiente.':'Indício textual localizado; conferir valores, datas e documentos antes de validar.')+'\nURL: '+(r.link||'Fonte específica não configurada')+'\nSimilaridade: '+r.similaridade.toFixed(3)+(r.coleta==='lida'&&r.detalhe?'\nLimitação: '+r.detalhe:''))].join('\n\n');
}
