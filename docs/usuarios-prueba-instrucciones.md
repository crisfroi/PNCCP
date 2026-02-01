# Usuarios de Prueba - Instrucciones de Creación

## Resumen

Se han configurado **6 usuarios de prueba** para cada rol del sistema PNCCP. Estos usuarios están definidos en la tabla `public.usuarios_prueba_config` y deben crearse en Supabase Auth.

## Usuarios de Prueba Configurados

| Email | Rol | Institución | Contraseña |
|-------|-----|-------------|-----------|
| `admin.nacional@pnccp.gq` | Admin Nacional | (Ninguna) | `Password123!` |
| `admin.mh@pnccp.gq` | Admin Institucional | Ministerio de Hacienda | `Password123!` |
| `admin.ine@pnccp.gq` | Admin Institucional | Instituto Nacional de Educación | `Password123!` |
| `tecnico.prueba@pnccp.gq` | Técnico | Ministerio de Hacienda | `Password123!` |
| `auditor.prueba@pnccp.gq` | Auditor | (Ninguna) | `Password123!` |
| `proveedor.prueba@pnccp.gq` | Proveedor | (Ninguna) | `Password123!` |

## Método 1: Crear Usuarios a través del Dashboard Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Authentication > Users**
4. Click en **+ Add user**
5. Para cada usuario, ingresa:
   - **Email**: (ver tabla arriba)
   - **Password**: `Password123!`
   - Deja **Auto confirm user** marcado
6. Click **Save**

## Método 2: Crear Usuarios con Supabase CLI

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Loguearse
supabase login

# Crear usuarios
supabase auth admin inviteUser admin.nacional@pnccp.gq --project-id jqovimcmyurxejiummpl
supabase auth admin inviteUser admin.mh@pnccp.gq --project-id jqovimcmyurxejiummpl
supabase auth admin inviteUser admin.ine@pnccp.gq --project-id jqovimcmyurxejiummpl
supabase auth admin inviteUser tecnico.prueba@pnccp.gq --project-id jqovimcmyurxejiummpl
supabase auth admin inviteUser auditor.prueba@pnccp.gq --project-id jqovimcmyurxejiummpl
supabase auth admin inviteUser proveedor.prueba@pnccp.gq --project-id jqovimcmyurxejiummpl
```

## Método 3: Crear Usuarios con SQL (Admin)

Después de crear los usuarios en Supabase Auth, obtén sus UUIDs y ejecuta:

```sql
-- Obtener los UUIDs de auth.users
SELECT id, email FROM auth.users WHERE email LIKE '%@pnccp.gq';

-- Luego crear los perfiles (reemplaza los UUIDs con los valores reales)
INSERT INTO core.profiles (
  id, nombre_completo, email_institucional, 
  institucion_id, rol_sistema_id, estado
)
VALUES
  ('UUID-ADMIN-NACIONAL', 'Admin Nacional Prueba', 'admin.nacional@pnccp.gq', 
   NULL, 'b3cf63d4-66d4-406e-b4ff-ffb6f5648674'::uuid, 'activo'),
  ('UUID-ADMIN-MH', 'Admin Institucional - Hacienda', 'admin.mh@pnccp.gq',
   '4d19aee8-9730-4caf-ad1a-d7a8b8533e9b'::uuid, '669763bc-1d26-4c55-bacc-91048edcec9b'::uuid, 'activo'),
  ('UUID-ADMIN-INE', 'Admin Institucional - Educación', 'admin.ine@pnccp.gq',
   'd3f4687f-b1fb-4dc1-94e9-67100011774c'::uuid, '669763bc-1d26-4c55-bacc-91048edcec9b'::uuid, 'activo'),
  ('UUID-TECNICO', 'Técnico Evaluador', 'tecnico.prueba@pnccp.gq',
   '4d19aee8-9730-4caf-ad1a-d7a8b8533e9b'::uuid, '18b5a5e1-9671-4143-8b79-fbf536afa33a'::uuid, 'activo'),
  ('UUID-AUDITOR', 'Auditor Nacional', 'auditor.prueba@pnccp.gq',
   NULL, '077da885-4cea-4176-856c-43fa1605a281'::uuid, 'activo'),
  ('UUID-PROVEEDOR', 'Proveedor Test SA', 'proveedor.prueba@pnccp.gq',
   NULL, 'ca27977e-4266-4afc-9b06-cfbf6b9e861b'::uuid, 'activo');
```

## Verificación

Después de crear los usuarios, verifica que están correctamente asignados:

```sql
-- Verificar usuarios y sus roles
SELECT 
  p.id, p.nombre_completo, p.email_institucional,
  rs.nombre_rol, i.nombre_oficial
FROM core.profiles p
LEFT JOIN core.roles_sistema rs ON p.rol_sistema_id = rs.id
LEFT JOIN core.instituciones i ON p.institucion_id = i.id
WHERE p.email_institucional LIKE '%@pnccp.gq';
```

## Roles y Permisos

### Admin Nacional
- Acceso total al sistema
- Gestionar todas las instituciones
- Ver todos los expedientes, licitaciones y contratos
- Acceso a auditoría

### Admin Institucional
- Gestionar expedientes de su institución
- Crear y editar licitaciones
- Ver reportes de su institución
- Acceso a dashboards

### Técnico
- Evaluar ofertas
- Ver expedientes y licitaciones
- No puede crear ni adjudicar

### Auditor
- Acceso de solo lectura a todo
- Ver auditoría completa
- Generar reportes

### Proveedor
- Ver licitaciones públicas
- Presentar ofertas
- Ver su perfil RNP
- Ver contratos adjudicados

## Próximos Pasos

1. Crear los usuarios en Supabase Auth (Método 1 o 2)
2. Obtener sus UUIDs
3. Ejecutar SQL para crear perfiles (Método 3)
4. Probar login con cada usuario
5. Continuar con Etapa 7 (Firma Electrónica y Notificaciones)

---

**Nota**: Para ambiente de producción, cambiar todas las contraseñas a valores seguros y usar un sistema de gestión de credenciales.
