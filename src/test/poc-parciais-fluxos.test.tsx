import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SolicitarServico } from '../components/site/SolicitarServico';
import { saveRow } from '../lib/data';
import { getModule } from '../lib/modules';
import { comparePublicEvidence } from '../lib/ai-evidence';
import { readFiscalEvidence } from '../lib/public-scan';
const mocks=vi.hoisted(()=>({rpc:vi.fn(),from:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:mocks}));
afterEach(()=>{cleanup();vi.clearAllMocks();});
describe('Persistência e fluxos dos itens parciais',()=>{
 it('salvar convênio usa uma única RPC com a parcela, sem gravação parcial pelo CRUD',async()=>{
  mocks.rpc.mockResolvedValue({data:'uuid',error:null});
  await saveRow(getModule('convenios')!,{numero:'POC',concedente:'POC',convenente:'POC',responsavel_concedente:'POC',responsavel_convenente:'POC',objeto:'Fictício',valor_global:1000,_parcela_valor:'200,50',_parcela_vencimento:'2026-12-30'});
  expect(mocks.rpc).toHaveBeenCalledOnce();
  expect(mocks.rpc).toHaveBeenCalledWith('salvar_cadastro_composto',expect.objectContaining({_modulo:'convenios',_complementos:{parcela:{valor:200.5,vencimento:'2026-12-30'}}}));
  expect(mocks.from).not.toHaveBeenCalled();
 });
 it('erro da transação do plano é exibível e não cai em uma gravação alternativa',async()=>{
  mocks.rpc.mockResolvedValue({error:{message:'Componentes incompletos'}});
  await expect(saveRow(getModule('plano-diretor')!,{nome:'Plano fictício',_fase:'Fase'})).rejects.toThrow('Componentes incompletos');
  expect(mocks.from).not.toHaveBeenCalled();
 });
 it('cidadão envia uma solicitação real pela RPC e recebe o protocolo retornado',async()=>{
  mocks.rpc.mockResolvedValue({data:'CS-TESTE-RETORNADO-PELO-BANCO',error:null});
  render(<QueryClientProvider client={new QueryClient()}><SolicitarServico id="servico-uuid" /></QueryClientProvider>);
  fireEvent.change(screen.getByLabelText('Nome'),{target:{value:'Pessoa fictícia'}});
  fireEvent.change(screen.getByLabelText('E-mail para contato'),{target:{value:'pessoa@poc.invalid'}});
  fireEvent.change(screen.getByLabelText('Descreva sua solicitação'),{target:{value:'Mensagem fictícia para atendimento'}});
  fireEvent.submit(screen.getByRole('button',{name:'Enviar solicitação',hidden:true}).closest('form')!);
  await waitFor(()=>expect(screen.getByText('CS-TESTE-RETORNADO-PELO-BANCO')).toBeInTheDocument());
  expect(mocks.rpc).toHaveBeenCalledWith('solicitar_servico',{_servico:'servico-uuid',_nome:'Pessoa fictícia',_email:'pessoa@poc.invalid',_mensagem:'Mensagem fictícia para atendimento'});
 });
 it('falha de gravação não produz protocolo falso',async()=>{
  mocks.rpc.mockResolvedValue({error:{message:'falha'}});
  render(<QueryClientProvider client={new QueryClient()}><SolicitarServico id="servico" /></QueryClientProvider>);
  fireEvent.submit(screen.getByRole('button',{name:'Enviar solicitação',hidden:true}).closest('form')!);
  await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível registrar'));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
 });
 it('leitor da IA consulta conteúdo fiscal público e elimina scripts do material analisado',async()=>{
  const read=vi.fn().mockImplementation(async()=>new Response('<header>menu</header><main>Receita prevista e arrecadada <script>SEGREDO_INJETADO</script> Dados fiscais públicos</main>'));
  const cases=await readFiscalEvidence(read);
  expect(cases.length).toBeGreaterThan(20);expect(cases.every(c=>!c.texto.includes('SEGREDO_INJETADO'))).toBe(true);
  expect(read.mock.calls.every(([url])=>String(url).startsWith('/transparencia/'))).toBe(true);
 });
 it('varredura interrompe em vez de aprovar quando a página fiscal falha',async()=>{
  await expect(readFiscalEvidence(vi.fn().mockResolvedValue(new Response('Erro',{status:503})))).rejects.toThrow('indisponível');
 });
 it('compara evidência neural, reutiliza vetores da página e não aprova juridicamente por similaridade',async()=>{
  const embed=vi.fn(async(texts:string[])=>texts.map(t=>t.includes('Receita')?[1,0]:[0,1]));
  const out=await comparePublicEvidence([{criterio:'Receita prevista',texto:'Receita arrecadada',link:'/receitas'},{criterio:'Pessoal',texto:'Receita arrecadada',link:'/receitas'}],embed);
  expect(out.map(x=>x.sinal)).toEqual(['indicio_textual','evidencia_nao_localizada']);
  expect(out[0]).not.toHaveProperty('status');expect(embed).toHaveBeenCalledTimes(2);
 });
});
