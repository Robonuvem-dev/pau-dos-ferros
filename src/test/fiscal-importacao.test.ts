import { describe,it,expect } from "vitest";
import { prepararImportacao } from "@/lib/importacao";
import { resumoFiscal,agruparPessoal } from "@/lib/fiscal";
import { initialValues } from "@/lib/normalization";
import { getModule } from "@/lib/modules";
describe("Importação com leiaute próprio",()=>{
 it("normaliza valores brasileiros e datas sem perder identificadores",()=>{
  expect(prepararImportacao("receitas","ano;mes;categoria;chave_externa;arrecadado;data_receita\n2026;10;Imposto;001;1.234,56;23/10/2026")[0]).toEqual({ano:2026,mes:10,categoria:"Imposto",chave_externa:"001",arrecadado:1234.56,data_receita:"2026-10-23"});
 });
 it.each([
  ["ano;mes;categoria;chave_externa\n2026;13;A;1","mês"],
  ["ano;mes;categoria;chave_externa\n2026;1.2;A;1","número"],
  ["ano;mes;categoria;chave_externa;arrecadado\n2026;10;A;1;abc","número"],
  ["ano;mes;categoria;chave_externa;data_receita\n2026;10;A;1;2026-02-30","data"],
  ["ano;mes;categoria;chave_externa;role\n2026;10;A;1;admin","permitida"],
  ["ano;mes;categoria;chave_externa\n2026;10;A;1\n2026;10;B;1","repetido"],
  ["ano;mes;categoria;chave_externa\n2026;10;A","colunas"],
  ["ano;mes;categoria;chave_externa\n2026;10;;1","preencha"],
 ])("recusa arquivo inválido antes de gravar (%s)",(csv,erro)=>expect(()=>prepararImportacao("receitas",csv)).toThrow(erro));
 it("recusa lote maior que 500 e módulo não permitido",()=>{
  expect(()=>prepararImportacao("receitas","ano;mes;categoria;chave_externa\n"+Array.from({length:501},(_,i)=>"2026;10;A;"+i).join("\n"))).toThrow("500");
  expect(()=>prepararImportacao("usuarios","a\n1")).toThrow("indisponível");
 });
 it("exige competência de pessoal e não mistura classificações",()=>{
  expect(()=>prepararImportacao("servidores","nome;chave_externa\nPessoa ficticia;1")).toThrow("competencia");
  expect(()=>prepararImportacao("receitas","ano;mes;categoria;chave_externa;natureza\n2026;10;A;1;Inventada")).toThrow("opção");
 });
});
describe("Relatórios fiscais e pessoal",()=>{
 it("separa exercício e natureza, calcula saldos com centavos",()=>{
  const despesas=[{ano:2026,natureza:"Extraorçamentária",empenhado:0.3,liquidado:0.2,pago:0.1},{ano:2025,empenhado:100}];
  expect(resumoFiscal([],despesas,"2026","Extraorçamentária")).toMatchObject({empenhado:0.3,liquidado:0.2,pago:0.1,aLiquidar:0.1,aPagar:0.1,despesas:1});
  expect(resumoFiscal([],despesas,"2025","Sem classificação").empenhado).toBe(100);
 });
 it("agrupa pessoal por cargo, secretaria ou vínculo sem somar outra competência",()=>{
  const rows=[{cargo:"Cargo A",lotacao:"Saude",vinculo:"Efetivo",competencia:"2026-10",remuneracao:1200,subsidio:1000,vantagens:300,descontos:100},{cargo:"Cargo A",competencia:"2026-09",remuneracao:900}];
  expect(agruparPessoal(rows,"cargo","2026-10")[0]).toMatchObject({grupo:"Cargo A",pessoas:1,remuneracao:1200,subsidio:1000,vantagens:300,descontos:100});
  expect(agruparPessoal(rows,"lotacao","2026-10")[0].grupo).toBe("Saude");
  expect(agruparPessoal(rows,"vinculo","2026-10")[0].grupo).toBe("Efetivo");
 });
 it("não inventa datas de recebimento, baixa, agendamento ou término",()=>{
  expect(initialValues(getModule("convenio-parcelas")!)).toMatchObject({recebido_em:"",vencimento:""});
  expect(initialValues(getModule("noticias")!)).toMatchObject({agendar_para:"",evento_data:"",publicado:true});
 });
});
