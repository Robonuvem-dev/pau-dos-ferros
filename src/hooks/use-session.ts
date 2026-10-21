import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async (s: Session | null) => {
      setSession(s);
      if (s) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
        setRoles((data ?? []).map((r) => r.role));
      } else setRoles([]);
      setReady(true);
    };
    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => load(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    roles,
    ready,
    isStaff: roles.includes("admin") || roles.includes("editor"),
    isAdmin: roles.includes("admin"),
  };
}
