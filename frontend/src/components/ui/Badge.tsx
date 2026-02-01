type EstadoBadge = 'activo' | 'pendiente' | 'cerrado' | 'alerta' | 'neutro' | 'borrador' | 'publicada'

const styles: Record<EstadoBadge, string> = {
  activo: 'bg-green-100 text-estado-activo',
  pendiente: 'bg-amber-100 text-estado-pendiente',
  cerrado: 'bg-purple-100 text-estado-cerrado',
  alerta: 'bg-red-100 text-estado-alerta',
  neutro: 'bg-gray-100 text-estado-neutro',
  borrador: 'bg-gray-100 text-gray-700',
  publicada: 'bg-blue-100 text-institucional-secondary',
}

interface BadgeProps {
  estado: EstadoBadge | string
  children?: React.ReactNode
}

export function Badge({ estado, children }: BadgeProps) {
  const key = (estado in styles ? estado : 'neutro') as EstadoBadge
  return (
    <span className={`pnccp-badge ${styles[key]}`}>
      {children ?? estado}
    </span>
  )
}
