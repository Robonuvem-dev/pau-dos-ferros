import { createFileRoute } from '@tanstack/react-router';
import { readPublicModule, registerPublicNewsView } from '@/lib/public.functions';
import { handleNativeNewsView } from '@/lib/native-news';
export const Route = createFileRoute('/api/noticias')({
  server: { handlers: {
    POST: async ({request}) => handleNativeNewsView(request,slug=>registerPublicNewsView({data:{slug}})),
    GET: async () => {
      try {
        const rows = await readPublicModule({ data: { key: 'noticias' } });
        return Response.json({ noticias: rows.map(n => ({ id:n.id,titulo:n.titulo,slug:n.slug,resumo:n.resumo,conteudo:n.conteudo,publicado_em:n.publicado_em })) }, { headers: { 'Cache-Control':'no-store' } });
      } catch { return Response.json({error:'Não foi possível carregar as notícias.'},{status:503}); }
    },
  } },
});
