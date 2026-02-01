# Arquitectura técnica – PNCCP

## Stack

- **Backend/Datos**: Supabase (PostgreSQL, RLS, Auth, Storage, Edge Functions).
- **Frontend**: Por definir (Lovable/Builder.io), componentes reutilizables y flujos por rol.
- **Documentos**: Generación automática (PDF, Word, Excel) vía plantillas y Edge Functions.

## Esquemas PostgreSQL

- `auth`: Supabase.
- `core`: instituciones, expedientes, contratos, perfiles, roles, catálogos.
- `rnp`: proveedores, proveedor_documentos.
- `procurement`: licitaciones, ofertas, evaluaciones.
- `execution`: hitos_contrato.
- `documents`: document_templates, document_emissions.
- `audit`: logs.

## Seguridad (RLS)

- **Proveedores**: solo su ficha y sus ofertas/contratos.
- **Instituciones**: solo sus expedientes, licitaciones, contratos y perfiles de su institución.
- **Admin Nacional**: lectura/escritura global (excepto borrado lógico donde aplique).
- **Auditores**: lectura global, sin escritura en datos de negocio; lectura en `audit.logs`.

Funciones auxiliares: `core.current_user_institucion_id()`, `core.current_user_rol()`, `core.is_admin_nacional()`, `core.is_admin_institucional()`, `core.is_auditor()`, `core.user_belongs_to_institucion(uuid)`.

## Edge Functions

1. **generate-expediente-code**: entrada `institucion_id`, `tipo_procedimiento_id`; salida `codigo_expediente` (año + código institución + tipo + secuencia).
2. **validate-procedure**: entrada `expediente_id`; salida `valid`, `issues` (coherencia legal y documentación).
3. **generate-documents**: entrada `template_id`, `entidad_origen`, `entidad_id`; genera documento, guarda en Storage y registra en `document_emissions`.
4. **alerts-engine**: plazos (cierre licitación), vencimientos documentales, suspensión de proveedores con documentos vencidos (vía RPC públicos).

## Automatizaciones (triggers / funciones)

- `updated_at` en tablas con esa columna.
- Auditoría: INSERT/UPDATE/DELETE en expedientes, contratos, proveedores, ofertas, evaluaciones → `audit.logs`.
- RNP: estado de documento (vigente/vencido) según `fecha_vencimiento`; funciones `rnp.suspender_proveedores_con_docs_vencidos()` y `rnp.actualizar_estado_documentos_vencidos()` (y wrappers públicos para RPC).
- Expedientes: no crear/actualizar si la institución no está activa.
- Ofertas: no insertar si la licitación no está publicada o ya cerró.

## Storage (recomendado)

Buckets sugeridos: `institutional`, `providers`, `expedientes`, `contracts`. Versionado y sin borrado físico; acceso vía RLS/Storage policies.

## Flujo de datos

1. Gestión institucional (core.instituciones, core.profiles).
2. RNP (rnp.proveedores + documentos).
3. Expediente (core.expedientes) → código vía Edge Function.
4. Licitación (procurement.licitaciones) → ofertas (procurement.ofertas).
5. Evaluación (procurement.evaluaciones).
6. Adjudicación → core.contratos.
7. Ejecución (execution.hitos_contrato).
8. Documentos y auditoría en todo el ciclo.
