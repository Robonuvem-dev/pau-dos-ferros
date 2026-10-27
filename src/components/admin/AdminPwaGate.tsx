import { BRASAO_URL } from "@/lib/municipal-brand";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
interface InstallState {
  mobile: boolean;
  ios: boolean;
  standalone: boolean;
  prompt: InstallPrompt | null;
  installed: boolean;
}
const InstallContext = createContext<InstallState | null>(null);

function deviceInstallationState() {
  const nav = navigator as Navigator & {
    standalone?: boolean;
    userAgentData?: { mobile?: boolean };
  };
  const ios =
    /iPad|iPhone|iPod/i.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  return {
    mobile: ios || /Android|Mobile/i.test(nav.userAgent) || nav.userAgentData?.mobile === true,
    ios,
    standalone:
      nav.standalone === true ||
      ["standalone", "fullscreen", "minimal-ui"].some(
        (mode) => window.matchMedia(`(display-mode: ${mode})`).matches,
      ),
  };
}

/** Captura a oferta de instalação também ao navegar primeiro pelo portal público. */
export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InstallState | null>(null);
  useEffect(() => {
    const update = () =>
      setState((s) => ({
        prompt: s?.prompt ?? null,
        installed: s?.installed ?? false,
        ...deviceInstallationState(),
      }));
    const offer = (event: Event) => {
      event.preventDefault();
      setState((s) => ({
        installed: s?.installed ?? false,
        ...deviceInstallationState(),
        prompt: event as InstallPrompt,
      }));
    };
    const installed = () =>
      setState({ ...deviceInstallationState(), prompt: null, installed: true });
    const queries = ["standalone", "fullscreen", "minimal-ui"].map((mode) =>
      window.matchMedia(`(display-mode: ${mode})`),
    );
    update();
    window.addEventListener("beforeinstallprompt", offer);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("pageshow", update);
    queries.forEach((q) => q.addEventListener("change", update));
    return () => {
      window.removeEventListener("beforeinstallprompt", offer);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("pageshow", update);
      queries.forEach((q) => q.removeEventListener("change", update));
    };
  }, []);
  return <InstallContext.Provider value={state}>{children}</InstallContext.Provider>;
}

export function AdminPwaGate({ children }: { children: ReactNode }) {
  const state = useContext(InstallContext);
  const [instructions, setInstructions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [usedPrompt, setUsedPrompt] = useState<InstallPrompt | null>(null);
  if (!state)
    return (
      <p className="px-4 py-10" role="status">
        Verificando acesso ao painel...
      </p>
    );
  if (!state.mobile || state.standalone) return <>{children}</>;
  const available = state.prompt && state.prompt !== usedPrompt;
  const install = async () => {
    if (state.ios || !available) {
      setInstructions(true);
      return;
    }
    const prompt = state.prompt!;
    setUsedPrompt(prompt);
    setBusy(true);
    setMessage("");
    try {
      // A chamada permanece no gesto do usuário exigido pelo navegador.
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setMessage(
        choice.outcome === "accepted"
          ? "Abra Aurora das Veredas pelo ícone na tela inicial para acessar o painel."
          : "Instalação cancelada. Para acessar o painel, instale e abra o aplicativo pela tela inicial.",
      );
      setInstructions(true);
    } catch {
      setMessage("O navegador não abriu a instalação. Siga as instruções abaixo.");
      setInstructions(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-labelledby="instalar-painel"
      className="mx-auto my-10 max-w-lg rounded-lg border bg-card p-6 shadow-sm"
    >
      <img src={BRASAO_URL} alt="" className="mb-4 size-16" />
      <h1 id="instalar-painel" className="font-display text-2xl font-bold">
        Instale o aplicativo para acessar o painel
      </h1>
      <p className="my-4">
        No celular, o painel administrativo está disponível pelo aplicativo instalado na Tela de
        Início.
      </p>
      {state.installed ? (
        <p role="status">
          Aplicativo instalado. Feche esta aba e abra Aurora das Veredas pelo ícone na Tela de Início.
        </p>
      ) : (
        <Button className="w-full" disabled={busy} onClick={() => void install()}>
          {busy
            ? "Aguardando navegador..."
            : state.ios
              ? "Adicionar à Tela de Início"
              : available
                ? "Instalar aplicativo"
                : "Como instalar o aplicativo"}
        </Button>
      )}
      {message && (
        <p role="status" className="mt-4">
          {message}
        </p>
      )}
      {(instructions || state.ios) && (
        <div className="mt-5 space-y-3">
          {state.ios ? (
            <>
              <h2 className="font-semibold">No iPhone ou iPad</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>Abra esta página no Safari.</li>
                <li>Toque em Compartilhar (quadrado com seta para cima).</li>
                <li>Escolha “Adicionar à Tela de Início” e confirme em “Adicionar”.</li>
                <li>Abra Aurora das Veredas pelo ícone criado e entre na sua conta.</li>
              </ol>
            </>
          ) : (
            <>
              <h2 className="font-semibold">No Android</h2>
              <ol className="list-inside list-decimal space-y-2">
                <li>Abra esta página no Chrome.</li>
                <li>
                  No menu ⋮, escolha “Instalar aplicativo” ou “Adicionar à tela inicial” e confirme
                  a instalação.
                </li>
                <li>Abra Aurora das Veredas pelo ícone criado e entre na sua conta.</li>
              </ol>
            </>
          )}
        </div>
      )}
    </section>
  );
}
