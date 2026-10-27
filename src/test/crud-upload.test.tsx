import { afterEach,describe,it,expect,vi } from "vitest";
import { cleanup,fireEvent,render,screen,waitFor } from "@testing-library/react";
import { CrudModule } from "@/components/admin/CrudModule";
const mocks=vi.hoisted(()=>({upload:vi.fn(),save:vi.fn(),invalidate:vi.fn()}));
vi.mock("@/lib/data",()=>({uploadFile:mocks.upload,saveRow:mocks.save,deleteRow:vi.fn()}));
vi.mock("@/lib/admin-queries",()=>({adminModuleQuery:()=>({queryKey:["admin-module","teste"]})}));
vi.mock("@tanstack/react-query",()=>({useSuspenseQuery:()=>({data:[]}),useQueryClient:()=>({invalidateQueries:mocks.invalidate}),useQuery:()=>({data:[]})}));
vi.mock("@/components/admin/ImportarArquivo",()=>({ImportarArquivo:()=>null}));
vi.mock("@/components/transparencia/ResumoFiscal",()=>({ResumoFiscal:()=>null}));
vi.mock("@/components/transparencia/ResumoPessoal",()=>({ResumoPessoal:()=>null}));
vi.mock("@/components/convenios/ResumoConvenios",()=>({ResumoConvenios:()=>null}));
afterEach(()=>{cleanup();vi.clearAllMocks()});
describe("Envio de arquivo no formulário",()=>{
 it("impede salvar até o arquivo terminar de enviar",async()=>{
  let concluir!:(url:string)=>void;
  mocks.upload.mockImplementation(()=>new Promise<string>(resolve=>{concluir=resolve}));
  render(<CrudModule mod={{key:"teste",table:"teste",label:"Teste",grupo:"Site Oficial",descricao:"",fields:[{name:"arquivo_url",label:"Arquivo",type:"file"}]}} startNew/>);
  const input=document.querySelector('input[type="file"]')!;
  fireEvent.change(input,{target:{files:[new File(["AVR"],"poc.pdf",{type:"application/pdf"})]}});
  expect(screen.getByRole("button",{name:"Aguarde os arquivos..."})).toBeDisabled();
  expect(mocks.save).not.toHaveBeenCalled();
  concluir("https://example.invalid/poc.pdf");
  await waitFor(()=>expect(screen.getByRole("button",{name:"Salvar"})).toBeEnabled());
  fireEvent.click(screen.getByRole("button",{name:"Salvar"}));
  await waitFor(()=>expect(mocks.save).toHaveBeenCalledWith(expect.anything(),{arquivo_url:"https://example.invalid/poc.pdf"},undefined));
 });
});
