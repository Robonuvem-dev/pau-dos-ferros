import {readFile} from 'node:fs/promises';
import {executarIntegracao} from '../src/lib/integracao-remota.ts';
const path=process.argv[2];
if(!path)throw new Error('Uso: bun scripts/sincronizar-integracao.mjs configuracao.json [--watch=900]');
const config=JSON.parse(await readFile(path,'utf8'));
const intervalArg=process.argv.find(x=>x.startsWith('--watch='));
const interval=intervalArg?Number(intervalArg.split('=')[1]):0;
if(intervalArg&&(!Number.isInteger(interval)||interval<60))throw new Error('Intervalo mínimo: 60 segundos.');
const credentials={backendUrl:process.env.POC_SUPABASE_URL,publishableKey:process.env.POC_PUBLISHABLE_KEY,email:process.env.POC_INTEGRATION_EMAIL,password:process.env.POC_INTEGRATION_PASSWORD,sourceToken:process.env.POC_SOURCE_TOKEN};
if(!credentials.backendUrl||!credentials.publishableKey||!credentials.email||!credentials.password)throw new Error('Configure as variáveis POC_SUPABASE_URL, POC_PUBLISHABLE_KEY, POC_INTEGRATION_EMAIL e POC_INTEGRATION_PASSWORD.');
do{
 try{const total=await executarIntegracao(config,credentials);console.log(new Date().toISOString()+': '+total+' registro(s) sincronizados em '+config.modulo);}
 catch(e){console.error(new Date().toISOString()+': '+e.message);if(!interval)process.exitCode=1;}
 if(interval)await new Promise(resolve=>setTimeout(resolve,interval*1000));
}while(interval);
