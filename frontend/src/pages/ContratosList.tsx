import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FileCheck } from 'lucide-react'

export function ContratosList() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .schema('core')
      .from('contratos')
      .select(`
        id, monto_adjudicado, fecha_inicio, fecha_fin, estado, created_at,
        expedientes(codigo_expediente),
        proveedores:rnp.proveedores(razon_social)
      `)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setList(error ? [] : data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-institucional-dark">Contratos</h2>
      <Card title="Contratos adjudicados" subtitle="Vigentes, modificados y terminados">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileCheck className="h-12 w-12 mb-3" />
            <p>No hay contratos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Expediente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Proveedor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Inicio / Fin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {list.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-institucional-primary">
                      {(c.expedientes as any)?.codigo_expediente ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(c.proveedores as any)?.razon_social ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {new Intl.NumberFormat('es-GQ', { style: 'currency', currency: 'XAF' }).format(Number(c.monto_adjudicado))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(c.fecha_inicio).toLocaleDateString('es-GQ')} – {new Date(c.fecha_fin).toLocaleDateString('es-GQ')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge estado={c.estado === 'vigente' ? 'activo' : 'neutro'}>{c.estado}</Badge>
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
