import { Headphones, Info, Search, Accessibility, Menu, Facebook, Instagram, LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/prefeitura-logo.png.asset.json';
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); };

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
            <Button variant="ghost" size="sm" onClick={toggleFont} aria-label="Aumentar fonte">A+</Button>
            <Button variant="ghost" size="sm" onClick={toggleContrast}><Accessibility className="size-4" />Contraste</Button>
            <Link to="/busca" className="flex items-center gap-1 hover:underline"><Search className="size-4" />Pesquisar</Link>
            <span className="hidden items-center gap-3 md:flex">
              <a href="https://www.facebook.com/prefeituradepaudosferros" aria-label="Facebook"><Facebook className="size-4" /></a>
              <a href="https://www.instagram.com/prefeituradepaudosferros" aria-label="Instagram"><Instagram className="size-4" /></a>
            </span>
          </nav>
        </div>
      </div>
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link to="/" aria-label="Prefeitura de Pau dos Ferros — início"><img src={logo.url} alt="Prefeitura de Pau dos Ferros — Avançando com você" className="h-20 w-64 max-w-[65vw] object-contain" /></Link>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" asChild><Link to={isStaff ? '/admin' : user ? '/conta' : '/auth'}><LogIn />{isStaff ? 'Painel administrativo' : user ? 'Minha conta' : 'Área restrita'}</Link></Button>
            {user && <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair da conta" title="Sair da conta"><LogOut /></Button>}
          </div>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <Button variant="ghost" className="my-1 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>
            <Menu className="size-5" /> Menu
          </Button>
          <nav className={`${open ? "flex" : "hidden"} flex-col md:flex md:flex-row`} aria-label="Principal">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
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
          <p className="mt-2 text-sm opacity-80">Pau dos Ferros — Rio Grande do Norte</p>
          <Link to="/secretarias" className="text-sm underline">Contatos e horários de atendimento</Link>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-bold">Acesso rápido</div>
          <ul className="space-y-1 opacity-90">
            <li><a href="/transparencia" className="hover:underline">Portal da Transparência</a></li>
            <li><a href="/esic" className="hover:underline">e-SIC e Ouvidoria</a></li>
            <li><a href="/servicos" className="hover:underline">Carta de Serviços</a></li>
            <li><a href="/lgpd" className="hover:underline">Proteção de dados (LGPD)</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-bold">Legislação de referência</div>
          <p className="opacity-80">Lei 12.527/2011 (LAI), LC 131/2009, Lei 13.709/2018 (LGPD), Lei 14.133/2021 e Lei 13.460/2017.</p>
        </div>
      </div>
      <div className="border-t border-sidebar-border py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Prefeitura Municipal de Pau dos Ferros/RN
      </div>
    </footer>
  );
}
