import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Gavel, Search } from 'lucide-react'

const ESTADOS_FILTRO = [
  { value: '', label: 'Todos los estados' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'publicada', label: 'Publicada' },
  { value: 'cerrada', label: 'Cerrada' },
  { value: 'adjudicada', label: 'Adjudicada' },
]

export function LicitacionesList() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    setLoading(true)
    let q = supabase
      .schema('procurement')
      .from('licitaciones')
      .select(`
        id, fecha_publicacion, fecha_cierre, estado, created_at,
        expedientes(codigo_expediente, objeto_contrato)
      `)
      .order('fecha_cierre', { ascending: false })
    if (filtroEstado) q = q.eq('estado', filtroEstado)
    q.then(({ data, error }) => {
      setList(error ? [] : data ?? [])
      setLoading(false)
    })
  }, [filtroEstado])

  const listFiltrada = useMemo(() => {
    if (!busqueda.trim()) return list
    const b = busqueda.trim().toLowerCase()
    return list.filter((l) => {
      const codigo = (l.expedientes as any)?.codigo_expediente ?? ''
      const objeto = (l.expedientes as any)?.objeto_contrato ?? ''
      return codigo.toLowerCase().includes(b) || objeto.toLowerCase().includes(b)
    })
  }, [list, busqueda])

  const estadoBadge: Record<string, string> = {
    borrador: 'borrador',
    publicada: 'publicada',
    cerrada: 'cerrado',
    adjudicada: 'activo',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-institucional-dark">Licitaciones</h2>
      <Card title="Licitaciones electrónicas" subtitle="Publicadas, en curso y cerradas">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-institucional-primary focus:outline-none focus:ring-1 focus:ring-institucional-primary"
          >
            {ESTADOS_FILTRO.map((o) => (
              <option key={o.value || 'todos'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por expediente u objeto..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-institucional-primary focus:outline-none focus:ring-1 focus:ring-institucional-primary"
            />
          </span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
          </div>
        ) : listFiltrada.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Gavel className="h-12 w-12 mb-3" />
            <p>{list.length === 0 ? 'No hay licitaciones.' : 'Ningún resultado con los filtros aplicados.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Expediente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Publicación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Cierre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {listFiltrada.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium text-institucional-primary">
                        {(l.expedientes as any)?.codigo_expediente ?? l.id}
                      </span>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{(l.expedientes as any)?.objeto_contrato}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge estado={estadoBadge[l.estado] ?? 'neutro'}>{l.estado}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {l.fecha_publicacion ? new Date(l.fecha_publicacion).toLocaleDateString('es-GQ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {l.fecha_cierre ? new Date(l.fecha_cierre).toLocaleDateString('es-GQ') : '—'}
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
