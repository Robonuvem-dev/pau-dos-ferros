import { describe, expect, it } from 'vitest';
import { resolvePublicRelation, reversePublicRelations } from '@/lib/public-relations';
import { getModule } from '@/lib/modules';
import { filterPublicRows } from '@/lib/transparency-filters';

describe('Navegação entre dados da transparência', () => {
  it('resolve órgão pela sigla com acentos e espaços normalizados', () => {
    expect(resolvePublicRelation({name:'orgao',label:'Órgão',ref:{module:'secretarias',column:'nome'}},' semsa ',[{id:'saude',nome:'Secretaria de Saúde',sigla:'SEMSA'}])?.search).toEqual({registro:'saude'});
  });
  it('não escolhe arbitrariamente um credor com nome duplicado', () => {
    expect(resolvePublicRelation({name:'credor',label:'Credor',ref:{module:'credores',column:'nome'}},'Fornecedor',[{id:'a',nome:'Fornecedor'},{id:'b',nome:'Fornecedor'}])?.search).toEqual({q:'Fornecedor'});
  });
  it('oferece contratos e despesas a partir do credor', () => {
    const links=reversePublicRelations('credores',{id:'c1',nome:'Fornecedor A'});
    expect(links).toEqual(expect.arrayContaining([expect.objectContaining({module:'contratos',field:'fornecedor',value:'Fornecedor A'}),expect.objectContaining({module:'despesas',field:'credor',value:'Fornecedor A'})]));
  });
  it('o link de contratos por fornecedor retorna apenas seus contratos', () => {
    const mod=getModule('contratos');if(!mod)throw new Error('Módulo ausente');
    expect(filterPublicRows([{id:'1',fornecedor:'Fornecedor A'},{id:'2',fornecedor:'Fornecedor B'}],mod.fields,'',{fornecedor:'Fornecedor A'}).map(r=>r.id)).toEqual(['1']);
  });
});