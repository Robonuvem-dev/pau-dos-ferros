export type RegistroFinanceiro = Record<string, unknown>;
const centavos = (v: unknown) => Math.round((Number(v) || 0)*100);
export function resumoFiscal(receitas: RegistroFinanceiro[], despesas: RegistroFinanceiro[], ano: string, natureza: string) {
 const filtrar = (r: RegistroFinanceiro) => (!ano||String(r.ano)===ano)&&(!natureza||String(r.natureza??"Sem classificação")===natureza);
 const rs=receitas.filter(filtrar), ds=despesas.filter(filtrar);
 const soma=(rows:RegistroFinanceiro[],col:string)=>rows.reduce((a,r)=>a+centavos(r[col]),0)/100;
 const empenhado=soma(ds,"empenhado"),liquidado=soma(ds,"liquidado"),pago=soma(ds,"pago");
 return {previsto:soma(rs,"previsto"),arrecadado:soma(rs,"arrecadado"),empenhado,liquidado,pago,aLiquidar:Math.round((empenhado-liquidado)*100)/100,aPagar:Math.round((liquidado-pago)*100)/100,receitas:rs.length,despesas:ds.length};
}
export function agruparPessoal(rows: RegistroFinanceiro[], por: "cargo"|"lotacao"|"vinculo", competencia: string) {
 const grupos = new Map<string,{grupo:string;pessoas:number;remuneracao:number;subsidio:number;vantagens:number;descontos:number}>();
 for(const r of rows) {
  if(competencia&&String(r.competencia??"")!==competencia)continue;
  const nome=String(r[por]||"Não informado");
  const g=grupos.get(nome)??{grupo:nome,pessoas:0,remuneracao:0,subsidio:0,vantagens:0,descontos:0};
  g.pessoas++;
  for(const c of ["remuneracao","subsidio","vantagens","descontos"] as const)g[c]+=centavos(r[c]);
  grupos.set(nome,g);
 }
 return [...grupos.values()].map(g=>({...g,remuneracao:g.remuneracao/100,subsidio:g.subsidio/100,vantagens:g.vantagens/100,descontos:g.descontos/100})).sort((a,b)=>a.grupo.localeCompare(b.grupo,"pt-BR"));
}
