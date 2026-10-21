import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";
export const SessionContext = createContext<{ session: Session | null; roles: string[]; ready: boolean }>({ session: null, roles: [], ready: false });
export function useSession() {
  const { session, roles, ready } = useContext(SessionContext);
  return { session, roles, ready, user: session?.user ?? null, isStaff: roles.includes('admin') || roles.includes('editor'), isAdmin: roles.includes('admin') };
}
