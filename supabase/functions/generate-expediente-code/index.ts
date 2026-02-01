// PNCCP - Edge Function: Generación de código único nacional de expediente
// Lógica: Año + código institución + secuencia
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { institucion_id, tipo_procedimiento_id } = await req.json();
    if (!institucion_id || !tipo_procedimiento_id) {
      return new Response(
        JSON.stringify({ error: "institucion_id y tipo_procedimiento_id son obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const year = new Date().getFullYear();
    const { data: inst } = await supabase
      .schema("core")
      .from("instituciones")
      .select("codigo")
      .eq("id", institucion_id)
      .single();

    const prefix = (inst?.codigo ?? "INS").replace(/\s/g, "").slice(0, 6).toUpperCase();
    const tipoCode = await supabase
      .schema("core")
      .from("tipos_procedimiento")
      .select("codigo")
      .eq("id", tipo_procedimiento_id)
      .single();
    const tCode = (tipoCode.data?.codigo ?? "XX").toUpperCase();

    const { count } = await supabase
      .schema("core")
      .from("expedientes")
      .select("id", { count: "exact", head: true })
      .like("codigo_expediente", `${year}-${prefix}-${tCode}-%`);

    const seq = (count ?? 0) + 1;
    const codigo_expediente = `${year}-${prefix}-${tCode}-${String(seq).padStart(5, "0")}`;

    return new Response(
      JSON.stringify({ codigo_expediente }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
