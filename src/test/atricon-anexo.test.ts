import { describe,it,expect } from "vitest";
import { avaliar,CRITERIOS } from "@/lib/atricon";
import { montarAnexo } from "@/lib/atricon-anexo";
describe("Anexo técnico executado",()=>{
 it("inclui cada um dos 88 pontos e rotas de adequação sem aprovar cadastros",()=>{
  const itens=avaliar({receitas:999,despesas:999},{});
  const t=montarAnexo(itens,[{modulo:"receitas",problema:"Receita sem classificação"}],"Análise local executada","Modelo de teste","2026-10-24");
  expect(CRITERIOS).toHaveLength(88);
  for(const i of itens)expect(t).toContain("["+i.id+"]");
  expect(t).toContain("/admin/receitas");
  expect(t).toContain("Não registrada");
  expect(itens.every(i=>i.status==="nao_atende")).toBe(true);
 });
 it("não emite anexo sem inferência ou com matriz incompleta",()=>{
  expect(()=>montarAnexo(avaliar({},{}),[],"","modelo","data")).toThrow("executada");
  expect(()=>montarAnexo([],[],"análise","modelo","data")).toThrow("88");
 });
});
