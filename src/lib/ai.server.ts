/** IA local e opcional. Nenhuma chamada ao Lovable ou provedor pago. */
export async function gerarTexto(instructions: string, prompt: string): Promise<string> {
  const base = process.env["LOCAL_AI_BASE_URL"];
  const model = process.env["LOCAL_AI_MODEL"];
  if (!base || !model?.trim()) {
    throw new Error("IA local indisponível. Configure LOCAL_AI_BASE_URL e LOCAL_AI_MODEL no servidor.");
  }
  let url: URL;
  try { url = new URL(base); } catch { throw new Error("Endereço da IA local inválido."); }
  if (!["http:", "https:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.username || url.password || url.search || url.hash) {
    throw new Error("O sistema utiliza somente IA em loopback local, sem serviços pagos.");
  }
  url.pathname = url.pathname.replace(/\/$/, "") + "/chat/completions";
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(45_000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.trim(),
        stream: false,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: prompt },
        ],
      }),
    });
  } catch {
    throw new Error("Não foi possível acessar a IA local. Verifique o serviço no servidor.");
  }
  if (!response.ok) throw new Error("A IA local não conseguiu gerar o documento.");
  const result = await response.json() as { choices?: { message?: { content?: unknown } }[] };
  const texto = result.choices?.[0]?.message?.content;
  if (typeof texto !== "string" || !texto.trim()) throw new Error("A IA local retornou um documento vazio.");
  return texto;
}
