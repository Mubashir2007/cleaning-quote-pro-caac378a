import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getQuoteByToken = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ token: z.string().min(10).max(128) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin.rpc as any)("get_quote_by_token", { _token: data.token });
    if (error) throw new Error(error.message);
    return (rows && rows[0]) ?? null;
  });

export const actOnQuoteByToken = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      token: z.string().min(10).max(128),
      action: z.enum(["accept", "reject"]),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin.rpc as any)("act_on_quote_by_token", {
      _token: data.token,
      _action: data.action,
    });
    if (error) throw new Error(error.message);
    return (rows && rows[0]) ?? null;
  });
