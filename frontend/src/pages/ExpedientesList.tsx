import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Search, FileText } from 'lucide-react'
import type { Expediente } from '@/types'

const estadoMap: Record<string, string> = {
  borrador: 'borrador',
  en_tramite: 'pendiente',
  licitacion: 'publicada',
  evaluacion: 'pendiente',
  adjudicado: 'activo',
  contratado: 'activo',
  ejecucion: 'activo',
  cerrado: 'cerrado',
}

export function ExpedientesList() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const load = async () => {
      const q = supabase
        .schema('core')
        .from('expedientes')
        .select(`
          id, codigo_expediente, objeto_contrato, presupuesto, fecha_creacion,
          tipo_procedimiento:tipos_procedimiento(codigo, nombre),
          estado_expediente:estados_expediente(codigo, nombre)
        `)
        .order('fecha_creacion', { ascending: false })

      const { data, error } = await q
      if (error) {
        console.error(error)
        setExpedientes([])
      } else setExpedientes(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtrados = expedientes.filter((e) => {
    const matchEstado = !filtroEstado || (e as any).estado_expediente?.codigo === filtroEstado
    const matchBusqueda =
      !busqueda ||
      e.codigo_expediente.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.objeto_contrato.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-institucional-dark">
          Expedientes de contratación
        </h2>
        <Link to="/expedientes/nuevo">
          <Button icon={<Plus className="h-4 w-4" />}>Nuevo expediente</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por código o objeto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pnccp-input pl-10 max-w-xs"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="pnccp-input max-w-[200px]"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="en_tramite">En trámite</option>
            <option value="licitacion">En licitación</option>
            <option value="evaluacion">En evaluación</option>
            <option value="adjudicado">Adjudicado</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mb-3" />
            <p>No hay expedientes que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Objeto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Procedimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Presupuesto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtrados.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-institucional-primary">
                      <Link to={`/expedientes/${exp.id}`}>{exp.codigo_expediente}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {exp.objeto_contrato}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(exp as any).tipo_procedimiento?.nombre ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge estado={estadoMap[(exp as any).estado_expediente?.codigo] ?? 'neutro'}>
                        {(exp as any).estado_expediente?.nombre ?? '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {new Intl.NumberFormat('es-GQ', { style: 'currency', currency: 'XAF' }).format(Number(exp.presupuesto))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(exp.fecha_creacion).toLocaleDateString('es-GQ')}
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
