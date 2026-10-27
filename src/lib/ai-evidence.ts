export interface EvidenceInput { criterio: string; texto: string; link: string; coleta?: 'lida'|'fonte_nao_configurada'|'falha_leitura'|'conteudo_vazio'; detalhe?: string | undefined }
export interface EvidenceResult extends EvidenceInput { similaridade: number; sinal: 'indicio_textual'|'evidencia_nao_localizada'|'revisao_necessaria' }
export type EmbedTexts = (texts: string[]) => Promise<number[][]>;
export async function comparePublicEvidence(cases: EvidenceInput[], embed: EmbedTexts): Promise<EvidenceResult[]> {
  if (!cases.length) throw new Error('Não há critérios para comparar.');
  const cache=new Map<string,number[][]>();
  for (const c of cases) if (!cache.has(c.texto)) {
    const chunks=(c.texto.match(/[\s\S]{1,700}/g)??[]).slice(0,24);
    if (!chunks.length) {cache.set(c.texto,[]);continue;}
    const vectors:number[][]=[];
    for(let i=0;i<chunks.length;i+=8) vectors.push(...await embed(chunks.slice(i,i+8)));
    cache.set(c.texto,vectors);
  }
  const queries:number[][]=[];
  for(let i=0;i<cases.length;i+=8) queries.push(...await embed(cases.slice(i,i+8).map(c=>c.criterio)));
  if (queries.length!==cases.length) throw new Error('Inferência retornou critérios incompletos.');
  return cases.map((c,i)=>{
    const query=queries[i]!;
    const scores=(cache.get(c.texto)??[]).map(v=>{
      if(v.length!==query.length||!v.length||v.some(n=>!Number.isFinite(n))||query.some(n=>!Number.isFinite(n))) throw new Error('Vetor neural inválido.');
      const norm=Math.sqrt(v.reduce((s,n)=>s+n*n,0)*query.reduce((s,n)=>s+n*n,0));
      return norm ? v.reduce((s,n,k)=>s+n*query[k]!,0)/norm : 0;
    });
    const score=scores.length?Math.max(...scores):0;
    return {...c,similaridade:score,sinal:c.coleta && c.coleta!=='lida'?'revisao_necessaria':score>=0.5?'indicio_textual':'evidencia_nao_localizada'};
  });
}
