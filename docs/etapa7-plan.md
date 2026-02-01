# ETAPA 7: Firma Electrónica y Notificaciones
## Plataforma Nacional de Compras y Contratación Pública (PNCCP)

---

## 📋 Objetivo General

Integrar capacidades de **firma electrónica legal** en los flujos de contratación para garantizar autenticidad, no repudio e integridad de documentos críticos, y establecer un sistema de **notificaciones automáticas** para mantener informados a todos los actores del proceso.

**Principios rectores:**
> *Cada documento crítico debe estar jurídicamente firmado*  
> *Todos los actores deben recibir notificaciones en tiempo real de eventos clave*  
> *La firma electrónica es vinculante y auditable*

---

## 🏗️ Estructura de Implementación

### FASE 1: Infraestructura de Firma Electrónica (Semanas 1-2)

#### 1.1 **Seleccionar Proveedor de Firma Electrónica**

**Opciones Evaluadas:**

| Proveedor | País | Características | Costo | RLE |
|-----------|------|-----------------|-------|-----|
| **Notarizado** | MX/ES | Cloud-based, API REST, Multi-firma | $500-1500/mes | ✅ |
| **Docusign** | USA | Enterprise, integración completa | $1000+/mes | ✅ |
| **Adobe Sign** | USA | PDF nativo, workflows | $600+/mes | ✅ |
| **ARXivar** | IT | Doc management + firma | $2000+/mes | ✅ |
| **Firmapyme** | ES | Economía, Pyme-friendly | $200-400/mes | ✅ |
| **Self-hosted** | Local | Open source (LibreOffice) | Gratis + DevOps | ⚠️ |

**Recomendación para PNCCP:** 
- **Notarizado** (mejor relación costo-beneficio)
- **Alternativa económica:** Implementar self-hosted con OpenSSL/LibreOffice (futuro)

#### 1.2 **Crear Edge Function para Firma**

**Archivo:** `supabase/functions/sign-document/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const notarizadoApiKey = Deno.env.get("NOTARIZADO_API_KEY")
const notarizadoBaseUrl = "https://api.notarizado.com/v1"

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const { emission_id, firmante_email, documento_tipo } = await req.json()

    // 1. Obtener documento de Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: doc } = await supabase
      .schema("documents")
      .from("document_emissions")
      .select("*")
      .eq("id", emission_id)
      .single()

    if (!doc) {
      return new Response("Document not found", { status: 404 })
    }

    // 2. Enviar a servicio de firma
    const signResponse = await fetch(`${notarizadoBaseUrl}/sign-request`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notarizadoApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: emission_id,
        signer_email: firmante_email,
        document_type: documento_tipo,
        callback_url: `${Deno.env.get("APP_URL")}/api/firma-callback`,
      }),
    })

    const signData = await signResponse.json()

    // 3. Guardar request de firma en BD
    await supabase
      .schema("documents")
      .from("document_emissions")
      .update({
        metadata: {
          ...doc.metadata,
          firma_request_id: signData.request_id,
          firma_estado: "pendiente",
          firma_solicitada_en: new Date().toISOString(),
        },
      })
      .eq("id", emission_id)

    return new Response(
      JSON.stringify({
        success: true,
        firma_request_id: signData.request_id,
        firma_url: signData.sign_url, // URL para que el usuario firme
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

#### 1.3 **Crear Webhook para Callbacks de Firma**

**Flujo:**
```
Usuario firma documento
  ↓
Servicio de firma llama webhook
  ↓
Edge Function recibe callback
  ↓
Actualizar estado en BD
  ↓
Log en audit.logs
  ↓
Enviar notificación al usuario
```

**SQL para tabla de firma:**

```sql
ALTER TABLE documents.document_emissions ADD COLUMN IF NOT EXISTS (
  firma_estado TEXT CHECK (firma_estado IN ('no_firmado', 'pendiente', 'firmado', 'rechazado')),
  fecha_firma TIMESTAMPTZ,
  firmante_id UUID REFERENCES core.profiles(id),
  certificado_firma TEXT, -- Hash o URL del certificado
  firma_request_id TEXT UNIQUE,
  metadata_firma JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_document_emissions_firma_estado 
  ON documents.document_emissions(firma_estado);
```

---

### FASE 2: Flujos de Firma en M4-M7 (Semanas 2-3)

#### 2.1 **M6: Adjudicaciones - Firma de Resolución**

**Flujo:**
```
Adjudicación completada
  ↓
Resolución generada
  ↓
Admin abre modal "Firmar Resolución"
  ↓
Selecciona firmante (puede ser él mismo o delegado)
  ↓
Entra a plataforma de firma
  ↓
Documento firmado
  ↓
Callback actualiza estado en BD
  ↓
Resolución marcada como "FIRMADA"
```

**Frontend Changes (AdjudicacionesPage.tsx):**

```typescript
const handleFirmarResolucion = async (emission_id: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Sesión expirada")

    // Llamar Edge Function para crear request de firma
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sign-document`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          emission_id,
          firmante_email: profile?.email_institucional,
          documento_tipo: "resolucion_adjudicacion",
        }),
      }
    )

    const data = await response.json()

    if (data.success && data.firma_url) {
      // Abrir en nueva ventana/modal
      window.open(data.firma_url, "_blank", "width=800,height=600")
    }
  } catch (err: any) {
    setError(err.message)
  }
}
```

#### 2.2 **M6: Firma de Contrato Público**

Mismo patrón que Resolución, pero se requieren **firmas múltiples** (institución + proveedor)

```typescript
const handleFirmarContrato = async (contrato_id: string) => {
  // Obtener contrato y verificar estado de firmas
  const { data: contrato } = await supabase
    .schema("core")
    .from("contratos")
    .select("*,document_emissions(*)")
    .eq("id", contrato_id)
    .single()

  // Si es Admin Institucional: firmar como institución
  // Si es Proveedor: firmar como proveedor
  // Ambas firmas son necesarias para que el contrato sea válido
}
```

#### 2.3 **M7: Firma de Certificado de Cumplimiento**

Similar a los anteriores, pero solo firma el responsable de seguimiento

---

### FASE 3: Notificaciones Automáticas (Semanas 3-4)

#### 3.1 **Sistema de Notificaciones por Email**

**Tabla de Notificaciones:**

```sql
CREATE TABLE IF NOT EXISTS notifications.email_queue (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  destinatario_id UUID REFERENCES core.profiles(id),
  asunto TEXT NOT NULL,
  cuerpo_html TEXT NOT NULL,
  tipo_evento TEXT NOT NULL, -- adjudicacion, firma_solicitada, contrato_vigente, etc
  entidad_tipo TEXT, -- licitacion, contrato, expediente
  entidad_id UUID,
  intentos_envio INTEGER DEFAULT 0,
  ultimo_intento TIMESTAMPTZ,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'rechazado', 'rebote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_email_queue_estado ON notifications.email_queue(estado);
CREATE INDEX idx_email_queue_created ON notifications.email_queue(created_at DESC);
```

#### 3.2 **Edge Function para Envío de Emails**

**Archivo:** `supabase/functions/send-emails/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY")
const fromEmail = "notificaciones@pnccp.gq"

serve(async (req: Request) => {
  // Obtener pending emails de la cola
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: pendingEmails } = await supabase
    .schema("notifications")
    .from("email_queue")
    .select("*,destinatario:core.profiles(email_institucional)")
    .eq("estado", "pendiente")
    .lt("intentos_envio", 3)
    .limit(10)

  for (const email of pendingEmails || []) {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email.destinatario.email_institucional }],
            },
          ],
          from: { email: fromEmail },
          subject: email.asunto,
          content: [
            {
              type: "text/html",
              value: email.cuerpo_html,
            },
          ],
        }),
      })

      if (response.ok) {
        // Marcar como enviado
        await supabase
          .schema("notifications")
          .from("email_queue")
          .update({
            estado: "enviado",
            sent_at: new Date().toISOString(),
          })
          .eq("id", email.id)
      } else {
        // Incrementar intentos
        await supabase
          .schema("notifications")
          .from("email_queue")
          .update({
            intentos_envio: email.intentos_envio + 1,
            ultimo_intento: new Date().toISOString(),
          })
          .eq("id", email.id)
      }
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed: pendingEmails?.length || 0 }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

#### 3.3 **Triggers para Generar Notificaciones**

**Trigger SQL:**

```sql
-- Cuando se genera una adjudicación, notificar a Admin y Proveedor
CREATE OR REPLACE FUNCTION notifications.notify_adjudicacion()
RETURNS TRIGGER AS $$
DECLARE
  v_proveedor_email TEXT;
  v_admin_email TEXT;
BEGIN
  -- Obtener emails
  SELECT email_institucional INTO v_admin_email
  FROM core.profiles WHERE id = auth.uid() LIMIT 1;

  SELECT email_institucional INTO v_proveedor_email
  FROM core.profiles p
  JOIN rnp.proveedores pr ON pr.user_id = p.id
  WHERE pr.id = NEW.proveedor_id LIMIT 1;

  -- Insertar notificaciones
  INSERT INTO notifications.email_queue (destinatario_id, asunto, cuerpo_html, tipo_evento, entidad_tipo, entidad_id)
  SELECT 
    id, 
    'Adjudicación completada',
    '<p>Se ha completado la adjudicación. Contrato disponible para firma.</p>',
    'adjudicacion',
    'contrato',
    NEW.id
  FROM core.profiles
  WHERE id = auth.uid();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_adjudicacion
AFTER INSERT ON core.contratos
FOR EACH ROW
EXECUTE FUNCTION notifications.notify_adjudicacion();
```

#### 3.4 **Dashboard de Notificaciones (Frontend)**

**Nuevo Componente:** `NotificationCenter.tsx`

```typescript
export function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  
  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const subscription = supabase
      .schema("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "notifications",
        table: "email_queue",
        filter: `destinatario_id=eq.${profile?.id}`,
      }, (payload) => {
        // Agregar notificación a la lista
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [profile?.id])

  return (
    <div className="notification-center">
      {/* UI para mostrar notificaciones */}
    </div>
  )
}
```

---

### FASE 4: Validación y Testing (Semana 4)

#### 4.1 **Validación de Firmas**

**RPC Function:**

```sql
CREATE OR REPLACE FUNCTION documents.verify_signature(
  p_emission_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_metadata JSONB;
  v_signature_valid BOOLEAN;
BEGIN
  SELECT metadata INTO v_metadata
  FROM documents.document_emissions
  WHERE id = p_emission_id;

  -- Validar con proveedor de firma
  -- (implementar según proveedor seleccionado)
  v_signature_valid := TRUE; -- Placeholder

  RETURN v_signature_valid;
END;
$$ LANGUAGE plpgsql;
```

#### 4.2 **Testing Checklist**

- [ ] Crear request de firma
- [ ] Completar firma en plataforma externa
- [ ] Recibir callback
- [ ] Validar firma
- [ ] Mostrar documento como "FIRMADO"
- [ ] Auditoría registra evento
- [ ] Emails enviados correctamente
- [ ] Dashboard muestra notificaciones

---

## 📊 Especificaciones Técnicas

### Base de Datos

**Nuevas Columnas:**
```sql
-- documents.document_emissions
- firma_estado: TEXT
- fecha_firma: TIMESTAMPTZ
- firmante_id: UUID FK
- certificado_firma: TEXT
- firma_request_id: TEXT
- metadata_firma: JSONB

-- notifications.email_queue (nueva tabla)
- id, destinatario_id, asunto, cuerpo_html
- tipo_evento, entidad_tipo, entidad_id
- intentos_envio, estado, sent_at
```

### Edge Functions

1. `sign-document` - Crear request de firma
2. `firma-callback` - Webhook de firma completada
3. `send-emails` - Envío de emails desde cola
4. `verify-signature` - Validar integridad de firma

### Dependencias Externas

- **Proveedor de Firma:** Notarizado (recomendado)
- **Proveedor de Email:** SendGrid o AWS SES
- **Certificados:** OpenSSL (para validación local)

---

## 🎯 Criterios de Aceptación

| Criterio | Éxito | Evidencia |
|----------|-------|-----------|
| Firma de Resolución funcional | ✅ | Documento firmado en Notarizado |
| Firma de Contrato bi-lateral | ✅ | Ambas partes firman |
| Validación de firmas | ✅ | verify_signature() retorna true |
| Notificaciones enviadas | ✅ | Email recibido en test inbox |
| Dashboard actualizado | ✅ | Notificaciones en tiempo real |
| RLS en tablas de firma | ✅ | Policies verificadas |
| Auditoría de firmas | ✅ | audit.logs registra eventos |

---

## ⏱️ Timeline

| Fase | Duración | Hito |
|------|----------|------|
| 1. Infraestructura | 2 semanas | Sign-document funcional |
| 2. Flujos M4-M7 | 1.5 semanas | Firma integrada |
| 3. Notificaciones | 1.5 semanas | Email queue operativa |
| 4. Testing | 1 semana | Todo validado |
| **Total** | **~6 semanas** | ETAPA 7 Completada |

---

## 🔒 Seguridad

- ✅ Firma digital jurídicamente válida
- ✅ Non-repudio (usuario no puede negar haber firmado)
- ✅ Integridad verificable del documento
- ✅ Auditoría inmutable de firmas
- ✅ Validación de certificados SSL
- ✅ Encriptación de datos en tránsito

---

## 📝 Próximos Pasos

1. **Seleccionar proveedor de firma** (Notarizado recomendado)
2. **Configurar credenciales API** (sendgrid, notarizado)
3. **Implementar Edge Functions**
4. **Integrar flujos de firma en M4-M7**
5. **Desplegar sistema de notificaciones**
6. **Testing E2E de firma completa**
7. **Documentar para usuarios**

---

**Plan ETAPA 7 PRELIMINAR** ⏳

Próximo paso: Validar selección de proveedor de firma y comenzar desarrollo
