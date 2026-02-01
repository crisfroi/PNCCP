import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { Users, FileText } from 'lucide-react'

export function MiPerfilRNP() {
  const { user } = useAuth()
  const [proveedor, setProveedor] = useState<any>(null)
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    supabase
      .schema('rnp')
      .from('proveedores')
      .select('id, razon_social, tipo, nif, pais, estado, fecha_registro')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setProveedor(data)
        if (data?.id) {
          supabase
            .schema('rnp')
            .from('proveedor_documentos')
            .select('id, tipo_documento, fecha_vencimiento, estado, created_at')
            .eq('proveedor_id', data.id)
            .order('created_at', { ascending: false })
            .then(({ data: docs }) => setDocumentos(docs?.data ?? []))
        }
        setLoading(false)
      })
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-institucional-dark">Mi perfil RNP</h2>
        <Card title="Sin perfil de proveedor" subtitle="Registro Nacional de Proveedores">
          <p className="text-gray-600">
            No tiene un perfil de proveedor asociado a su cuenta. Contacte con la administración para darse de alta en el RNP.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-institucional-dark">Mi perfil RNP</h2>
      <Card title="Datos del proveedor" subtitle="Registro Nacional de Proveedores del Estado">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Razón social</p>
            <p className="mt-1 font-medium text-gray-900">{proveedor.razon_social}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Tipo</p>
            <p className="mt-1 text-gray-700">{proveedor.tipo}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">NIF</p>
            <p className="mt-1 text-gray-700">{proveedor.nif ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">País</p>
            <p className="mt-1 text-gray-700">{proveedor.pais}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Estado</p>
            <p className="mt-1">
              <Badge estado={proveedor.estado === 'activo' ? 'activo' : proveedor.estado === 'suspendido' ? 'alerta' : 'neutro'}>
                {proveedor.estado}
              </Badge>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Fecha de registro</p>
            <p className="mt-1 text-gray-700">{proveedor.fecha_registro ? new Date(proveedor.fecha_registro).toLocaleDateString('es-GQ') : '—'}</p>
          </div>
        </div>
      </Card>
      <Card title="Documentos" subtitle="Documentación en el RNP">
        {documentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <FileText className="h-10 w-10 mb-2" />
            <p>No hay documentos registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Vencimiento</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documentos.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{d.tipo_documento}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-GQ') : '—'}</td>
                    <td className="px-4 py-2">
                      <Badge estado={d.estado === 'vigente' ? 'activo' : d.estado === 'vencido' ? 'alerta' : 'neutro'}>{d.estado}</Badge>
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
