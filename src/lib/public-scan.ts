import { CRITERIOS, type Criterio } from './atricon';
import type { EvidenceInput } from './ai-evidence';
function rotaDoCriterio(c: Criterio): string | null {
  if (!c.fonte) return null;
  if (c.fonte === 'agentes-politicos') return '/prefeitura';
  if (c.fonte !== 'portal') return c.fonte === 'servicos' ? '/servicos' : '/transparencia/' + c.fonte;
  if (c.dimensao === 'Transparência passiva' || c.dimensao === 'Ouvidoria' || c.descricao.includes('FAQ')) return '/esic';
  if (c.dimensao === 'LGPD e governo digital') return '/lgpd';
  if (c.descricao.includes('portal da transparência próprio') || c.descricao.includes('CSV/JSON')) return '/transparencia';
  return '/';
}

/** Todos os 88 pontos; falha de coleta não se transforma em aprovação. */
export async function readFiscalEvidence(read: typeof fetch = fetch): Promise<EvidenceInput[]> {
  const rotas = [...new Set(CRITERIOS.map(rotaDoCriterio).filter((p): p is string => p !== null))];
  const pages = new Map<string, Pick<EvidenceInput, 'texto'|'coleta'|'detalhe'>>();
  for (let i = 0; i < rotas.length; i += 3) await Promise.all(rotas.slice(i, i + 3).map(async rota => {
    try {
      const response = await read(rota, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();
      const dom = new DOMParser().parseFromString(html, 'text/html');
      dom.querySelectorAll('script,style,noscript,header,footer,nav').forEach(n => n.remove());
      const text = (dom.querySelector('main') ?? dom.body).textContent?.replace(/\s+/g, ' ').trim() ?? '';
      pages.set(rota, { texto: text.slice(0, 16_800), coleta: text ? 'lida' : 'conteudo_vazio', detalhe: text.length > 16_800 ? 'Texto limitado a 16.800 caracteres; conferir conteúdo integral.' : undefined });
    } catch {
      pages.set(rota, { texto: '', coleta: 'falha_leitura', detalhe: 'Não foi possível ler esta página; conferir sua disponibilidade e repetir a coleta.' });
    }
  }));
  return CRITERIOS.map(c => {
    const rota = rotaDoCriterio(c);
    return { criterio: `[${c.id}] ${c.descricao}`, link: rota ? window.location.origin + rota : '', ...(rota ? pages.get(rota)! : { texto: '', coleta: 'fonte_nao_configurada' as const, detalhe: 'Definir fonte específica e registrar evidência individual; não foi atribuída página genérica como prova.' }) };
  });
}
