// PNCCP - Edge Function: Motor de alertas (plazos, vencimientos, riesgos)
// Invocable por cron o desde el backend tras eventos
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const alerts: { tipo: string; mensaje: string; entidad?: string; id?: string }[] = [];

    // 1) Documentos de proveedor próximos a vencer (ej. 30 días)
    const { data: docsProximos } = await supabase
      .schema("rnp")
      .from("proveedor_documentos")
      .select("id, proveedor_id, tipo_documento, fecha_vencimiento")
      .not("fecha_vencimiento", "is", null)
      .lte("fecha_vencimiento", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
      .eq("estado", "vigente");

    if (docsProximos?.length) {
      docsProximos.forEach((d: { id: string; proveedor_id: string; tipo_documento: string; fecha_vencimiento: string }) => {
        alerts.push({
          tipo: "documento_vencimiento",
          mensaje: `Documento ${d.tipo_documento} vence el ${d.fecha_vencimiento}`,
          entidad: "proveedor_documentos",
          id: d.id,
        });
      });
    }

    // 2) Licitaciones que cierran en 48h
    const in48 = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { data: licitaciones } = await supabase
      .schema("procurement")
      .from("licitaciones")
      .select("id, expediente_id, fecha_cierre")
      .eq("estado", "publicada")
      .lte("fecha_cierre", in48);

    if (licitaciones?.length) {
      licitaciones.forEach((l: { id: string; expediente_id: string; fecha_cierre: string }) => {
        alerts.push({
          tipo: "cierre_licitacion",
          mensaje: `Licitación cierra el ${l.fecha_cierre}`,
          entidad: "licitaciones",
          id: l.id,
        });
      });
    }

    // 3) Ejecutar suspensión de proveedores con docs vencidos (RPC)
    await supabase.rpc("suspender_proveedores_con_docs_vencidos");
    await supabase.rpc("actualizar_estado_documentos_vencidos");

    return new Response(
      JSON.stringify({
        ok: true,
        total_alertas: alerts.length,
        alertas: alerts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
