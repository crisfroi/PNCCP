import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { Users } from 'lucide-react'

export function ProveedoresList() {
  const { rol, isProveedor } = useAuth()
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .schema('rnp')
      .from('proveedores')
      .select('id, razon_social, tipo, nif, pais, estado, fecha_registro')
      .order('razon_social')
      .then(({ data, error }) => {
        setList(error ? [] : data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-institucional-dark">Registro Nacional de Proveedores (RNP)</h2>
      <Card title="Proveedores del Estado" subtitle="Empresas, autónomos y consorcios habilitados">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="h-12 w-12 mb-3" />
            <p>{isProveedor ? 'No tiene perfil de proveedor asociado.' : 'No hay proveedores registrados.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Razón social</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">NIF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">País</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.razon_social}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.nif ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.pais}</td>
                    <td className="px-4 py-3">
                      <Badge
                        estado={
                          p.estado === 'activo' ? 'activo' : p.estado === 'suspendido' ? 'alerta' : 'neutro'
                        }
                      >
                        {p.estado}
                      </Badge>
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
