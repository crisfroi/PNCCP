import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { Download, BarChart3 } from 'lucide-react'

interface ReporteData {
  institucion_nombre: string
  totalExpedientes: number
  valorTotal: number
  contratosCerrados: number
  contratosVigentes: number
  tasaAdjudicacion: number
  promedioCiclo: number
}

interface Institucion {
  id: string
  nombre_oficial: string
}

export function ReportePorInstitucion() {
  const { profile, isAdminNacional, isAdminInstitucional } = useAuth()
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [selectedInst, setSelectedInst] = useState<string>('')
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadInstituciones = async () => {
    try {
      const { data, error: err } = await supabase
        .schema('core')
        .from('instituciones')
        .select('id, nombre_oficial')
        .eq('estado', 'activa')
        .order('nombre_oficial')

      if (err) throw err
      setInstituciones(data || [])

      // Si es admin institucional, seleccionar su institución
      if (isAdminInstitucional && profile?.institucion_id) {
        setSelectedInst(profile.institucion_id)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const generateReporte = async (institutionId: string) => {
    setLoading(true)
    setError('')
    try {
      // Cargar datos de expedientes de la institución
      const { data: expedientes, error: expErr } = await supabase
        .schema('core')
        .from('expedientes')
        .select('id, presupuesto, estado_expediente_id, created_at, updated_at')
        .eq('institucion_id', institutionId)

      if (expErr) throw expErr

      // Cargar contratos
      const { data: contratos, error: contratoErr } = await supabase
        .schema('core')
        .from('contratos')
        .select('id, estado, expediente_id')
        .in(
          'expediente_id',
          (expedientes || []).map((e: any) => e.id)
        )

      if (contratoErr) throw contratoErr

      // Calcular métricas
      const totalExp = expedientes?.length || 0
      const valorTotal = (expedientes || []).reduce((sum: number, e: any) => sum + (e.presupuesto || 0), 0)
      const contratosCerrados = (contratos || []).filter((c: any) => c.estado === 'terminado').length
      const contratosVigentes = (contratos || []).filter((c: any) => c.estado === 'vigente').length
      const tasaAdjudicacion = totalExp > 0 ? ((contratos?.length || 0) / totalExp) * 100 : 0

      // Calcular promedio de ciclo (diferencia en días)
      let promedioCiclo = 0
      if (expedientes && expedientes.length > 0) {
        const dias = (expedientes || [])
          .filter((e: any) => e.updated_at && e.created_at)
          .map((e: any) => {
            const inicio = new Date(e.created_at).getTime()
            const fin = new Date(e.updated_at).getTime()
            return (fin - inicio) / (1000 * 60 * 60 * 24) // Convertir a días
          })
        promedioCiclo = dias.length > 0 ? dias.reduce((a: number, b: number) => a + b, 0) / dias.length : 0
      }

      const institución = instituciones.find((i) => i.id === institutionId)

      setReporte({
        institucion_nombre: institución?.nombre_oficial || 'Sin nombre',
        totalExpedientes: totalExp,
        valorTotal,
        contratosCerrados,
        contratosVigentes,
        tasaAdjudicacion: parseFloat(tasaAdjudicacion.toFixed(1)),
        promedioCiclo: parseFloat(promedioCiclo.toFixed(1)),
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReporte = () => {
    if (selectedInst) {
      generateReporte(selectedInst)
    }
  }

  const downloadExcel = () => {
    if (!reporte) return

    // Crear contenido CSV simple
    const headers = ['Métrica', 'Valor']
    const data = [
      ['Institución', reporte.institucion_nombre],
      ['Total Expedientes', reporte.totalExpedientes],
      ['Valor Total (XAF)', reporte.valorTotal.toLocaleString('es-GQ')],
      ['Contratos Cerrados', reporte.contratosCerrados],
      ['Contratos Vigentes', reporte.contratosVigentes],
      ['Tasa de Adjudicación (%)', reporte.tasaAdjudicacion],
      ['Promedio de Ciclo (días)', reporte.promedioCiclo],
    ]

    const csvContent = [headers, ...data].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte-${reporte.institucion_nombre.toLowerCase().replace(/\s+/g, '-')}.csv`)
    link.click()
  }

  useEffect(() => {
    loadInstituciones()
  }, [])

  useEffect(() => {
    if (selectedInst) {
      generateReporte(selectedInst)
    }
  }, [selectedInst])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-institucional-dark">Reporte por Institución</h2>
        <p className="text-sm text-gray-600 mt-1">
          Analiza el desempeño de cada institución en el ciclo de contratación
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Selector de institución */}
      {isAdminNacional && (
        <Card title="Seleccionar Institución" subtitle="Elige una institución para ver su reporte">
          <div className="flex gap-3">
            <select
              value={selectedInst}
              onChange={(e) => setSelectedInst(e.target.value)}
              className="pnccp-input flex-1"
            >
              <option value="">-- Selecciona una institución --</option>
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre_oficial}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
        </div>
      ) : reporte ? (
        <>
          {/* Encabezado del reporte */}
          <Card title={`Reporte: ${reporte.institucion_nombre}`} subtitle="Período actual">
            <div className="flex justify-end mb-4">
              <button
                onClick={downloadExcel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Descargar CSV
              </button>
            </div>

            {/* Métricas principales */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-xs font-medium uppercase text-blue-800">Total Expedientes</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{reporte.totalExpedientes}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-xs font-medium uppercase text-green-800">Valor Total Presupuesto</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {(reporte.valorTotal / 1000000).toFixed(1)}M XAF
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded p-4">
                <p className="text-xs font-medium uppercase text-orange-800">Tasa Adjudicación</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">{reporte.tasaAdjudicacion}%</p>
              </div>
            </div>
          </Card>

          {/* Estado de contratos */}
          <Card title="Estado de Contratos" subtitle="Distribución por estado actual">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-xs font-medium uppercase text-green-800">Contratos Vigentes</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{reporte.contratosVigentes}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <p className="text-xs font-medium uppercase text-gray-800">Contratos Cerrados</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reporte.contratosCerrados}</p>
              </div>
            </div>
          </Card>

          {/* Análisis de desempeño */}
          <Card title="Análisis de Desempeño" subtitle="Indicadores clave de gestión">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <p className="text-xs font-medium uppercase text-blue-800">Promedio de Ciclo</p>
                <p className="text-lg font-semibold text-blue-900 mt-1">{reporte.promedioCiclo} días</p>
                <p className="text-xs text-blue-700 mt-2">
                  Tiempo promedio desde la creación del expediente hasta su cierre
                </p>
              </div>
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                <p className="text-xs font-medium uppercase text-green-800">Cobertura Adjudicatoria</p>
                <p className="text-lg font-semibold text-green-900 mt-1">{reporte.tasaAdjudicacion}%</p>
                <p className="text-xs text-green-700 mt-2">
                  Porcentaje de expedientes que han llegado a adjudicación
                </p>
              </div>
            </div>
          </Card>

          {/* Recomendaciones */}
          <Card title="Observaciones" subtitle="Análisis y recomendaciones">
            <div className="space-y-3">
              {reporte.tasaAdjudicacion < 50 && (
                <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex-shrink-0">⚠️</div>
                  <p className="text-sm text-yellow-800">
                    La tasa de adjudicación es baja. Considere revisar los procesos de licitación
                    para acelerar la adjudicación de expedientes.
                  </p>
                </div>
              )}
              {reporte.promedioCiclo > 60 && (
                <div className="flex gap-3 p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex-shrink-0">⚠️</div>
                  <p className="text-sm text-orange-800">
                    El promedio de ciclo es mayor a 60 días. Se recomienda optimizar los
                    procesos de evaluación y adjudicación.
                  </p>
                </div>
              )}
              {reporte.totalExpedientes === 0 && (
                <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex-shrink-0">ℹ️</div>
                  <p className="text-sm text-blue-800">
                    Sin expedientes registrados para esta institución.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card title="Sin Reporte" subtitle="Selecciona una institución para generar el reporte">
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
            <p>Selecciona una institución para ver el reporte de desempeño</p>
          </div>
        </Card>
      )}
    </div>
  )
}
