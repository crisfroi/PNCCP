export type RolNombre =
  | 'Admin Nacional'
  | 'Admin Institucional'
  | 'Técnico'
  | 'Auditor'
  | 'Proveedor'

export interface Profile {
  id: string
  nombre_completo: string
  cargo: string | null
  email_institucional: string | null
  telefono: string | null
  institucion_id: string | null
  rol_sistema_id: string | null
  estado: 'activo' | 'suspendido'
  fecha_creacion: string
  updated_at: string
  rol_nombre?: RolNombre
  institucion_nombre?: string
}

export interface Institucion {
  id: string
  nombre_oficial: string
  codigo: string | null
  tipo: string
  nivel: string
  institucion_padre_id: string | null
  estado: string
  created_at: string
  updated_at: string
}

export interface TipoProcedimiento {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
}

export interface EstadoExpediente {
  id: string
  codigo: string
  nombre: string
}

export interface Expediente {
  id: string
  codigo_expediente: string
  institucion_id: string
  tipo_procedimiento_id: string
  estado_expediente_id: string
  objeto_contrato: string
  presupuesto: number
  responsable_id: string | null
  fecha_creacion: string
  fecha_cierre: string | null
  updated_at: string
  tipo_procedimiento?: TipoProcedimiento
  estado_expediente?: EstadoExpediente
  institucion?: Institucion
}
