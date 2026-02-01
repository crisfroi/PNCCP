# Modelo de datos – PNCCP

## Esquemas

| Esquema       | Uso |
|---------------|-----|
| `auth`        | Gestionado por Supabase (usuarios, sesiones). |
| `core`        | Entidades troncales: perfiles, roles, instituciones, expedientes, contratos, catálogos. |
| `rnp`         | Registro Nacional de Proveedores: proveedores y documentos. |
| `procurement` | Licitaciones, ofertas, evaluaciones. |
| `execution`   | Ejecución contractual: hitos. |
| `documents`   | Plantillas y emisiones documentales. |
| `audit`       | Logs inmutables de auditoría. |

---

## Entidades troncales

### A. Usuarios y perfiles

- **auth.users**: identidad (Supabase Auth).
- **core.profiles**: extensión por usuario.
  - `id` (PK, FK auth.users), `nombre_completo`, `cargo`, `email_institucional`, `telefono`, `institucion_id`, `rol_sistema_id`, `estado` (activo/suspendido), `fecha_creacion`, `updated_at`.
- Regla: ningún usuario opera sin perfil vinculado.

### B. Roles y permisos

- **core.roles_sistema**: `id`, `nombre_rol`, `nivel_acceso`, `descripcion`.
- **core.permisos**: `id`, `codigo_permiso`, `descripcion`, `modulo`.
- **core.roles_permisos**: tabla puente (rol_id, permiso_id).

Roles iniciales: Admin Nacional, Admin Institucional, Técnico, Auditor, Proveedor.

### C. Instituciones

- **core.instituciones**: `id`, `nombre_oficial`, `codigo`, `tipo` (ministerio, entidad_autonoma, empresa_publica, administracion_central), `nivel` (central, provincial, distrital), `institucion_padre_id`, `estado` (activa/inactiva).

### D. Expedientes

- **core.tipos_procedimiento**: catálogo (LA, LR, CO, CD).
- **core.estados_expediente**: catálogo (borrador, en_tramite, licitacion, evaluacion, adjudicado, contratado, ejecucion, cerrado).
- **core.expedientes**: `id`, `codigo_expediente` (único nacional, generado por Edge Function), `institucion_id`, `tipo_procedimiento_id`, `estado_expediente_id`, `objeto_contrato`, `presupuesto`, `responsable_id`, `fecha_creacion`, `fecha_cierre`, `updated_at`.

### E. RNP

- **rnp.proveedores**: `id`, `razon_social`, `tipo` (empresa, autonomo, consorcio), `nif`, `pais`, `estado` (activo/suspendido/inhabilitado), `user_id`, fechas.
- **rnp.proveedor_documentos**: `proveedor_id`, `tipo_documento`, `url_storage`, `fecha_vencimiento`, `estado` (vigente/vencido/rechazado).

### F. Licitaciones y ofertas

- **procurement.licitaciones**: `expediente_id` (1:1), `fecha_publicacion`, `fecha_cierre`, `estado` (borrador, publicada, cerrada, adjudicada).
- **procurement.ofertas**: `licitacion_id`, `proveedor_id`, `monto`, `hash_oferta`, `fecha_envio`, `estado` (presentada, abierta, descartada, adjudicada).

### G. Evaluación

- **procurement.evaluaciones**: `oferta_id` (1:1), `puntuacion_tecnica`, `puntuacion_economica`, `puntuacion_total`, `evaluador_id`, `fecha_evaluacion`.

### H. Contratos y ejecución

- **core.contratos**: `expediente_id`, `proveedor_id`, `monto_adjudicado`, `fecha_inicio`, `fecha_fin`, `estado`, `url_contrato`.
- **execution.hitos_contrato**: `contrato_id`, `descripcion`, `fecha_prevista`, `fecha_real`, `estado` (pendiente, cumplido, atrasado, cancelado).

### I. Documentos

- **documents.document_templates**: plantillas versionadas (tipo, formato, estructura_json, ambito, institucion_id).
- **documents.document_emissions**: cada emisión (template_id, entidad_origen, entidad_id, hash_documento, url_storage, usuario_generador, fecha_emision).

### J. Auditoría

- **audit.logs**: `tabla_afectada`, `operacion` (INSERT/UPDATE/DELETE), `registro_id`, `usuario_id`, `institucion_id`, `payload_anterior`, `payload_nuevo`, `created_at`. Sin UPDATE/DELETE sobre esta tabla.

---

## Relaciones clave

- Expediente → institución (N:1); expediente → licitación (1:1).
- Licitación → ofertas (1:N); oferta → evaluación (1:1).
- Expediente → contrato (1:1); contrato → hitos (1:N).
- Perfil → institución, rol; Proveedor → user (auth), documentos.

---

## Índices principales

- Expedientes: `institucion_id`, `estado_expediente_id`, `codigo_expediente`, `fecha_creacion`.
- Ofertas: `licitacion_id`, `proveedor_id`.
- Contratos: `expediente_id`, `proveedor_id`, `estado`.
- Audit: `tabla_afectada`, `usuario_id`, `created_at`.
