import { Headphones, Info, Search, Accessibility, Menu, Facebook, Instagram, Youtube, Mail, LogIn } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/hooks/use-session";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/prefeitura", label: "Prefeitura" },
  { to: "/secretarias", label: "Secretarias" },
  { to: "/servicos", label: "Serviços" },
  { to: "/noticias", label: "Notícias" },
  { to: "/transparencia", label: "Transparência" },
  { to: "/transparencia/licitacoes", label: "Licitações" },
  { to: "/transparencia/obras", label: "Obras" },
  { to: "/lgpd", label: "LGPD" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const { isStaff, user } = useSession();

  const toggleFont = () => {
    const el = document.documentElement;
    el.style.fontSize = el.style.fontSize === "112.5%" ? "" : "112.5%";
  };
  const toggleContrast = () => {
    document.documentElement.classList.toggle("dark", !contrast);
    document.documentElement.style.filter = !contrast ? "contrast(1.25)" : "";
    setContrast(!contrast);
  };

  return (
    <header>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-highlight focus:p-2">
        Ir para o conteúdo
      </a>
      <div className="bg-primary-deep text-primary-foreground text-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <span className="hidden sm:inline">Prefeitura Municipal de Pau dos Ferros</span>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Acesso rápido">
            <a href="/esic" className="flex items-center gap-1 hover:underline"><Headphones className="size-4" />Ouvidoria/e-SIC</a>
            <a href="/transparencia" className="flex items-center gap-1 hover:underline"><Info className="size-4" />Transparência</a>
            <button onClick={toggleFont} className="flex items-center gap-1 hover:underline" aria-label="Aumentar fonte">A+</button>
            <button onClick={toggleContrast} className="flex items-center gap-1 hover:underline"><Accessibility className="size-4" />Contraste</button>
            <a href="/busca" className="flex items-center gap-1 hover:underline"><Search className="size-4" />Pesquisar</a>
            <span className="hidden items-center gap-3 md:flex">
              <a href="https://www.facebook.com/prefeituradepaudosferros" aria-label="Facebook"><Facebook className="size-4" /></a>
              <a href="https://www.instagram.com/prefeituradepaudosferros" aria-label="Instagram"><Instagram className="size-4" /></a>
              <a href="https://www.youtube.com" aria-label="YouTube"><Youtube className="size-4" /></a>
              <a href="/webmail" aria-label="Webmail"><Mail className="size-4" /></a>
            </span>
          </nav>
        </div>
      </div>
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-full border-4 border-primary bg-card font-display text-lg font-black text-primary">PF</div>
            <div className="leading-none">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Prefeitura de</div>
              <div className="font-display text-3xl font-black uppercase text-primary">Pau dos Ferros</div>
              <div className="mt-1 inline-block bg-highlight px-2 py-0.5 text-[10px] font-bold uppercase italic text-highlight-foreground">Avançando com você</div>
            </div>
          </a>
          <a
            href={isStaff ? "/admin" : "/auth"}
            className="hidden items-center gap-2 rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-secondary sm:flex"
          >
            <LogIn className="size-4" />
            {isStaff ? "Painel administrativo" : user ? "Minha conta" : "Área restrita"}
          </a>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <button className="flex items-center gap-2 py-3 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>
            <Menu className="size-5" /> Menu
          </button>
          <nav className={`${open ? "flex" : "hidden"} flex-col md:flex md:flex-row`} aria-label="Principal">
            {NAV.map((n) => (
              <a
                key={n.to}
                href={n.to}
                className="px-3 py-3 text-sm hover:bg-primary-deep"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="font-display text-xl font-black uppercase">Prefeitura de Pau dos Ferros</div>
          <p className="mt-2 text-sm opacity-80">Av. Getúlio Vargas, 1323, Centro — Pau dos Ferros/RN — CEP 59.900-000</p>
          <p className="text-sm opacity-80">Atendimento: segunda a sexta, 7h às 13h</p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-bold">Acesso rápido</div>
          <ul className="space-y-1 opacity-90">
            <li><a href="/transparencia" className="hover:underline">Portal da Transparência</a></li>
            <li><a href="/esic" className="hover:underline">e-SIC e Ouvidoria</a></li>
            <li><a href="/servicos" className="hover:underline">Carta de Serviços</a></li>
            <li><a href="/lgpd" className="hover:underline">Proteção de dados (LGPD)</a></li>
            <li><a href="/webmail" className="hover:underline">Webmail institucional</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-bold">Legislação atendida</div>
          <p className="opacity-80">Lei 12.527/2011 (LAI), LC 131/2009, Lei 13.709/2018 (LGPD), Lei 14.133/2021 e Lei 13.460/2017.</p>
        </div>
      </div>
      <div className="border-t border-sidebar-border py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Prefeitura Municipal de Pau dos Ferros/RN
      </div>
    </footer>
  );
}
