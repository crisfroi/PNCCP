// PNCCP - Edge Function: Validación de coherencia legal del procedimiento
// Verifica documentación obligatoria y bloquea si falta
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { expediente_id } = await req.json();
    if (!expediente_id) {
      return new Response(
        JSON.stringify({ error: "expediente_id es obligatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: exp, error: errExp } = await supabase
      .schema("core")
      .from("expedientes")
      .select("id, institucion_id, tipo_procedimiento_id, objeto_contrato, presupuesto")
      .eq("id", expediente_id)
      .single();

    if (errExp || !exp) {
      return new Response(
        JSON.stringify({ valid: false, error: "Expediente no encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const issues: string[] = [];
    if (!exp.objeto_contrato?.trim()) issues.push("Objeto del contrato obligatorio");
    if (exp.presupuesto == null || Number(exp.presupuesto) < 0) issues.push("Presupuesto válido obligatorio");

    const valid = issues.length === 0;
    return new Response(
      JSON.stringify({
        valid,
        expediente_id,
        issues: issues.length ? issues : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ valid: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
