// PNCCP - Edge Function: Generación de documentos (PDF/Word/Excel)
// Usa plantillas y datos del sistema; registro en document_emissions
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { template_id, entidad_origen, entidad_id } = await req.json();
    if (!template_id || !entidad_origen || !entidad_id) {
      return new Response(
        JSON.stringify({ error: "template_id, entidad_origen y entidad_id son obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: template } = await supabase
      .from("document_templates")
      .select("*")
      .eq("id", template_id)
      .eq("estado", "activo")
      .single();

    if (!template) {
      return new Response(
        JSON.stringify({ error: "Plantilla no encontrada o no activa" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Placeholder: generación real requeriría motor PDF/DOCX (ej. plantilla HTML→PDF, docx templates)
    const hash_documento = crypto.randomUUID();
    const pathStorage = `documents/${entidad_origen}/${entidad_id}/${template.tipo}_v${template.version}_${Date.now()}.${template.formato}`;

    const { data: emission, error } = await supabase
      .schema("documents")
      .from("document_emissions")
      .insert({
        template_id,
        entidad_origen,
        entidad_id,
        version_utilizada: template.version,
        hash_documento,
        url_storage: pathStorage,
        usuario_generador: req.headers.get("x-user-id") ?? null,
      })
      .select("id, fecha_emision")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        emission_id: emission.id,
        url_storage: pathStorage,
        hash_documento,
        fecha_emision: emission.fecha_emision,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
