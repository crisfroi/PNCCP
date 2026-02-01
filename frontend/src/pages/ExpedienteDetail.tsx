import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export function ExpedienteDetail() {
  const { id } = useParams<{ id: string }>()
  const [exp, setExp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .schema('core')
      .from('expedientes')
      .select(`
        *,
        tipo_procedimiento:tipos_procedimiento(codigo, nombre),
        estado_expediente:estados_expediente(codigo, nombre),
        institucion:instituciones(nombre_oficial, codigo)
      `)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        setExp(error ? null : data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
      </div>
    )
  }
  if (!exp) {
    return (
      <div className="space-y-4">
        <Link to="/expedientes" className="inline-flex items-center gap-2 text-sm text-institucional-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver a expedientes
        </Link>
        <p className="text-gray-500">Expediente no encontrado.</p>
      </div>
    )
  }

  const estadoCodigo = exp.estado_expediente?.codigo ?? ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/expedientes" className="inline-flex items-center gap-2 text-sm text-institucional-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Expedientes
        </Link>
      </div>
      <Card title={exp.codigo_expediente} subtitle={(exp.institucion as any)?.nombre_oficial}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Objeto del contrato</p>
            <p className="mt-1 text-gray-800">{exp.objeto_contrato}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Estado</p>
            <p className="mt-1">
              <Badge estado={estadoCodigo === 'cerrado' ? 'cerrado' : estadoCodigo === 'borrador' ? 'borrador' : 'activo'}>
                {exp.estado_expediente?.nombre ?? '—'}
              </Badge>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Tipo de procedimiento</p>
            <p className="mt-1 text-gray-800">{(exp.tipo_procedimiento as any)?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Presupuesto</p>
            <p className="mt-1 text-gray-800">
              {new Intl.NumberFormat('es-GQ', { style: 'currency', currency: 'XAF' }).format(Number(exp.presupuesto))}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Fecha de creación</p>
            <p className="mt-1 text-gray-800">{new Date(exp.fecha_creacion).toLocaleDateString('es-GQ')}</p>
          </div>
        </div>
      </Card>
      {/* Próximo paso: qué hacer según estado */}
      <Card title="Próximo paso" subtitle="Acciones sugeridas según el estado del expediente">
        {estadoCodigo === 'borrador' && (
          <p className="text-sm text-gray-700">
            Este expediente está en borrador. <strong>Próximo paso:</strong> crear la licitación asociada (fechas de publicación y cierre) para poder recibir ofertas. Use el módulo de Licitaciones cuando esté listo.
          </p>
        )}
        {estadoCodigo === 'licitacion' && (
          <p className="text-sm text-gray-700">
            La licitación está publicada. A la fecha de cierre se procederá a la apertura de ofertas y evaluación.
          </p>
        )}
        {estadoCodigo === 'evaluacion' && (
          <p className="text-sm text-gray-700">
            En fase de evaluación. Complete las puntuaciones técnica y económica de cada oferta para generar el ranking y la adjudicación.
          </p>
        )}
        {estadoCodigo === 'adjudicado' && (
          <p className="text-sm text-gray-700">
            Adjudicado. Formalice el contrato con el proveedor adjudicatario para pasar a ejecución.
          </p>
        )}
        {estadoCodigo === 'cerrado' && (
          <p className="text-sm text-gray-500">Expediente cerrado. No hay acciones pendientes.</p>
        )}
        {!['borrador', 'licitacion', 'evaluacion', 'adjudicado', 'cerrado'].includes(estadoCodigo) && (
          <p className="text-sm text-gray-500">Consulte el flujo de contratación según el estado actual.</p>
        )}
      </Card>
    </div>
  )
}
