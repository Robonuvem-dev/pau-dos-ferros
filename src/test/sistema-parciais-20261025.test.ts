import { describe, expect, it } from 'vitest';
import { collectPages } from '../lib/pagination';
import { getModule, MODULES } from '../lib/modules';
import { validateRecord } from '../lib/record-validation';
import { initialValues } from '../lib/normalization';
import { LICITACAO_MODALIDADES } from '../lib/catalogos';
import { filtrarConvenios } from '../lib/convenios/relatorios';
import { needsVersionReload } from '../lib/remote-version';
import { avaliarPendencias } from '../lib/criticas';
import { prepararLeiauteExterno } from '../lib/importacao-mapeamento';

describe('Lacunas dos itens parciais — caminhos efetivamente usados pela aplicação', () => {
  it('preserva 1.203 registros, inclusive a última página, sem limitar em mil', async () => {
    const records=Array.from({length:1203},(_,id)=>({id}));const calls:number[]=[];
    const result=await collectPages(async(from,to)=>{calls.push(from);return {data:records.slice(from,to+1),error:null};});
    expect(result).toEqual(records);expect(calls).toEqual([0,500,1000]);
  });
  it('não entrega um relatório truncado silenciosamente se a segunda página falha', async()=>{
    await expect(collectPages(async from=>from===0?{data:Array(500).fill(1),error:null}:{data:null,error:{message:'falha de página'}})).rejects.toThrow('falha de página');
  });
  it('não recarrega continuamente com manifesto inválido ou versão já tentada',()=>{
    expect(needsVersionReload('1.3.0',{version:'1.4.0'},null)).toBe(true);
    expect(needsVersionReload('1.3.0',{version:'1.3.0'},null)).toBe(false);
    expect(needsVersionReload('1.3.0',{version:'1.4.0'},'1.4.0')).toBe(false);
    expect(needsVersionReload('1.3.0',{version:3},null)).toBe(false);
  });
  it.each(['obras','veiculos','conselhos'])('rejeita cadastro incompleto de %s no caminho de gravação',key=>{
    const mod=getModule(key)!;expect(()=>validateRecord(mod,{nome:'Teste',placa:'AVR-0001',modelo:'Teste'})).toThrow('Preencha');
  });
  it('aceita zero e falso como valores preenchidos, mas exige baixa para veículo baixado',()=>{
    const mod=getModule('veiculos')!;const row={...Object.fromEntries(mod.fields.filter(f=>f.required).map(f=>[f.name,'Teste'])),ano:2026,maquina_obra:false,situacao:'Ativo'};
    expect(()=>validateRecord(mod,row)).not.toThrow();
    expect(()=>validateRecord(mod,{...row,situacao:'Baixado'})).toThrow('data de baixa');
    expect(initialValues(getModule('obras')!).aditivo_acrescimo).toBe(0);
  });
  it('exige origem por identificador em aditivo e carona',()=>{
    const mod=getModule('contratos')!;const base={numero:'Teste',fornecedor:'Fornecedor',objeto:'Objeto',tipo:'Aditivo'};
    expect(()=>validateRecord(mod,base)).toThrow('origem');
    expect(()=>validateRecord(mod,{...base,contrato_origem_id:'00000000-0000-4000-8000-000000000001'})).not.toThrow();
  });
  it('mantém todas as modalidades do cadastro selecionáveis no catálogo usado pelo relatório',()=>{
    expect(getModule('licitacoes')!.fields.find(f=>f.name==='modalidade')!.options).toBe(LICITACAO_MODALIDADES);
    expect(LICITACAO_MODALIDADES).toEqual(expect.arrayContaining(['Dispensa','Inexigibilidade','Diálogo Competitivo']));
  });
  it('filtra vigência, conclusão e interseção de períodos sem contar convênio vencido',()=>{
    const rows=[{id:1,data_inicio:'2026-01-01',data_fim:'2026-12-31',situacao:'Em execução'},{id:2,data_inicio:'2025-01-01',data_fim:'2025-12-31',situacao:'Em execução'},{id:3,data_inicio:'2026-01-01',data_fim:'2026-12-31',situacao:'Concluído'}];
    expect(filtrarConvenios(rows,{vigentes:true,referencia:'2026-10-25',de:'',ate:''}).map(r=>r.id)).toEqual([1]);
    expect(filtrarConvenios(rows,{vigentes:false,referencia:'2026-10-25',de:'2025-02-01',ate:'2025-03-01'}).map(r=>r.id)).toEqual([2]);
  });
  it('ART vinculada suprime a crítica indevida do campo legado vazio',()=>{
    const work={id:'obra',nome:'Teste',art:null};
    expect(avaliarPendencias({obras:[work],'obra-arts':[{id:'art',obra_id:'obra',numero:'ART fictícia'}]}).some(p=>p.problema==='Obra sem ART')).toBe(false);
    expect(avaliarPendencias({obras:[work],'obra-arts':[]}).some(p=>p.problema==='Obra sem ART')).toBe(true);
  });
  it('converte dois leiautes externos distintos para a mesma folha e preserva valores',()=>{
    const first=prepararLeiauteExterno('servidores','Pessoa;Referencia;Codigo;Salario\nPessoa ficticia;2026-10;A1;1500,50',{nome:'Pessoa',competencia:'Referencia',chave_externa:'Codigo',remuneracao:'Salario'});
    const second=prepararLeiauteExterno('servidores','worker;month;key;amount\nPessoa ficticia;2026-10;A1;1500.50',{nome:'worker',competencia:'month',chave_externa:'key',remuneracao:'amount'});
    expect(first).toEqual(second);expect(first[0]?.remuneracao).toBe(1500.5);
  });
  it('recusa correspondências que eliminam chave obrigatória ou apontam campo não permitido',()=>{
    expect(()=>prepararLeiauteExterno('servidores','Pessoa\nTeste',{nome:'Pessoa'})).toThrow('obrigatórias');
    expect(()=>prepararLeiauteExterno('servidores','Pessoa\nTeste',{role:'Pessoa'})).toThrow('não permitida');
  });
  it('não oferece criação/exclusão no atendimento privado de solicitações',()=>{
    const mod=getModule('servico-solicitacoes')!;expect(mod.publico).toBe(false);expect(mod.allowCreate).toBe(false);expect(mod.allowDelete).toBe(false);
    expect(MODULES.find(m=>m.key==='convenio-aplicacoes')?.permissionTable).toBe('convenios');
  });
});
