import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminPwaGate, PwaInstallProvider } from "@/components/admin/AdminPwaGate";
import { readFileSync } from "node:fs";

let standalone = false;
let listeners: (() => void)[];
beforeEach(() => {
  standalone = false;
  listeners = [];
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        get matches() {
          return standalone && query === "(display-mode: standalone)";
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, fn: () => void) => {
          listeners.push(fn);
        },
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
    "Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile",
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "maxTouchPoints");
  Reflect.deleteProperty(navigator, "standalone");
});
function boot() {
  render(
    <PwaInstallProvider>
      <AdminPwaGate>
        <h1>Conteúdo administrativo</h1>
      </AdminPwaGate>
    </PwaInstallProvider>,
  );
}
function offer(outcome: "accepted" | "dismissed" = "accepted") {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = new Event("beforeinstallprompt", { cancelable: true });
  Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome }) });
  fireEvent(window, event);
  return { prompt, event };
}
it("bloqueia o navegador Android e abre o prompt somente pelo clique", async () => {
  boot();
  expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
  const { prompt, event } = offer();
  expect(event.defaultPrevented).toBe(true);
  expect(prompt).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Instalar aplicativo" }));
  await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
  expect(
    await screen.findByText(/Abra Pau dos Ferros pelo ícone na tela inicial/),
  ).toBeInTheDocument();
  expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
});
it("não libera a aba do navegador após appinstalled; libera ao abrir em standalone", async () => {
  boot();
  fireEvent(window, new Event("appinstalled"));
  expect(screen.getByText(/Feche esta aba/)).toBeInTheDocument();
  expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
  standalone = true;
  fireEvent(window, new Event("pageshow"));
  expect(await screen.findByText("Conteúdo administrativo")).toBeInTheDocument();
});
it("permite o PWA instalado e o navegador desktop, inclusive em janela estreita", () => {
  standalone = true;
  boot();
  expect(screen.getByText("Conteúdo administrativo")).toBeInTheDocument();
  cleanup();
  standalone = false;
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
    "Mozilla/5.0 (Windows NT 10.0) Chrome/130",
  );
  boot();
  expect(screen.getByText("Conteúdo administrativo")).toBeInTheDocument();
});
it("orienta instalação no Safari do iPhone", () => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone) Safari/605");
  boot();
  fireEvent.click(screen.getByRole("button", { name: "Adicionar à Tela de Início" }));
  expect(screen.getByText(/Compartilhar \(quadrado/)).toBeInTheDocument();
  expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
});
it("detecta iPad que se identifica como Mac e permite o modo standalone do iOS", () => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Macintosh) Safari/605");
  vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
  Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, get: () => 5 });
  boot();
  expect(screen.getByRole("button", { name: "Adicionar à Tela de Início" })).toBeInTheDocument();
  Object.defineProperty(navigator, "standalone", { configurable: true, get: () => true });
  fireEvent(window, new Event("pageshow"));
  expect(screen.getByText("Conteúdo administrativo")).toBeInTheDocument();
});
it("permite tentar pelo menu se o usuário cancelar a instalação", async () => {
  boot();
  const { prompt } = offer("dismissed");
  fireEvent.click(screen.getByRole("button", { name: "Instalar aplicativo" }));
  expect(await screen.findByText(/Instalação cancelada/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Como instalar o aplicativo" }));
  expect(prompt).toHaveBeenCalledOnce();
  expect(screen.getByText(/No menu ⋮/)).toBeInTheDocument();
});
it("oferece instruções quando o navegador ainda não fornece o prompt", () => {
  boot();
  fireEvent.click(screen.getByRole("button", { name: "Como instalar o aplicativo" }));
  expect(screen.getByText(/No menu ⋮/)).toBeInTheDocument();
  expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
});
it("usa ícones da favicon em tamanhos instaláveis", () => {
  const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
  expect(manifest.icons.map((i: { src: string }) => i.src)).toEqual([
    "/app-icons/pwa-favicon-192.png",
    "/app-icons/pwa-favicon-512.png",
  ]);
  for (const icon of manifest.icons)
    expect(readFileSync("public" + icon.src).length).toBeGreaterThan(0);
});
