-- =============================================================================
-- PNCCP - Configuración de buckets Storage
-- Reglas: versionado, no borrado físico, acceso por RLS/policies
-- Ejecutar desde Dashboard o con service_role
-- =============================================================================

-- Bucket documentos institucionales
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institutional',
  'institutional',
  false,
  52428800, -- 50 MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket documentos de proveedores (RNP)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'providers',
  'providers',
  false,
  52428800,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket expedientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expedientes',
  'expedientes',
  false,
  104857600, -- 100 MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket contratos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,
  52428800,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Policies de Storage deben definirse según rol e institucion_id/proveedor_id
-- (ej. institutional: solo usuarios de la institución dueña del path;
--  providers: proveedor solo su carpeta; expedientes/contracts: por institucion/expediente)
