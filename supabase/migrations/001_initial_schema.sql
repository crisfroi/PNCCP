-- =============================================================================
-- PNCCP - Plataforma Nacional de Compras y Contratación Pública
-- ETAPA 1: Modelo de datos central
-- Esquemas: core, rnp, procurement, execution, documents, audit
-- =============================================================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ESQUEMAS
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS rnp;
CREATE SCHEMA IF NOT EXISTS procurement;
CREATE SCHEMA IF NOT EXISTS execution;
CREATE SCHEMA IF NOT EXISTS documents;
CREATE SCHEMA IF NOT EXISTS audit;

-- -----------------------------------------------------------------------------
-- CORE: Roles y permisos
-- -----------------------------------------------------------------------------
CREATE TABLE core.roles_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_rol TEXT NOT NULL UNIQUE,
  nivel_acceso INTEGER NOT NULL DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE core.permisos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_permiso TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  modulo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE core.roles_permisos (
  rol_id UUID NOT NULL REFERENCES core.roles_sistema(id) ON DELETE CASCADE,
  permiso_id UUID NOT NULL REFERENCES core.permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

-- -----------------------------------------------------------------------------
-- CORE: Perfiles de usuario (extiende auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE core.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  cargo TEXT,
  email_institucional TEXT,
  telefono TEXT,
  institucion_id UUID,
  rol_sistema_id UUID REFERENCES core.roles_sistema(id),
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido')),
  fecha_creacion TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_institucion ON core.profiles(institucion_id);
CREATE INDEX idx_profiles_rol ON core.profiles(rol_sistema_id);
CREATE INDEX idx_profiles_estado ON core.profiles(estado);

-- -----------------------------------------------------------------------------
-- CORE: Instituciones públicas
-- -----------------------------------------------------------------------------
CREATE TABLE core.instituciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_oficial TEXT NOT NULL,
  codigo TEXT UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ministerio', 'entidad_autonoma', 'empresa_publica', 'administracion_central')),
  nivel TEXT NOT NULL CHECK (nivel IN ('central', 'provincial', 'distrital')),
  institucion_padre_id UUID REFERENCES core.instituciones(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE core.profiles
  ADD CONSTRAINT fk_profiles_institucion
  FOREIGN KEY (institucion_id) REFERENCES core.instituciones(id) ON DELETE SET NULL;

CREATE INDEX idx_instituciones_padre ON core.instituciones(institucion_padre_id);
CREATE INDEX idx_instituciones_tipo_nivel ON core.instituciones(tipo, nivel);
CREATE INDEX idx_instituciones_estado ON core.instituciones(estado);

-- -----------------------------------------------------------------------------
-- CORE: Catálogos para expedientes
-- -----------------------------------------------------------------------------
CREATE TABLE core.tipos_procedimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT
);

CREATE TABLE core.estados_expediente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- CORE: Expedientes de contratación
-- -----------------------------------------------------------------------------
CREATE TABLE core.expedientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_expediente TEXT UNIQUE NOT NULL,
  institucion_id UUID NOT NULL REFERENCES core.instituciones(id) ON DELETE RESTRICT,
  tipo_procedimiento_id UUID NOT NULL REFERENCES core.tipos_procedimiento(id),
  estado_expediente_id UUID NOT NULL REFERENCES core.estados_expediente(id),
  objeto_contrato TEXT NOT NULL,
  presupuesto NUMERIC(18,2) NOT NULL CHECK (presupuesto >= 0),
  responsable_id UUID REFERENCES core.profiles(id),
  fecha_creacion TIMESTAMPTZ DEFAULT now(),
  fecha_cierre TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expedientes_institucion ON core.expedientes(institucion_id);
CREATE INDEX idx_expedientes_estado ON core.expedientes(estado_expediente_id);
CREATE INDEX idx_expedientes_codigo ON core.expedientes(codigo_expediente);
CREATE INDEX idx_expedientes_fecha ON core.expedientes(fecha_creacion);

-- -----------------------------------------------------------------------------
-- RNP: Proveedores del Estado
-- -----------------------------------------------------------------------------
CREATE TABLE rnp.proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razon_social TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa', 'autonomo', 'consorcio')),
  nif TEXT,
  pais TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'inhabilitado')),
  fecha_registro TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rnp.proveedor_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proveedor_id UUID NOT NULL REFERENCES rnp.proveedores(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  url_storage TEXT NOT NULL,
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'vigente' CHECK (estado IN ('vigente', 'vencido', 'rechazado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_proveedores_estado ON rnp.proveedores(estado);
CREATE INDEX idx_proveedores_user ON rnp.proveedores(user_id);
CREATE INDEX idx_proveedor_docs_vencimiento ON rnp.proveedor_documentos(proveedor_id, fecha_vencimiento);

-- -----------------------------------------------------------------------------
-- PROCUREMENT: Licitaciones y ofertas
-- -----------------------------------------------------------------------------
CREATE TABLE procurement.licitaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expediente_id UUID NOT NULL REFERENCES core.expedientes(id) ON DELETE CASCADE,
  fecha_publicacion TIMESTAMPTZ,
  fecha_cierre TIMESTAMPTZ NOT NULL,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicada', 'cerrada', 'adjudicada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(expediente_id)
);

CREATE TABLE procurement.ofertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  licitacion_id UUID NOT NULL REFERENCES procurement.licitaciones(id) ON DELETE CASCADE,
  proveedor_id UUID NOT NULL REFERENCES rnp.proveedores(id) ON DELETE CASCADE,
  monto NUMERIC(18,2) NOT NULL CHECK (monto >= 0),
  hash_oferta TEXT,
  fecha_envio TIMESTAMPTZ DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'presentada' CHECK (estado IN ('presentada', 'abierta', 'descartada', 'adjudicada')),
  UNIQUE(licitacion_id, proveedor_id)
);

CREATE INDEX idx_licitaciones_expediente ON procurement.licitaciones(expediente_id);
CREATE INDEX idx_licitaciones_fecha_cierre ON procurement.licitaciones(fecha_cierre);
CREATE INDEX idx_ofertas_licitacion ON procurement.ofertas(licitacion_id);
CREATE INDEX idx_ofertas_proveedor ON procurement.ofertas(proveedor_id);

-- -----------------------------------------------------------------------------
-- PROCUREMENT: Evaluación
-- -----------------------------------------------------------------------------
CREATE TABLE procurement.evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oferta_id UUID NOT NULL REFERENCES procurement.ofertas(id) ON DELETE CASCADE,
  puntuacion_tecnica NUMERIC(10,2) CHECK (puntuacion_tecnica >= 0),
  puntuacion_economica NUMERIC(10,2) CHECK (puntuacion_economica >= 0),
  puntuacion_total NUMERIC(10,2) CHECK (puntuacion_total >= 0),
  observaciones TEXT,
  evaluador_id UUID REFERENCES core.profiles(id),
  fecha_evaluacion TIMESTAMPTZ DEFAULT now(),
  UNIQUE(oferta_id)
);

CREATE INDEX idx_evaluaciones_oferta ON procurement.evaluaciones(oferta_id);

-- -----------------------------------------------------------------------------
-- CORE: Contratos
-- -----------------------------------------------------------------------------
CREATE TABLE core.contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expediente_id UUID NOT NULL REFERENCES core.expedientes(id) ON DELETE RESTRICT,
  proveedor_id UUID NOT NULL REFERENCES rnp.proveedores(id) ON DELETE RESTRICT,
  monto_adjudicado NUMERIC(18,2) NOT NULL CHECK (monto_adjudicado >= 0),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'vigente' CHECK (estado IN ('vigente', 'modificado', 'terminado', 'rescindido')),
  url_contrato TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contratos_expediente ON core.contratos(expediente_id);
CREATE INDEX idx_contratos_proveedor ON core.contratos(proveedor_id);
CREATE INDEX idx_contratos_estado ON core.contratos(estado);

-- -----------------------------------------------------------------------------
-- EXECUTION: Hitos contractuales
-- -----------------------------------------------------------------------------
CREATE TABLE execution.hitos_contrato (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID NOT NULL REFERENCES core.contratos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  fecha_prevista DATE NOT NULL,
  fecha_real DATE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'cumplido', 'atrasado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hitos_contrato ON execution.hitos_contrato(contrato_id);
CREATE INDEX idx_hitos_fecha_prevista ON execution.hitos_contrato(fecha_prevista);

-- -----------------------------------------------------------------------------
-- DOCUMENTS: Plantillas y emisiones (base para ETAPA 5)
-- -----------------------------------------------------------------------------
CREATE TABLE documents.document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_documento TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pliego', 'acta', 'resolucion', 'contrato', 'informe')),
  version INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'activo', 'obsoleto')),
  ambito TEXT NOT NULL DEFAULT 'nacional' CHECK (ambito IN ('nacional', 'institucional')),
  institucion_id UUID REFERENCES core.instituciones(id),
  formato TEXT NOT NULL CHECK (formato IN ('pdf', 'docx', 'xlsx')),
  estructura_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents.document_emissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES documents.document_templates(id),
  entidad_origen TEXT NOT NULL,
  entidad_id UUID NOT NULL,
  version_utilizada INTEGER NOT NULL,
  hash_documento TEXT,
  url_storage TEXT NOT NULL,
  usuario_generador UUID REFERENCES core.profiles(id),
  fecha_emision TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_doc_emissions_entidad ON documents.document_emissions(entidad_origen, entidad_id);

-- -----------------------------------------------------------------------------
-- AUDIT: Logs inmutables
-- -----------------------------------------------------------------------------
CREATE TABLE audit.logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla_afectada TEXT NOT NULL,
  operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id UUID,
  usuario_id UUID REFERENCES auth.users(id),
  institucion_id UUID REFERENCES core.instituciones(id),
  payload_anterior JSONB,
  payload_nuevo JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_tabla ON audit.logs(tabla_afectada);
CREATE INDEX idx_audit_logs_usuario ON audit.logs(usuario_id);
CREATE INDEX idx_audit_logs_created ON audit.logs(created_at);

-- -----------------------------------------------------------------------------
-- Datos iniciales: roles y catálogos
-- -----------------------------------------------------------------------------
INSERT INTO core.roles_sistema (nombre_rol, nivel_acceso, descripcion) VALUES
  ('Admin Nacional', 100, 'Control total del sistema'),
  ('Admin Institucional', 80, 'Gestión de su institución'),
  ('Técnico', 50, 'Evaluación y seguimiento de expedientes'),
  ('Auditor', 90, 'Solo lectura y exportación'),
  ('Proveedor', 10, 'Perfil proveedor del Estado');

INSERT INTO core.tipos_procedimiento (codigo, nombre) VALUES
  ('LA', 'Licitación abierta'),
  ('LR', 'Licitación restringida'),
  ('CO', 'Concurso'),
  ('CD', 'Contratación directa');

INSERT INTO core.estados_expediente (codigo, nombre) VALUES
  ('borrador', 'Borrador'),
  ('en_tramite', 'En trámite'),
  ('licitacion', 'En licitación'),
  ('evaluacion', 'En evaluación'),
  ('adjudicado', 'Adjudicado'),
  ('contratado', 'Contratado'),
  ('ejecucion', 'En ejecución'),
  ('cerrado', 'Cerrado');

COMMENT ON SCHEMA core IS 'Entidades troncales: instituciones, expedientes, contratos, perfiles, roles';
COMMENT ON SCHEMA rnp IS 'Registro Nacional de Proveedores';
COMMENT ON SCHEMA procurement IS 'Licitaciones, ofertas, evaluaciones';
COMMENT ON SCHEMA execution IS 'Ejecución contractual e hitos';
COMMENT ON SCHEMA documents IS 'Plantillas y emisiones documentales';
COMMENT ON SCHEMA audit IS 'Auditoría y trazabilidad';
