import { describe, it, expect } from 'vitest';
import { BANNER_INTERVAL_MS, nextBanner } from '@/lib/banner-navigation';
import { filterPublicRows } from '@/lib/transparency-filters';
import { getModule } from '@/lib/modules';
import { temaCss } from '@/lib/temas';
import { normalizeValues } from '@/lib/data';

describe('Ajustes M01–M05', () => {
  it('avança banners a cada cinco segundos', () => { expect(BANNER_INTERVAL_MS).toBe(5000); expect(nextBanner(2, 3)).toBe(0); expect(nextBanner(0, 3, -1)).toBe(2); });
  it('aplica a cor de fundo escolhida e rejeita valores inválidos', () => { expect(temaCss({cor_fundo:'#123456'})).toContain('--background:#123456'); expect(temaCss({cor_fundo:'red;}'})).toBe(''); });
  it('combina modalidade, situação e órgão sem incluir outro processo', () => {
    const mod = getModule('licitacoes'); if (!mod) throw new Error('Módulo ausente');
    expect(filterPublicRows([{id:'1',modalidade:'Pregão Eletrônico',situacao:'Aberto',secretaria:'Saúde'}, {id:'2',modalidade:'Dispensa',situacao:'Aberto',secretaria:'Saúde'}, {id:'3',modalidade:'Pregão Eletrônico',situacao:'Suspensa',secretaria:'Saúde'}],mod.fields,'',{modalidade:'Pregão Eletrônico',situacao:'Aberto',secretaria:'Saúde'}).map(r=>r.id)).toEqual(['1']);
  });
  it('filtra registro relacionado por identificador, não apenas texto', () => { expect(filterPublicRows([{id:'1',nome:'Mesmo nome'}, {id:'2',nome:'Mesmo nome'}],[{name:'nome',label:'Nome'}],'',{},'2').map(r=>r.id)).toEqual(['2']); });
  it('preserva metas e especificações técnicas no cadastro do convênio', () => { const mod=getModule('convenios'); if(!mod)throw new Error('Módulo ausente'); const result=normalizeValues(mod,{metas:'Construir duas salas',especificacoes_tecnicas:'Área de 60 m²'});expect(result.metas).toBe('Construir duas salas');expect(result.especificacoes_tecnicas).toBe('Área de 60 m²'); });
});