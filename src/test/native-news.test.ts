import {describe,it,expect,vi} from 'vitest';
import {handleNativeNewsView} from '../lib/native-news';
const req=(body:string,headers:Record<string,string>={'content-type':'application/json'})=>new Request('https://portal.example.invalid/api/noticias',{method:'POST',headers,body});
describe('Leitura de notícias nativas e estatísticas',()=>{
 it('registra a leitura confirmada pelo verificador de publicação',async()=>{
  const visit=vi.fn().mockResolvedValue(true);const response=await handleNativeNewsView(req('{"slug":"noticia-ficticia"}'),visit);
  expect(response.status).toBe(200);expect(visit).toHaveBeenCalledWith('noticia-ficticia');
 });
 it('não contabiliza notícia não publicada ou agendada',async()=>{
  const response=await handleNativeNewsView(req('{"slug":"rascunho"}'),vi.fn().mockResolvedValue(false));expect(response.status).toBe(404);
 });
 it('recusa acesso de outra origem e corpo excessivo antes da gravação',async()=>{
  const visit=vi.fn();expect((await handleNativeNewsView(req('{"slug":"x"}',{'content-type':'application/json',origin:'https://outro.example.invalid'}),visit)).status).toBe(403);
  expect((await handleNativeNewsView(req('x'.repeat(2048)),visit)).status).toBe(413);expect(visit).not.toHaveBeenCalled();
 });
 it('não oculta falha do contador como sucesso',async()=>{
  expect((await handleNativeNewsView(req('{"slug":"teste"}'),vi.fn().mockRejectedValue(new Error('Falha')))).status).toBe(503);
 });
});
