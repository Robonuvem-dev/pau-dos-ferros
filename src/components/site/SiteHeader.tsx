import { Headphones, Info, Search, Accessibility, Menu, LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BRASAO_URL } from "@/lib/municipal-brand";
import { useState } from "react";
import { useSession } from "@/hooks/use-session";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/prefeitura", label: "Prefeitura" },
  { to: "/secretarias", label: "Secretarias" },
  { to: "/servicos", label: "Serviços" },
  { to: "/noticias", label: "Notícias" },
  { to: "/transparencia", label: "Transparência" },
  { to: "/lgpd", label: "LGPD" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const { isStaff, user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = async () => { await supabase.rpc('registrar_acesso', { _evento: 'LOGOUT' }); await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); };

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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <span className="hidden sm:inline">Prefeitura Municipal de Aurora das Veredas</span>
          <nav className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm" aria-label="Acesso rápido">
            <Link to="/esic" className="flex items-center gap-1 hover:underline"><Headphones className="size-4" />Ouvidoria/e-SIC</Link>
            <Link to="/transparencia" className="flex items-center gap-1 hover:underline"><Info className="size-4" />Transparência</Link>
            <Button variant="ghost" size="sm" onClick={toggleFont} aria-label="Aumentar fonte">A+</Button>
            <Button variant="ghost" size="sm" onClick={toggleContrast}><Accessibility className="size-4" />Contraste</Button>
            <Link to="/busca" search={{ q: "" }} className="flex items-center gap-1 hover:underline"><Search className="size-4" />Pesquisar</Link>
          </nav>
        </div>
      </div>
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:py-5">
          <Link to="/" aria-label="Prefeitura de Aurora das Veredas — início" className="flex min-w-0 items-center gap-3"><img src={BRASAO_URL} alt="Brasão de Aurora das Veredas" className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20" /><span className="font-display text-lg font-bold leading-tight sm:text-2xl">Prefeitura de<br />Aurora das Veredas</span></Link>
          <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
            <Button variant="outline" size="sm" asChild><Link to={isStaff ? '/admin' : user ? '/conta' : '/auth'}><LogIn /><span className="sm:hidden">{isStaff ? 'Painel' : user ? 'Conta' : 'Entrar'}</span><span className="hidden sm:inline">{isStaff ? 'Painel administrativo' : user ? 'Minha conta' : 'Área restrita'}</span></Link></Button>
            {user && <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair da conta" title="Sair da conta"><LogOut /></Button>}
          </div>
        </div>
      </div>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <Button variant="ghost" className="my-1 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>
            <Menu className="size-5" /> Menu
          </Button>
          <nav className={`${open ? "flex" : "hidden"} flex-col md:flex md:flex-row md:flex-wrap`} aria-label="Principal">
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
            <Link to="/transparencia/$module" params={{ module: "licitacoes" }} className="px-3 py-3 text-sm hover:bg-primary-deep">Licitações</Link>
            <Link to="/transparencia/$module" params={{ module: "obras" }} className="px-3 py-3 text-sm hover:bg-primary-deep">Obras</Link>
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
          <div className="font-display text-xl font-black uppercase">Prefeitura de Aurora das Veredas</div>
          <p className="mt-2 text-sm opacity-80">Aurora das Veredas</p>
          <Link to="/secretarias" className="text-sm underline">Contatos e horários de atendimento</Link>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-bold">Acesso rápido</div>
          <ul className="space-y-1 opacity-90">
            <li><a href="/transparencia" className="hover:underline">Portal da Transparência</a></li>
            <li><a href="/esic" className="hover:underline">e-SIC e Ouvidoria</a></li>
            <li><a href="/servicos" className="hover:underline">Carta de Serviços</a></li>
            <li><a href="/lgpd" className="hover:underline">Proteção de dados (LGPD)</a></li>
            <li><a href="/sobre" className="hover:underline">Sobre o sistema</a></li>
            <li><a href="/instalar.html" className="hover:underline">Instalar aplicativo</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-bold">Legislação de referência</div>
          <p className="opacity-80">Lei 12.527/2011 (LAI), LC 131/2009, Lei 13.709/2018 (LGPD), Lei 14.133/2021 e Lei 13.460/2017.</p>
        </div>
      </div>
      <div className="border-t border-sidebar-border py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Prefeitura Municipal de Aurora das Veredas
      </div>
    </footer>
  );
}
