-- =============================================================================
-- PNCCP - ETAPA 2: Normalización y optimización
-- Textos legales en tabla separada; índices adicionales; preparación escalado
-- =============================================================================

CREATE TABLE core.documents_text (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad_tipo TEXT NOT NULL,
  entidad_id UUID NOT NULL,
  tipo_texto TEXT NOT NULL,
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_text_entidad ON core.documents_text(entidad_tipo, entidad_id);
CREATE INDEX idx_documents_text_tipo ON core.documents_text(tipo_texto);

COMMENT ON TABLE core.documents_text IS 'Textos legales largos desnormalizados desde expedientes/contratos';

CREATE TRIGGER set_updated_at_documents_text
  BEFORE UPDATE ON core.documents_text
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

ALTER TABLE core.documents_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_text_select"
  ON core.documents_text FOR SELECT TO authenticated
  USING (
    (entidad_tipo = 'expediente' AND EXISTS (
      SELECT 1 FROM core.expedientes e
      WHERE e.id = entidad_id AND (core.user_belongs_to_institucion(e.institucion_id) OR core.is_admin_nacional() OR core.is_auditor())
    ))
    OR (entidad_tipo = 'contrato' AND EXISTS (
      SELECT 1 FROM core.contratos c
      JOIN core.expedientes e ON e.id = c.expediente_id
      WHERE c.id = entidad_id AND (core.user_belongs_to_institucion(e.institucion_id) OR core.is_admin_nacional() OR core.is_auditor())
    ))
    OR core.is_admin_nacional()
    OR core.is_auditor()
  );

CREATE POLICY "documents_text_insert_update"
  ON core.documents_text FOR ALL TO authenticated
  USING (
    (entidad_tipo = 'expediente' AND EXISTS (
      SELECT 1 FROM core.expedientes e
      WHERE e.id = entidad_id AND core.user_belongs_to_institucion(e.institucion_id)
    ))
    OR (entidad_tipo = 'contrato' AND EXISTS (
      SELECT 1 FROM core.contratos c
      JOIN core.expedientes e ON e.id = c.expediente_id
      WHERE c.id = entidad_id AND core.user_belongs_to_institucion(e.institucion_id)
    ))
  )
  WITH CHECK (
    (entidad_tipo = 'expediente' AND EXISTS (
      SELECT 1 FROM core.expedientes e
      WHERE e.id = entidad_id AND core.user_belongs_to_institucion(e.institucion_id)
    ))
    OR (entidad_tipo = 'contrato' AND EXISTS (
      SELECT 1 FROM core.contratos c
      JOIN core.expedientes e ON e.id = c.expediente_id
      WHERE c.id = entidad_id AND core.user_belongs_to_institucion(e.institucion_id)
    ))
  );

CREATE INDEX IF NOT EXISTS idx_expedientes_estado_fecha ON core.expedientes(estado_expediente_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_licitaciones_estado_cierre ON procurement.licitaciones(estado, fecha_cierre);
CREATE INDEX IF NOT EXISTS idx_contratos_fecha_fin ON core.contratos(fecha_fin) WHERE estado = 'vigente';
