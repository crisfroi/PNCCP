import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { Shield } from 'lucide-react'

const OPERACIONES_FILTRO = [
  { value: '', label: 'Todas las operaciones' },
  { value: 'INSERT', label: 'INSERT' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
]

export function AuditoriaPage() {
  const { isAuditor, isAdminNacional } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroOperacion, setFiltroOperacion] = useState('')
  const [filtroTabla, setFiltroTabla] = useState('')

  useEffect(() => {
    if (!isAuditor && !isAdminNacional) return
    setLoading(true)
    let q = supabase
      .schema('audit')
      .from('logs')
      .select('id, tabla_afectada, operacion, registro_id, usuario_id, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (filtroOperacion) q = q.eq('operacion', filtroOperacion)
    if (filtroTabla.trim()) q = q.ilike('tabla_afectada', `%${filtroTabla.trim()}%`)
    q.then(({ data, error }) => {
      setLogs(error ? [] : data ?? [])
      setLoading(false)
    })
  }, [isAuditor, isAdminNacional, filtroOperacion, filtroTabla])

  if (!isAuditor && !isAdminNacional) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-institucional-dark">Auditoría</h2>
        <p className="text-gray-500">Solo Auditores y Admin Nacional pueden consultar los logs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-institucional-dark">Auditoría y trazabilidad</h2>
      <Card title="Logs del sistema" subtitle="Registro inmutable de operaciones">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={filtroOperacion}
            onChange={(e) => setFiltroOperacion(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-institucional-primary focus:outline-none focus:ring-1 focus:ring-institucional-primary"
          >
            {OPERACIONES_FILTRO.map((o) => (
              <option key={o.value || 'todas'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={filtroTabla}
            onChange={(e) => setFiltroTabla(e.target.value)}
            placeholder="Filtrar por tabla (ej. expedientes, licitaciones)"
            className="min-w-[220px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-institucional-primary focus:outline-none focus:ring-1 focus:ring-institucional-primary"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Shield className="h-12 w-12 mb-3" />
            <p>No hay registros de auditoría recientes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tabla</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Operación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Registro ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(l.created_at).toLocaleString('es-GQ')}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{l.tabla_afectada}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{l.operacion}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500 truncate max-w-[120px]">
                      {l.registro_id ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
