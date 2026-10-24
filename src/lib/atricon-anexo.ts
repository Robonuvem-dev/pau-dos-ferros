import { STATUS_LABEL,type Avaliacao } from "./atricon";
import { getModule } from "./modules";
export function montarAnexo(itens:Avaliacao[],pendencias:{modulo:string;problema:string}[],analise:string,modelo:string,quando:string){
 if(itens.length!==88)throw new Error("O relatório exige exatamente 88 itens.");
 if(!analise.trim())throw new Error("A análise de IA precisa ser executada antes de emitir o anexo.");
 return [
 "ANEXO TÉCNICO — POC PAU DOS FERROS/RN",
 "Emissão: "+quando,"Modelo executado localmente: "+modelo,
 "Relatório operacional de demonstração. A matriz deve ser confrontada com a edição oficial aplicável do PNTP/ATRICON. Não constitui certificação ou homologação.",
 "",
 "1. Análise gerada por IA local (sujeita à revisão técnica)",analise,
 "",
 "2. Registro individual dos 88 pontos e caminho de adequação",
 ...itens.map(i=>{
  const rota=i.fonte==="portal"?"/":i.fonte&&getModule(i.fonte)?"/transparencia/"+i.fonte:"/transparencia/documentos";
  const cadastro=i.fonte&&getModule(i.fonte)?"/admin/"+i.fonte:"/admin/documentos";
  return "["+i.id+"] "+i.dimensao+" — "+i.descricao+"\nSituação: "+STATUS_LABEL[i.status]+"\nEvidência: "+(i.link||"Não registrada")+"\nVerificação: "+(i.observacao||"Pendente")+"\nAdequação: revisar o requisito, obter documento/dado autorizado, cadastrar em "+cadastro+", conferir acesso público em "+rota+" e registrar URL e passo executado. Reavaliar atualização, acessibilidade e proteção de dados antes de aprovar.";
 }),
 "",
 "3. Pendências detectadas nos cadastros",
 ...pendencias.map(p=>"- "+(getModule(p.modulo)?.label??p.modulo)+": "+p.problema),
 "",
 "4. Execução sugerida",
 "Imediato: corrigir bloqueadores e registros obrigatórios; setor responsável pelo dado valida o conteúdo.",
 "Até 30 dias: revisar documentos, fontes e atualização com Controle Interno.",
 "Até 60 dias: repetir avaliação individual e testes de acessibilidade.",
 "Até 90 dias: revisão periódica das evidências e responsáveis. Esses intervalos não alteram o prazo da convocação da PoC."
 ].join("\n");
}
