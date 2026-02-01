-- =============================================================================
-- PNCCP - Funciones y triggers de automatización
-- Actualización de timestamps, auditoría, bloqueo por vencimiento documental
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Función genérica: updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION core.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar updated_at a tablas con columna updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON core.profiles
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

CREATE TRIGGER set_updated_at_instituciones
  BEFORE UPDATE ON core.instituciones
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

CREATE TRIGGER set_updated_at_expedientes
  BEFORE UPDATE ON core.expedientes
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

CREATE TRIGGER set_updated_at_proveedores
  BEFORE UPDATE ON rnp.proveedores
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

CREATE TRIGGER set_updated_at_licitaciones
  BEFORE UPDATE ON procurement.licitaciones
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

CREATE TRIGGER set_updated_at_contratos
  BEFORE UPDATE ON core.contratos
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

CREATE TRIGGER set_updated_at_hitos
  BEFORE UPDATE ON execution.hitos_contrato
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

CREATE TRIGGER set_updated_at_document_templates
  BEFORE UPDATE ON documents.document_templates
  FOR EACH ROW EXECUTE PROCEDURE core.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auditoría: registro en audit.logs en INSERT/UPDATE/DELETE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario UUID;
  v_institucion UUID;
  v_tabla TEXT := TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME;
  v_operacion TEXT := TG_OP;
  v_registro_id UUID;
  v_old JSONB;
  v_new JSONB;
BEGIN
  v_usuario := auth.uid();
  v_old := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  v_new := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END;
  v_registro_id := CASE WHEN TG_OP = 'DELETE' THEN (OLD).id ELSE (NEW).id END;

  IF v_tabla = 'core.expedientes' AND v_new IS NOT NULL THEN
    v_institucion := (v_new->>'institucion_id')::UUID;
  ELSIF v_tabla = 'core.profiles' AND v_new IS NOT NULL THEN
    v_institucion := (v_new->>'institucion_id')::UUID;
  ELSE
    v_institucion := NULL;
  END IF;

  INSERT INTO audit.logs (tabla_afectada, operacion, registro_id, usuario_id, institucion_id, payload_anterior, payload_nuevo)
  VALUES (v_tabla, v_operacion, v_registro_id, v_usuario, v_institucion, v_old, v_new);

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER audit_expedientes
  AFTER INSERT OR UPDATE OR DELETE ON core.expedientes
  FOR EACH ROW EXECUTE PROCEDURE audit.trigger_audit_log();

CREATE TRIGGER audit_contratos
  AFTER INSERT OR UPDATE OR DELETE ON core.contratos
  FOR EACH ROW EXECUTE PROCEDURE audit.trigger_audit_log();

CREATE TRIGGER audit_proveedores
  AFTER INSERT OR UPDATE OR DELETE ON rnp.proveedores
  FOR EACH ROW EXECUTE PROCEDURE audit.trigger_audit_log();

CREATE TRIGGER audit_ofertas
  AFTER INSERT OR UPDATE OR DELETE ON procurement.ofertas
  FOR EACH ROW EXECUTE PROCEDURE audit.trigger_audit_log();

CREATE TRIGGER audit_evaluaciones
  AFTER INSERT OR UPDATE OR DELETE ON procurement.evaluaciones
  FOR EACH ROW EXECUTE PROCEDURE audit.trigger_audit_log();

-- -----------------------------------------------------------------------------
-- RNP: Marcar documento vencido y bloqueo automático de proveedor
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rnp.check_documento_vencimiento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_vencimiento IS NOT NULL AND NEW.fecha_vencimiento < current_date THEN
    NEW.estado := 'vencido';
  ELSIF NEW.estado IS NULL THEN
    NEW.estado := 'vigente';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proveedor_documento_vencimiento
  BEFORE INSERT OR UPDATE ON rnp.proveedor_documentos
  FOR EACH ROW EXECUTE PROCEDURE rnp.check_documento_vencimiento();

-- Función: suspender proveedor si tiene documentos vencidos (llamable por cron o Edge Function)
CREATE OR REPLACE FUNCTION rnp.suspender_proveedores_con_docs_vencidos()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH vencidos AS (
    SELECT DISTINCT proveedor_id
    FROM rnp.proveedor_documentos
    WHERE fecha_vencimiento IS NOT NULL AND fecha_vencimiento < current_date
    AND estado = 'vigente'
  )
  UPDATE rnp.proveedores p
  SET estado = 'suspendido', updated_at = now()
  FROM vencidos v
  WHERE p.id = v.proveedor_id AND p.estado = 'activo';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar estado 'vencido' en proveedor_documentos (batch)
CREATE OR REPLACE FUNCTION rnp.actualizar_estado_documentos_vencidos()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE rnp.proveedor_documentos
  SET estado = 'vencido'
  WHERE fecha_vencimiento IS NOT NULL AND fecha_vencimiento < current_date AND estado = 'vigente';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Perfil obligatorio: trigger en auth.users (crear perfil al registrarse)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION core.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO core.profiles (id, nombre_completo, email_institucional)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.raw_user_meta_data->>'full_name', 'Sin nombre'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: este trigger debe ejecutarse en auth.users; en Supabase se suele hacer
-- desde Dashboard > Database > Triggers o vía migration con permisos adecuados.
-- Si no tienes acceso a auth schema, crear desde Edge Function o desde Supabase Dashboard.
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE core.handle_new_user();

-- -----------------------------------------------------------------------------
-- Validación: no crear expediente sin institución activa
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION core.expediente_institucion_activa()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM core.instituciones WHERE id = NEW.institucion_id AND estado = 'activa') THEN
    RAISE EXCEPTION 'La institución debe estar activa para crear un expediente.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expediente_check_institucion
  BEFORE INSERT OR UPDATE OF institucion_id ON core.expedientes
  FOR EACH ROW EXECUTE PROCEDURE core.expediente_institucion_activa();

-- -----------------------------------------------------------------------------
-- Cierre de licitación: no permitir ofertas nuevas después de fecha_cierre
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION procurement.oferta_dentro_plazo()
RETURNS TRIGGER AS $$
DECLARE
  v_cierre TIMESTAMPTZ;
  v_estado TEXT;
BEGIN
  SELECT l.fecha_cierre, l.estado INTO v_cierre, v_estado
  FROM procurement.licitaciones l WHERE l.id = NEW.licitacion_id;
  IF v_estado != 'publicada' THEN
    RAISE EXCEPTION 'Solo se pueden presentar ofertas en licitaciones publicadas.';
  END IF;
  IF v_cierre IS NOT NULL AND now() > v_cierre THEN
    RAISE EXCEPTION 'La fecha de cierre de la licitación ha pasado.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oferta_plazo
  BEFORE INSERT ON procurement.ofertas
  FOR EACH ROW EXECUTE PROCEDURE procurement.oferta_dentro_plazo();

-- -----------------------------------------------------------------------------
-- Wrappers públicos para RPC desde Edge Functions / cliente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.suspender_proveedores_con_docs_vencidos()
RETURNS INTEGER AS $$
  SELECT rnp.suspender_proveedores_con_docs_vencidos();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.actualizar_estado_documentos_vencidos()
RETURNS INTEGER AS $$
  SELECT rnp.actualizar_estado_documentos_vencidos();
$$ LANGUAGE sql SECURITY DEFINER;
