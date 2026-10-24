import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gerarTexto } from "../lib/ai.server";

describe("M14 — IA sem consumo Lovable", () => {
  const request = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("fetch", request);
    request.mockReset();
    vi.stubEnv("POC_AI_BASE_URL", "");
    vi.stubEnv("POC_AI_MODEL", "");
    vi.stubEnv("LOVABLE_API_KEY", "nao-utilizar");
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it("sem configuracao nao chama servico algum", async () => {
    await expect(gerarTexto("Instrucoes", "Dados ficticios")).rejects.toThrow("IA local indisponível");
    expect(request).not.toHaveBeenCalled();
  });
  it.each(["https://ai.gateway.lovable.dev/v1", "https://api.openai.com/v1", "file:///tmp/model", "http://localhost@exemplo.invalid/v1"])("bloqueia endpoint externo %s", async (base) => {
    vi.stubEnv("POC_AI_BASE_URL", base);
    vi.stubEnv("POC_AI_MODEL", "modelo-local");
    await expect(gerarTexto("Instrucoes", "Dados ficticios")).rejects.toThrow("somente IA");
    expect(request).not.toHaveBeenCalled();
  });
  it("usa apenas endpoint local, sem token Lovable e sem seguir redirecionamentos", async () => {
    vi.stubEnv("POC_AI_BASE_URL", "http://127.0.0.1:11434/v1/");
    vi.stubEnv("POC_AI_MODEL", "modelo-local");
    request.mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: "Anexo de teste" } }] }) });
    expect(await gerarTexto("Instrucoes", "Dados ficticios")).toBe("Anexo de teste");
    const [url, options] = request.mock.calls[0]!;
    expect(String(url)).toBe("http://127.0.0.1:11434/v1/chat/completions");
    expect(options.redirect).toBe("error");
    expect(options.headers).not.toHaveProperty("Authorization");
    expect(JSON.stringify(options)).not.toContain("nao-utilizar");
  });
  it("nao apresenta resposta vazia como sucesso", async () => {
    vi.stubEnv("POC_AI_BASE_URL", "http://localhost:11434/v1");
    vi.stubEnv("POC_AI_MODEL", "modelo-local");
    request.mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) });
    await expect(gerarTexto("Instrucoes", "Dados ficticios")).rejects.toThrow("vazio");
  });
  it("falha de conexao permanece indisponivel, sem simular IA", async () => {
    vi.stubEnv("POC_AI_BASE_URL", "http://localhost:11434/v1");
    vi.stubEnv("POC_AI_MODEL", "modelo-local");
    request.mockRejectedValue(new Error("connection refused"));
    await expect(gerarTexto("Instrucoes", "Dados ficticios")).rejects.toThrow("acessar a IA local");
  });
});
