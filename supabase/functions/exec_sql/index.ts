import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const jwt = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!jwt) {
    return new Response("Missing JWT", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } },
  );

  const { sql_text, sql_params } = await req.json();
  const { data, error } = await supabase.rpc("exec_sql", {
    sql_text,
    sql_params,
  });

  return new Response(JSON.stringify({ data, error }), {
    headers: { "Content-Type": "application/json" },
  });
});
