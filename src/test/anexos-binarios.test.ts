import {beforeEach,describe,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({insert:vi.fn(),upload:vi.fn(),sign:vi.fn(),from:vi.fn()}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{from:mocks.from,storage:{from:()=>({upload:mocks.upload,createSignedUrl:mocks.sign})}}}));
import {uploadFile,uploadAvatar} from "@/lib/data";
const file={name:"poc.pdf",size:3,type:"application/pdf",arrayBuffer:async()=>new Uint8Array([0,15,255]).buffer} as File;
beforeEach(()=>{vi.clearAllMocks();mocks.from.mockReturnValue({insert:mocks.insert});mocks.insert.mockResolvedValue({error:null});mocks.upload.mockResolvedValue({error:null});mocks.sign.mockResolvedValue({data:{signedUrl:"https://example.invalid/poc.pdf"},error:null});});
describe("preservação binária dos anexos",()=>{
it("preserva exatamente os bytes no banco antes de publicar o arquivo",async()=>{await expect(uploadFile(file)).resolves.toContain("https://");expect(mocks.from).toHaveBeenCalledWith("arquivos_binarios");expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({conteudo:"\\x000fff"}));expect(mocks.insert.mock.invocationCallOrder[0]??Infinity).toBeLessThan(mocks.upload.mock.invocationCallOrder[0]??-Infinity);});
it("falha de persistência impede disponibilizar cópia sem garantia no banco",async()=>{mocks.insert.mockResolvedValue({error:{message:"negado"}});await expect(uploadFile(file)).rejects.toThrow("preservar");expect(mocks.upload).not.toHaveBeenCalled();expect(mocks.sign).not.toHaveBeenCalled();});
it("não transforma avatar de cidadão em anexo administrativo",async()=>{await uploadAvatar(file,"poc-user");expect(mocks.insert).not.toHaveBeenCalled();expect(mocks.upload).toHaveBeenCalledOnce();});
it("recusa arquivo vazio antes de qualquer gravação",async()=>{await expect(uploadFile({...file,size:0} as File)).rejects.toThrow("1 byte");expect(mocks.insert).not.toHaveBeenCalled();expect(mocks.upload).not.toHaveBeenCalled();});
});
