import { afterEach,describe,it,expect,vi } from "vitest";
import { render,screen,cleanup } from "@testing-library/react";
import { ObrasDetalhadas } from "@/components/transparencia/ObrasDetalhadas";
import { ConselhosDetalhados } from "@/components/transparencia/ConselhosDetalhados";
import { CovidDetalhado } from "@/components/transparencia/CovidDetalhado";
import { avaliarPendencias } from "@/lib/criticas";
import { initialValues } from "@/lib/normalization";
import { getModule } from "@/lib/modules";
const fixtures=vi.hoisted(()=>({
 obras:[{id:"o1",nome:"POC obra",percentual:40,situacao:"Em andamento",contrato_id:"ct1"}],
 "obra-medicoes":[{id:"m1",obra_id:"o1",numero:"MEDICAO-CORRETA",aprovada:true,valor:123},{id:"m2",obra_id:"o2",numero:"OUTRA-MEDICAO"}],
 contratos:[{id:"ct1",numero:"CONTRATO-ORIGEM",fornecedor:"Fornecedor POC",valor:1000},{id:"ct2",numero:"ADITIVO-ORIGEM",tipo:"Aditivo",contrato_origem:"CONTRATO-ORIGEM"}],
 conselhos:[{id:"c1",nome:"Conselho POC",competencias:"Fiscalizar ensaios",cor:"#123456"},{id:"c2",nome:"Outro conselho"}],
 "conselho-membros":[{id:"mc1",conselho_id:"c1",nome:"Membro correto",tipo:"Titular",representacao:"Sociedade civil",ativo:true},{id:"mc2",conselho_id:"c2",nome:"Membro de outro conselho"}],
 "conselho-acoes":[], "conselho-doc":[],
 despesas:[{id:"d1",empenho:"POC-COVID",acao_emergencial:"COVID-19",pago:10},{id:"d2",empenho:"NAO-COVID",pago:100}],
}));
vi.mock("@/lib/queries",()=>({moduleQuery:(key:string)=>({queryKey:["public-module",key]})}));
vi.mock("@tanstack/react-query",()=>({useQueries:({queries}:{queries:{queryKey:string[]}[]})=>queries.map(q=>({data:fixtures[q.queryKey[1] as keyof typeof fixtures]??[],error:null}))}));
afterEach(cleanup);
describe("Acompanhamento de obras, conselhos e emergências",()=>{
 it("exibe medição da obra correta e dados do contrato sem redigitação",()=>{
  render(<ObrasDetalhadas/>);
  expect(screen.getByText(/MEDICAO-CORRETA/)).toBeInTheDocument();
  expect(screen.queryByText(/OUTRA-MEDICAO/)).not.toBeInTheDocument();
  expect(screen.getByText(/Fornecedor POC/)).toBeInTheDocument();
  expect(screen.getByText(/ADITIVO-ORIGEM/)).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("value","40");
 });
 it("isola a página individual e os membros de cada conselho",()=>{
  render(<ConselhosDetalhados registro="c1"/>);
  expect(screen.getByText("Conselho POC")).toBeInTheDocument();
  expect(screen.getByText(/Membro correto/)).toBeInTheDocument();
  expect(screen.queryByText(/Membro de outro conselho/)).not.toBeInTheDocument();
  expect(screen.queryByText("Outro conselho")).not.toBeInTheDocument();
  expect(screen.getByRole("link",{name:"Página deste conselho"})).toHaveAttribute("href","/transparencia/conselhos?registro=c1");
 });
 it("vincula à página COVID somente registros classificados na origem",()=>{
  render(<CovidDetalhado/>);
  expect(screen.getByText("POC-COVID")).toBeInTheDocument();
  expect(screen.queryByText("NAO-COVID")).not.toBeInTheDocument();
 });
 it("alerta prazos de frota, mas ignora veículo baixado",()=>{
  const p=avaliarPendencias({veiculos:[{id:"v1",placa:"POC",seguro_vencimento:"2026-01-01",ipva_vencimento:"2026-01-01",manutencao_prevista:"2026-01-01"},{id:"v2",situacao:"Baixado",seguro_vencimento:"2026-01-01"}]},"2026-10-23");
  expect(p.filter(x=>x.gravidade==="alta")).toHaveLength(3);
  expect(p.some(x=>x.id==="v2"&&x.problema.includes("vencido"))).toBe(false);
 });
 it("não aprova medição nem classifica máquina de obra automaticamente",()=>{
  expect(initialValues(getModule("obra-medicoes")!).aprovada).toBe(false);
  expect(initialValues(getModule("veiculos")!).maquina_obra).toBe(false);
 });
});
