# Seguridad y auditoría – PNCCP

## Principios

- **RLS estricta**: todas las tablas de negocio tienen RLS habilitado y políticas por rol e institución.
- **Auditoría inalterable**: `audit.logs` solo INSERT; sin UPDATE ni DELETE.
- **Mínimo privilegio**: cada rol ve y modifica solo lo que corresponde a su institución o a su perfil (proveedor).

## Roles y alcance

| Rol                 | Alcance lectura        | Alcance escritura                          |
|---------------------|------------------------|--------------------------------------------|
| Admin Nacional      | Todo                   | Todo (crear instituciones, expedientes, etc.) |
| Admin Institucional | Su institución         | Su institución (expedientes, comités, etc.)   |
| Técnico / Comité    | Expedientes asignados  | Evaluaciones, actas                         |
| Auditor             | Todo (solo lectura)    | Ninguna                                     |
| Proveedor           | Su perfil, sus ofertas/contratos, licitaciones publicadas | Su perfil, sus ofertas |

## Políticas RLS (resumen)

- **core.profiles**: lectura propia y misma institución; escritura propia o por admin (nacional/institucional).
- **core.instituciones**: lectura autenticados; escritura/borrado solo Admin Nacional.
- **core.expedientes**: lectura por institución del usuario o Admin/Auditor; inserción Admin Nacional o Admin Institucional de esa institución; actualización responsable o admin; borrado solo Admin Nacional.
- **rnp.proveedores**: proveedor solo su fila (user_id); staff ve todos; actualización propia o Admin Nacional.
- **procurement.ofertas**: proveedor solo sus ofertas; institución ve ofertas de sus licitaciones; inserción solo el proveedor dueño.
- **audit.logs**: lectura Auditores y Admin Nacional; lectura por institución para admins institucionales; solo INSERT para usuarios autenticados (vía triggers).

## Funciones SECURITY DEFINER

- `core.current_user_institucion_id()`, `core.current_user_rol()`, `core.is_admin_nacional()`, etc.: usadas dentro de políticas RLS para no exponer lógica sensible.
- `audit.trigger_audit_log()`: escribe en `audit.logs` con contexto del usuario e institución.
- `rnp.suspender_proveedores_con_docs_vencidos()` y `actualizar_estado_documentos_vencidos()`: ejecución con privilegios controlados; llamadas desde servicio (Edge/cron) vía wrappers públicos.

## Auditoría

- Tablas auditadas: expedientes, contratos, proveedores, ofertas, evaluaciones.
- En cada fila: tabla, operación, registro_id, usuario_id, institucion_id (cuando aplique), payload_anterior y payload_nuevo (JSONB), created_at.

## Recomendaciones

- Cifrado en tránsito y en reposo (Supabase).
- No exponer `SUPABASE_SERVICE_ROLE_KEY` en frontend; solo en Edge Functions o backend.
- Revisar políticas de Storage por bucket (institutional, providers, expedientes, contracts) alineadas con RLS de las entidades asociadas.
- Firma electrónica: módulo futuro desacoplado; la trazabilidad (quién, cuándo, qué) se mantiene en `audit.logs` y en metadatos de documentos.
