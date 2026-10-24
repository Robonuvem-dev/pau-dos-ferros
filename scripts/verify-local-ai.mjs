import { pipeline,env } from "@huggingface/transformers";
import { writeFile } from "node:fs/promises";
env.allowLocalModels=false;
const model="Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const start=Date.now();
const extractor=await pipeline("feature-extraction",model,{dtype:"q8",device:"cpu"});
const categories=["Receitas, arrecadação, classificação da receita e categoria orçamentária","Despesas, empenhos, liquidações, pagamentos e ordem bancária","Problemas no cadastro de servidores públicos: folha de pagamento, remuneração, competência mensal, cargo, vínculo e lotação.","Licitações, editais, contratos, aditivos e documentos da contratação","Convênios, repasses, metas, parcelas e prestação de contas","Obras, ART, medições, execução física e financeira","Veículos, seguro, IPVA e manutenção da frota","Problemas em conselhos municipais: lei de criação, conselheiros, mandatos, atas e reuniões.","Serviços, prazos, etapas, Ouvidoria e e-SIC","Site institucional, notícias, imagens, banners e secretarias"];
const inputs=["Receita sem classificação orçamentária","Servidor sem competência da folha"];
const vectors=(await extractor([...categories,...inputs],{pooling:"mean",normalize:true})).tolist();
const results=inputs.map((input,i)=>{
 const v=vectors[categories.length+i];
 const ranked=categories.map((category,j)=>({category,index:j,score:vectors[j].reduce((s,n,k)=>s+n*v[k],0)})).sort((a,b)=>b.score-a.score);
 return {input,prediction:ranked[0]};
});
if(results[0].prediction.index!==0||results[1].prediction.index!==2)throw new Error("The real neural model did not identify revenue/payroll correctly: "+JSON.stringify(results));
const proof={model,engine:"ONNX Runtime CPU",paidInferenceAPI:false,prompts:false,elapsedMs:Date.now()-start,results};
await writeFile("local-ai-evidence.json",JSON.stringify(proof,null,2));
console.log(JSON.stringify(proof));
await extractor.dispose();
