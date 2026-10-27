import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireStaff(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("is_staff", { _user_id: userId });
  if (error || !data) throw new Error("Acesso restrito à equipe do portal.");
}
export const getAtriconCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context.supabase, context.userId);
    const { fetchOfficialCatalog } = await import("./atricon-download.server");
    return fetchOfficialCatalog();
  });
export const importAtriconPublication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        year: z.number().int().min(2022).max(2100),
        url: z.string().url().max(2048),
        entry: z.string().max(1024).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireStaff(context.supabase, context.userId);
    const { fetchOfficialDownload } = await import("./atricon-download.server");
    return fetchOfficialDownload(data.year, data.url, fetch, data.entry);
  });
