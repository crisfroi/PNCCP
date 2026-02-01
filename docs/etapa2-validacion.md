# ETAPA 2: Arquitectura técnica Supabase – Validación

## Objetivo

Arquitectura Supabase robusta, escalable y segura, con firma electrónica dejada como módulo futuro desacoplado.

---

## 2.1 Estructura de esquemas

| Esquema       | Uso |
|---------------|-----|
| `auth`        | Gestionado por Supabase |
| `core`        | Entidades troncales (instituciones, expedientes, contratos, profiles, roles, documents_text) |
| `rnp`         | Proveedores y clasificación |
| `procurement` | Licitaciones, ofertas, evaluaciones |
| `execution`   | Ejecución contractual (hitos) |
| `documents`   | Plantillas y emisiones documentales |
| `audit`       | Logs y trazabilidad |

**Estado:** ✔ Implementado en migraciones 001–004.

---

## 2.2 Normalización y optimización

- **Textos legales:** tabla `core.documents_text` (entidad_tipo, entidad_id, tipo_texto, contenido). Expedientes/contratos pueden referenciar textos largos aquí.
- **Estados:** catálogos `core.estados_expediente`, `core.tipos_procedimiento`.
- **Índices:** por institucion_id, estado, fechas; índices compuestos para listados (expedientes por estado+fecha, licitaciones por estado+cierre, contratos vigentes por fecha_fin).

**Estado:** ✔ Migración 004 aplicada.

---

## 2.3 Políticas RLS

- Expedientes: SELECT por institución; INSERT/UPDATE por admin institucional o responsable; DELETE solo Admin Nacional.
- Proveedores: solo su ficha; staff ve todos.
- Auditores: SELECT global, sin escritura en datos de negocio.
- `audit.logs`: solo INSERT (por triggers); SELECT para auditores y admin nacional / por institución.

**Estado:** ✔ Migración 002 aplicada.

---

## 2.4 Edge Functions

- `generate_expediente_code`: código único nacional (año + institución + tipo + secuencia).
- `validate_procedure`: coherencia legal del expediente.
- `generate_documents`: registro de emisión y path (motor documental en ETAPA 5).
- `alerts_engine`: plazos, vencimientos, RPC de suspensión/actualización de documentos.

**Estado:** ✔ Definidas en `supabase/functions/`. Desplegar con Supabase CLI.

---

## 2.5 Storage

Buckets recomendados: `institutional`, `providers`, `expedientes`, `contracts`. Configuración de referencia en `supabase/storage/buckets-config.sql`. Políticas de Storage deben alinearse con RLS por institución/proveedor.

**Estado:** ✔ Documentado; crear buckets y políticas desde Dashboard o migración según entorno.

---

## 2.6 Automatizaciones clave

- Alta proveedor → checklist documental (lógica en frontend/Edge Function).
- Cierre licitación → bloqueo de nuevas ofertas (trigger `oferta_dentro_plazo`).
- Documentos vencidos → actualización estado y suspensión proveedor (RPC públicos).
- Evaluación completa → generación de acta (ETAPA 5).
- Adjudicación → creación de contrato (flujo en aplicación).

**Estado:** ✔ Triggers y RPC en migración 003.

---

## 2.7 Preparación para escalado

- Multi-institución: RLS por `institucion_id`.
- Multi-rol: funciones `current_user_rol()`, `is_admin_nacional()`, etc.
- Multi-idioma futuro: catálogos y textos largos en `documents_text` o tablas de traducción posteriores.

**Estado:** ✔ Base lista para frontend y ETAPA 3 (UX/UI).

---

## 2.8 Resultado obligatorio ETAPA 2

| Criterio                         | Estado |
|----------------------------------|--------|
| Arquitectura Supabase validada   | ✔ |
| RLS cerrada                      | ✔ |
| Edge Functions definidas        | ✔ |
| Normalización (documents_text)   | ✔ |
| Índices optimizados              | ✔ |
| Sistema listo para frontend IA  | ✔ |

---

## NO avanzar a ETAPA 3 sin validación

Validación: migraciones 001–004 aplicadas en Supabase; tablas y políticas verificadas. Listo para ETAPA 3 (UX/UI y flujos por rol).
