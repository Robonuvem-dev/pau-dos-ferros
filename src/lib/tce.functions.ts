import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const getTceCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (error || !data) throw new Error("Acesso restrito à equipe do portal.");
    return (await import("./tce.server")).tceCatalog();
  });
export const importTceData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        path: z.string().max(1024),
        parameters: z.record(z.string().max(500)).refine((v) => Object.keys(v).length <= 40),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const access = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (access.error || !access.data) throw new Error("Acesso restrito à equipe do portal.");
    return JSON.stringify(
      await (await import("./tce.server")).queryTce(data.path, data.parameters),
    );
  });
