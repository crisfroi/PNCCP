-- =============================================================================
-- PNCCP - Políticas Row Level Security (RLS)
-- Principios: Proveedores solo su info; Instituciones solo sus expedientes;
--            Auditores ven todo, no editan.
-- =============================================================================

-- Función auxiliar: obtener institucion_id del usuario actual desde JWT o profile
CREATE OR REPLACE FUNCTION core.current_user_institucion_id()
RETURNS UUID AS $$
  SELECT institucion_id FROM core.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función: obtener rol del usuario (nombre)
CREATE OR REPLACE FUNCTION core.current_user_rol()
RETURNS TEXT AS $$
  SELECT r.nombre_rol
  FROM core.profiles p
  JOIN core.roles_sistema r ON r.id = p.rol_sistema_id
  WHERE p.id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función: es admin nacional
CREATE OR REPLACE FUNCTION core.is_admin_nacional()
RETURNS BOOLEAN AS $$
  SELECT core.current_user_rol() = 'Admin Nacional'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función: es admin institucional (de cualquier institución o la actual)
CREATE OR REPLACE FUNCTION core.is_admin_institucional()
RETURNS BOOLEAN AS $$
  SELECT core.current_user_rol() = 'Admin Institucional'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función: es auditor (solo lectura)
CREATE OR REPLACE FUNCTION core.is_auditor()
RETURNS BOOLEAN AS $$
  SELECT core.current_user_rol() = 'Auditor'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función: usuario pertenece a la institución del registro
CREATE OR REPLACE FUNCTION core.user_belongs_to_institucion(inst_id UUID)
RETURNS BOOLEAN AS $$
  SELECT institucion_id = inst_id FROM core.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función: es proveedor (ve solo su user_id en rnp.proveedores)
CREATE OR REPLACE FUNCTION rnp.current_user_is_proveedor_owner(proveedor_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = proveedor_user_id
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- CORE: roles_sistema (solo Admin Nacional y lectura para perfiles)
-- -----------------------------------------------------------------------------
ALTER TABLE core.roles_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_sistema_select_all"
  ON core.roles_sistema FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "roles_sistema_insert_admin"
  ON core.roles_sistema FOR INSERT
  TO authenticated
  WITH CHECK (core.is_admin_nacional());

CREATE POLICY "roles_sistema_update_admin"
  ON core.roles_sistema FOR UPDATE
  TO authenticated
  USING (core.is_admin_nacional());

-- -----------------------------------------------------------------------------
-- CORE: permisos
-- -----------------------------------------------------------------------------
ALTER TABLE core.permisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permisos_select_authenticated"
  ON core.permisos FOR SELECT TO authenticated USING (true);

CREATE POLICY "permisos_modify_admin"
  ON core.permisos FOR ALL TO authenticated
  USING (core.is_admin_nacional())
  WITH CHECK (core.is_admin_nacional());

-- -----------------------------------------------------------------------------
-- CORE: roles_permisos
-- -----------------------------------------------------------------------------
ALTER TABLE core.roles_permisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_permisos_select_authenticated"
  ON core.roles_permisos FOR SELECT TO authenticated USING (true);

CREATE POLICY "roles_permisos_modify_admin"
  ON core.roles_permisos FOR ALL TO authenticated
  USING (core.is_admin_nacional())
  WITH CHECK (core.is_admin_nacional());

-- -----------------------------------------------------------------------------
-- CORE: profiles
-- -----------------------------------------------------------------------------
ALTER TABLE core.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON core.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_same_institucion"
  ON core.profiles FOR SELECT TO authenticated
  USING (core.user_belongs_to_institucion(institucion_id));

CREATE POLICY "profiles_select_auditor"
  ON core.profiles FOR SELECT TO authenticated
  USING (core.is_auditor());

CREATE POLICY "profiles_insert_admin"
  ON core.profiles FOR INSERT TO authenticated
  WITH CHECK (core.is_admin_nacional() OR (core.is_admin_institucional() AND core.user_belongs_to_institucion(institucion_id)));

CREATE POLICY "profiles_update_own"
  ON core.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_admin"
  ON core.profiles FOR UPDATE TO authenticated
  USING (core.is_admin_nacional() OR (core.is_admin_institucional() AND core.user_belongs_to_institucion(institucion_id)));

-- -----------------------------------------------------------------------------
-- CORE: instituciones
-- -----------------------------------------------------------------------------
ALTER TABLE core.instituciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instituciones_select_authenticated"
  ON core.instituciones FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "instituciones_insert_admin_nacional"
  ON core.instituciones FOR INSERT TO authenticated
  WITH CHECK (core.is_admin_nacional());

CREATE POLICY "instituciones_update_admin_nacional"
  ON core.instituciones FOR UPDATE TO authenticated
  USING (core.is_admin_nacional());

CREATE POLICY "instituciones_delete_admin_nacional"
  ON core.instituciones FOR DELETE TO authenticated
  USING (core.is_admin_nacional());

-- -----------------------------------------------------------------------------
-- CORE: expedientes
-- -----------------------------------------------------------------------------
ALTER TABLE core.expedientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expedientes_select_institucion"
  ON core.expedientes FOR SELECT TO authenticated
  USING (
    core.user_belongs_to_institucion(institucion_id)
    OR core.is_admin_nacional()
    OR core.is_auditor()
  );

CREATE POLICY "expedientes_insert_admin_inst"
  ON core.expedientes FOR INSERT TO authenticated
  WITH CHECK (
    core.is_admin_nacional()
    OR (core.is_admin_institucional() AND core.user_belongs_to_institucion(institucion_id))
  );

CREATE POLICY "expedientes_update_responsable"
  ON core.expedientes FOR UPDATE TO authenticated
  USING (
    core.is_admin_nacional()
    OR (core.user_belongs_to_institucion(institucion_id) AND (responsable_id = auth.uid() OR core.is_admin_institucional()))
  );

CREATE POLICY "expedientes_delete_admin_nacional"
  ON core.expedientes FOR DELETE TO authenticated
  USING (core.is_admin_nacional());

-- -----------------------------------------------------------------------------
-- RNP: proveedores (proveedor solo ve/edita el suyo)
-- -----------------------------------------------------------------------------
ALTER TABLE rnp.proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proveedores_select_own"
  ON rnp.proveedores FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "proveedores_select_staff"
  ON rnp.proveedores FOR SELECT TO authenticated
  USING (NOT (core.current_user_rol() = 'Proveedor'));

CREATE POLICY "proveedores_insert_own"
  ON rnp.proveedores FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "proveedores_update_own"
  ON rnp.proveedores FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "proveedores_update_admin"
  ON rnp.proveedores FOR UPDATE TO authenticated
  USING (core.is_admin_nacional());

-- -----------------------------------------------------------------------------
-- RNP: proveedor_documentos
-- -----------------------------------------------------------------------------
ALTER TABLE rnp.proveedor_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proveedor_docs_select_own"
  ON rnp.proveedor_documentos FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM rnp.proveedores pr WHERE pr.id = proveedor_id AND pr.user_id = auth.uid())
  );

CREATE POLICY "proveedor_docs_select_staff"
  ON rnp.proveedor_documentos FOR SELECT TO authenticated
  USING (core.current_user_rol() != 'Proveedor');

CREATE POLICY "proveedor_docs_insert_own"
  ON rnp.proveedor_documentos FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM rnp.proveedores pr WHERE pr.id = proveedor_id AND pr.user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- PROCUREMENT: licitaciones (por expediente → institución)
-- -----------------------------------------------------------------------------
ALTER TABLE procurement.licitaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "licitaciones_select_by_exp"
  ON procurement.licitaciones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM core.expedientes e
      WHERE e.id = expediente_id
      AND (e.institucion_id = core.current_user_institucion_id() OR core.is_admin_nacional() OR core.is_auditor())
    )
  );

-- Proveedores pueden ver licitaciones publicadas (solo datos públicos)
CREATE POLICY "licitaciones_select_public"
  ON procurement.licitaciones FOR SELECT TO authenticated
  USING (estado = 'publicada' OR estado = 'cerrada');

CREATE POLICY "licitaciones_insert_update"
  ON procurement.licitaciones FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM core.expedientes e
      WHERE e.id = expediente_id
      AND core.user_belongs_to_institucion(e.institucion_id)
    )
    AND (core.is_admin_institucional() OR core.is_admin_nacional())
  );

-- -----------------------------------------------------------------------------
-- PROCUREMENT: ofertas (proveedor ve solo las suyas; institución ve todas de su licitación)
-- -----------------------------------------------------------------------------
ALTER TABLE procurement.ofertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ofertas_select_own_proveedor"
  ON procurement.ofertas FOR SELECT TO authenticated
  USING (proveedor_id IN (SELECT id FROM rnp.proveedores WHERE user_id = auth.uid()));

CREATE POLICY "ofertas_select_by_licitacion_inst"
  ON procurement.ofertas FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM procurement.licitaciones l
      JOIN core.expedientes e ON e.id = l.expediente_id
      WHERE l.id = licitacion_id
      AND core.user_belongs_to_institucion(e.institucion_id)
    )
  );

CREATE POLICY "ofertas_insert_proveedor"
  ON procurement.ofertas FOR INSERT TO authenticated
  WITH CHECK (
    proveedor_id IN (SELECT id FROM rnp.proveedores WHERE user_id = auth.uid())
  );

CREATE POLICY "ofertas_update_evaluador"
  ON procurement.ofertas FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM procurement.licitaciones l
      JOIN core.expedientes e ON e.id = l.expediente_id
      WHERE l.id = licitacion_id
      AND core.user_belongs_to_institucion(e.institucion_id)
    )
  );

-- -----------------------------------------------------------------------------
-- PROCUREMENT: evaluaciones
-- -----------------------------------------------------------------------------
ALTER TABLE procurement.evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluaciones_select_by_inst"
  ON procurement.evaluaciones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM procurement.ofertas o
      JOIN procurement.licitaciones l ON l.id = o.licitacion_id
      JOIN core.expedientes e ON e.id = l.expediente_id
      WHERE o.id = oferta_id
      AND (core.user_belongs_to_institucion(e.institucion_id) OR core.is_admin_nacional() OR core.is_auditor())
    )
  );

CREATE POLICY "evaluaciones_insert_update"
  ON procurement.evaluaciones FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM procurement.ofertas o
      JOIN procurement.licitaciones l ON l.id = o.licitacion_id
      JOIN core.expedientes e ON e.id = l.expediente_id
      WHERE o.id = oferta_id
      AND core.user_belongs_to_institucion(e.institucion_id)
    )
    AND (core.current_user_rol() IN ('Admin Institucional', 'Técnico', 'Admin Nacional'))
  );

-- -----------------------------------------------------------------------------
-- CORE: contratos
-- -----------------------------------------------------------------------------
ALTER TABLE core.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contratos_select_institucion"
  ON core.contratos FOR SELECT TO authenticated
  USING (
    core.user_belongs_to_institucion(
      (SELECT institucion_id FROM core.expedientes WHERE id = expediente_id)
    )
    OR core.is_admin_nacional()
    OR core.is_auditor()
  );

CREATE POLICY "contratos_select_proveedor"
  ON core.contratos FOR SELECT TO authenticated
  USING (proveedor_id IN (SELECT id FROM rnp.proveedores WHERE user_id = auth.uid()));

CREATE POLICY "contratos_insert_update"
  ON core.contratos FOR ALL TO authenticated
  USING (
    core.user_belongs_to_institucion(
      (SELECT institucion_id FROM core.expedientes WHERE id = expediente_id)
    )
    AND (core.is_admin_institucional() OR core.is_admin_nacional())
  );

-- -----------------------------------------------------------------------------
-- EXECUTION: hitos_contrato
-- -----------------------------------------------------------------------------
ALTER TABLE execution.hitos_contrato ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hitos_select_by_contrato"
  ON execution.hitos_contrato FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM core.contratos c
      JOIN core.expedientes e ON e.id = c.expediente_id
      WHERE c.id = contrato_id
      AND (core.user_belongs_to_institucion(e.institucion_id) OR core.is_admin_nacional() OR core.is_auditor()
           OR c.proveedor_id IN (SELECT id FROM rnp.proveedores WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "hitos_insert_update"
  ON execution.hitos_contrato FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM core.contratos c
      JOIN core.expedientes e ON e.id = c.expediente_id
      WHERE c.id = contrato_id
      AND core.user_belongs_to_institucion(e.institucion_id)
    )
  );

-- -----------------------------------------------------------------------------
-- DOCUMENTS: document_templates, document_emissions (lectura amplia; escritura admin)
-- -----------------------------------------------------------------------------
ALTER TABLE documents.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_templates_select_authenticated"
  ON documents.document_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "doc_templates_modify_admin"
  ON documents.document_templates FOR ALL TO authenticated
  USING (core.is_admin_nacional() OR (core.is_admin_institucional() AND (institucion_id IS NULL OR institucion_id = core.current_user_institucion_id())));

ALTER TABLE documents.document_emissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_emissions_select_authenticated"
  ON documents.document_emissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "doc_emissions_insert_service"
  ON documents.document_emissions FOR INSERT TO authenticated
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- AUDIT: logs (solo inserción por triggers; lectura para auditores y admin nacional)
-- -----------------------------------------------------------------------------
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_auditor"
  ON audit.logs FOR SELECT TO authenticated
  USING (core.is_auditor() OR core.is_admin_nacional());

CREATE POLICY "audit_logs_select_own_institucion"
  ON audit.logs FOR SELECT TO authenticated
  USING (institucion_id = core.current_user_institucion_id());

CREATE POLICY "audit_logs_insert_authenticated"
  ON audit.logs FOR INSERT TO authenticated WITH CHECK (true);

-- No UPDATE ni DELETE en audit.logs (inmutables)
