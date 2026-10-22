import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function friendly(error: unknown): Error {
  const status = (error as { statusCode?: number })?.statusCode;
  if (status === 402) return new Error("Os créditos de IA acabaram. Adicione créditos ao workspace para continuar.");
  if (status === 429) return new Error("Muitas solicitações à IA agora. Aguarde um minuto e tente novamente.");
  if (status === 403) return new Error("O uso de IA está bloqueado para este workspace.");
  return new Error("Não foi possível gerar o documento com IA agora.");
}

/** Gera texto pela IA, consumindo a resposta em streaming no servidor. */
export async function gerarTexto(instructions: string, prompt: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("A IA não está configurada.");
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions,
    messages: [{ role: "user", content: prompt }],
    onError: ({ error }) => { failure = error; },
    providerOptions: {
      openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
    },
  });
  let text = "";
  try { text = await result.text; } catch (e) { failure ??= e; }
  if (failure || !text.trim()) { console.error("AI error", failure); throw friendly(failure); }
  return text;
}
