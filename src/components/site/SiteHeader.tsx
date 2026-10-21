import { Link } from "@tanstack/react-router";
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
            <Link to="/esic" className="flex items-center gap-1 hover:underline"><Headphones className="size-4" />Ouvidoria/e-SIC</Link>
            <Link to="/transparencia" className="flex items-center gap-1 hover:underline"><Info className="size-4" />Transparência</Link>
            <button onClick={toggleFont} className="flex items-center gap-1 hover:underline" aria-label="Aumentar fonte">A+</button>
            <button onClick={toggleContrast} className="flex items-center gap-1 hover:underline"><Accessibility className="size-4" />Contraste</button>
            <Link to="/busca" className="flex items-center gap-1 hover:underline"><Search className="size-4" />Pesquisar</Link>
            <span className="hidden items-center gap-3 md:flex">
              <a href="https://www.facebook.com/prefeituradepaudosferros" aria-label="Facebook"><Facebook className="size-4" /></a>
              <a href="https://www.instagram.com/prefeituradepaudosferros" aria-label="Instagram"><Instagram className="size-4" /></a>
              <a href="https://www.youtube.com" aria-label="YouTube"><Youtube className="size-4" /></a>
              <Link to="/webmail" aria-label="Webmail"><Mail className="size-4" /></Link>
            </span>
          </nav>
        </div>
      </div>
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-full border-4 border-primary bg-card font-display text-lg font-black text-primary">PF</div>
            <div className="leading-none">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Prefeitura de</div>
              <div className="font-display text-3xl font-black uppercase text-primary">Pau dos Ferros</div>
              <div className="mt-1 inline-block bg-highlight px-2 py-0.5 text-[10px] font-bold uppercase italic text-highlight-foreground">Avançando com você</div>
            </div>
          </Link>
          <Link
            to={isStaff ? "/admin" : "/auth"}
            className="hidden items-center gap-2 rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-secondary sm:flex"
          >
            <LogIn className="size-4" />
            {isStaff ? "Painel administrativo" : user ? "Minha conta" : "Área restrita"}
          </Link>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <button className="flex items-center gap-2 py-3 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>
            <Menu className="size-5" /> Menu
          </button>
          <nav className={`${open ? "flex" : "hidden"} flex-col md:flex md:flex-row`} aria-label="Principal">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-primary-deep" }}
                className="px-3 py-3 text-sm hover:bg-primary-deep"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
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
            <li><Link to="/transparencia" className="hover:underline">Portal da Transparência</Link></li>
            <li><Link to="/esic" className="hover:underline">e-SIC e Ouvidoria</Link></li>
            <li><Link to="/servicos" className="hover:underline">Carta de Serviços</Link></li>
            <li><Link to="/lgpd" className="hover:underline">Proteção de dados (LGPD)</Link></li>
            <li><Link to="/webmail" className="hover:underline">Webmail institucional</Link></li>
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
