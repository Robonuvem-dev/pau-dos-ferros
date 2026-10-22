import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SessionContext } from '@/hooks/use-session';
import { SiteHeader, SiteFooter } from '@/components/site/SiteHeader';
import { Toaster } from '@/components/ui/sonner';

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Prefeitura de Pau dos Ferros" },
      { name: "description", content: "Portal oficial de Pau dos Ferros: serviços, notícias e transparência municipal." },
      { property: "og:title", content: "Prefeitura de Pau dos Ferros" },
      { property: "og:description", content: "Serviços ao cidadão e transparência municipal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Roboto+Condensed:wght@400;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [identity, setIdentity] = useState<{ session: Session | null; roles: string[]; ready: boolean }>({ session: null, roles: [], ready: false });
  useEffect(() => {
    let active = true;
    let version = 0;
    const load = async (session: Session | null) => {
      const current = ++version;
      const { data: verified } = session ? await supabase.auth.getUser() : { data: { user: null } };
      const user = verified.user;
      const { data } = user ? await supabase.from('user_roles').select('role').eq('user_id', user.id) : { data: [] };
      if (active && version === current) setIdentity({ session: user ? session : null, roles: (data ?? []).map(r => r.role), ready: true });
    };
    void supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) return;
      if (event === 'SIGNED_OUT') { sessionStorage.removeItem('acesso-registrado'); setIdentity({ session: null, roles: [], ready: true }); }
      if (event === 'SIGNED_IN' && session && sessionStorage.getItem('acesso-registrado') !== session.user.id) {
        sessionStorage.setItem('acesso-registrado', session.user.id);
        setTimeout(() => { void supabase.rpc('registrar_acesso', { _evento: 'LOGIN' }); }, 0);
      }
      setTimeout(() => { void load(session); void router.invalidate(); if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries(); }, 0);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={identity}>
        <SiteHeader />
        <main id="conteudo" className="min-h-[50vh]"><Outlet /></main>
        <SiteFooter />
        <Toaster richColors />
      </SessionContext.Provider>
    </QueryClientProvider>
  );
}
