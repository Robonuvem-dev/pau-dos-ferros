import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  itens: z.array(z.object({ id: z.string().max(4), dimensao: z.string().max(80), descricao: z.string().max(200), status: z.string().max(20) })).max(100),
  pendencias: z.array(z.string().max(300)).max(50),
});

export const gerarAnexoAtricon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!staff) throw new Error("Acesso restrito à equipe do portal.");
    const { gerarTexto } = await import("./ai.server");
    const falhas = data.itens.filter((i) => i.status !== "atende");
    const prompt = [
      "Município: Aurora das Veredas. Avaliação do portal pelos 88 pontos da matriz ATRICON.",
      `Total atendido: ${data.itens.length - falhas.length} de ${data.itens.length}.`,
      "Itens pendentes ou em portal de terceiro:",
      ...falhas.map((i) => `- [${i.id}] ${i.dimensao}: ${i.descricao} (${i.status})`),
      "Pendências fiscais detectadas na varredura:",
      ...(data.pendencias.length ? data.pendencias.map((p) => `- ${p}`) : ["- Nenhuma"]),
    ].join("\n");
    const texto = await gerarTexto(
      "Você é auditor de transparência pública municipal no Brasil. Escreva em português formal um ANEXO TÉCNICO de adequação, em texto simples com títulos numerados (sem tabelas markdown). Para cada item pendente: o que a legislação exige (LAI, LC 131/2009, LRF, Lei 14.133/2021, LGPD), a solução proposta no portal e o caminho técnico passo a passo (qual cadastro preencher, documento a publicar, setor responsável). Termine com um cronograma sugerido de 30/60/90 dias. Seja objetivo.",
      prompt,
    );
    return { texto };
  });
