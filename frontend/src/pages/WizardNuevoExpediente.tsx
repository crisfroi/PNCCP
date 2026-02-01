import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import type { TipoProcedimiento, EstadoExpediente, Institucion } from '@/types'

const PASOS = [
  { id: 1, titulo: 'Tipo de procedimiento', desc: 'Seleccione el tipo de contratación' },
  { id: 2, titulo: 'Objeto del contrato', desc: 'Descripción del objeto' },
  { id: 3, titulo: 'Presupuesto', desc: 'Importe máximo' },
  { id: 4, titulo: 'Documentación', desc: 'Documentación obligatoria' },
  { id: 5, titulo: 'Validación', desc: 'Revisión automática' },
  { id: 6, titulo: 'Confirmación', desc: 'Confirmar y crear' },
]

export function WizardNuevoExpediente() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [tiposProcedimiento, setTiposProcedimiento] = useState<TipoProcedimiento[]>([])
  const [estadosExpediente, setEstadosExpediente] = useState<EstadoExpediente[]>([])
  const [instituciones, setInstituciones] = useState<Institucion[]>([])

  const [tipoProcedimientoId, setTipoProcedimientoId] = useState('')
  const [objetoContrato, setObjetoContrato] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [institucionId, setInstitucionId] = useState(profile?.institucion_id ?? '')
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null)

  useEffect(() => {
    const loadCatalogos = async () => {
      const [tp, ee, inst] = await Promise.all([
        supabase.schema('core').from('tipos_procedimiento').select('*').order('codigo'),
        supabase.schema('core').from('estados_expediente').select('*').eq('codigo', 'borrador').single(),
        supabase.schema('core').from('instituciones').select('*').eq('estado', 'activa').order('nombre_oficial'),
      ])
      setTiposProcedimiento(tp.data ?? [])
      if (ee.data) setEstadosExpediente([ee.data as EstadoExpediente])
      setInstituciones(inst.data ?? [])
      if (profile?.institucion_id) setInstitucionId(profile.institucion_id)
    }
    loadCatalogos()
  }, [profile?.institucion_id])

  const estadoBorradorId = estadosExpediente.find((e) => e.codigo === 'borrador')?.id

  const generarCodigo = async () => {
    try {
      const { data, error: err } = await supabase.functions.invoke('generate-expediente-code', {
        body: { institucion_id: institucionId, tipo_procedimiento_id: tipoProcedimientoId },
      })
      if (err) throw err
      setCodigoGenerado(data?.codigo_expediente ?? null)
    } catch (e: any) {
      setCodigoGenerado(`PREVIEW-${Date.now()}`)
    }
  }

  useEffect(() => {
    if (paso >= 5 && institucionId && tipoProcedimientoId) generarCodigo()
  }, [paso, institucionId, tipoProcedimientoId])

  const validarPaso = () => {
    if (paso === 1 && !tipoProcedimientoId) {
      setError('Seleccione el tipo de procedimiento.')
      return false
    }
    if (paso === 2 && !objetoContrato.trim()) {
      setError('Indique el objeto del contrato.')
      return false
    }
    if (paso === 3) {
      const n = parseFloat(presupuesto)
      if (isNaN(n) || n < 0) {
        setError('Indique un presupuesto válido (número ≥ 0).')
        return false
      }
    }
    setError('')
    return true
  }

  const siguiente = () => {
    if (!validarPaso()) return
    if (paso < 6) setPaso(paso + 1)
  }

  const anterior = () => {
    setError('')
    if (paso > 1) setPaso(paso - 1)
  }

  const crearExpediente = async () => {
    setLoading(true)
    setError('')
    try {
      let codigo = codigoGenerado
      if (!codigo) {
        const res = await supabase.functions.invoke('generate-expediente-code', {
          body: { institucion_id: institucionId, tipo_procedimiento_id: tipoProcedimientoId },
        })
        codigo = res.data?.codigo_expediente ?? `EXP-${Date.now()}`
      }
      if (!estadoBorradorId) throw new Error('Estado borrador no encontrado')

      const { data, error: err } = await supabase
        .schema('core')
        .from('expedientes')
        .insert({
          codigo_expediente: codigo,
          institucion_id: institucionId,
          tipo_procedimiento_id: tipoProcedimientoId,
          estado_expediente_id: estadoBorradorId,
          objeto_contrato: objetoContrato.trim(),
          presupuesto: parseFloat(presupuesto),
          responsable_id: profile?.id ?? null,
        })
        .select('id')
        .single()

      if (err) throw err
      navigate(`/expedientes/${data.id}`, { replace: true })
    } catch (e: any) {
      setError(e.message ?? 'Error al crear el expediente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-institucional-dark">
        Crear expediente de contratación
      </h2>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {PASOS.map((p) => (
          <div
            key={p.id}
            className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              paso === p.id
                ? 'border-institucional-primary bg-institucional-light text-institucional-primary'
                : paso > p.id
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {paso > p.id ? <Check className="h-4 w-4" /> : <span>{p.id}</span>}
            <span className="hidden sm:inline">{p.titulo}</span>
          </div>
        ))}
      </div>

      <Card title={PASOS[paso - 1].titulo} subtitle={PASOS[paso - 1].desc}>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {paso === 1 && (
          <div className="space-y-3">
            <label className="pnccp-label">
              <Tooltip text="Licitación abierta, restringida, concurso o contratación directa. Define el procedimiento legal aplicable.">
                Tipo de procedimiento
              </Tooltip>
            </label>
            <select
              value={tipoProcedimientoId}
              onChange={(e) => setTipoProcedimientoId(e.target.value)}
              className="pnccp-input"
            >
              <option value="">Seleccione...</option>
              {tiposProcedimiento.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigo} – {t.nombre}
                </option>
              ))}
            </select>
            {profile && !profile.institucion_id && (
              <>
                <label className="pnccp-label">Institución</label>
                <select
                  value={institucionId}
                  onChange={(e) => setInstitucionId(e.target.value)}
                  className="pnccp-input"
                >
                  <option value="">Seleccione...</option>
                  {instituciones.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre_oficial}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {paso === 2 && (
          <div>
            <label className="pnccp-label">Objeto del contrato</label>
            <textarea
              value={objetoContrato}
              onChange={(e) => setObjetoContrato(e.target.value)}
              className="pnccp-input min-h-[120px]"
              placeholder="Descripción clara del objeto de la contratación..."
              rows={4}
            />
          </div>
        )}

        {paso === 3 && (
          <div>
            <label className="pnccp-label">
              <Tooltip text="Importe máximo en francos CFA (XAF). No podrá adjudicarse por encima de este valor.">
                Presupuesto (XAF)
              </Tooltip>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              className="pnccp-input"
              placeholder="0"
            />
          </div>
        )}

        {paso === 4 && (
          <p className="text-sm text-gray-600">
            La documentación obligatoria se configurará en una siguiente versión. Puede continuar.
          </p>
        )}

        {paso === 5 && (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-institucional-dark">Resumen de validación</p>
            <ul className="list-inside list-disc text-gray-600">
              <li>Tipo de procedimiento seleccionado</li>
              <li>Objeto del contrato indicado</li>
              <li>Presupuesto válido</li>
              <li>Institución asignada</li>
            </ul>
            {codigoGenerado && (
              <p className="mt-2 font-medium text-institucional-primary">
                Código previsto: {codigoGenerado}
              </p>
            )}
          </div>
        )}

        {paso === 6 && (
          <div className="space-y-4">
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-gray-500">Código</dt>
                <dd className="font-medium">{codigoGenerado ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tipo</dt>
                <dd>{tiposProcedimiento.find((t) => t.id === tipoProcedimientoId)?.nombre ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Objeto</dt>
                <dd className="max-w-md truncate">{objetoContrato || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Presupuesto</dt>
                <dd>
                  {new Intl.NumberFormat('es-GQ', { style: 'currency', currency: 'XAF' }).format(parseFloat(presupuesto) || 0)}
                </dd>
              </div>
            </dl>
            <p className="text-sm text-gray-500">
              Al confirmar se creará el expediente en estado &quot;Borrador&quot;.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-between border-t border-gray-100 pt-4">
          <Button variant="outline" onClick={anterior} icon={<ChevronLeft className="h-4 w-4" />} disabled={paso === 1}>
            Anterior
          </Button>
          {paso < 6 ? (
            <Button onClick={siguiente} icon={<ChevronRight className="h-4 w-4" />}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={crearExpediente} loading={loading} icon={<Check className="h-4 w-4" />}>
              Crear expediente
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
