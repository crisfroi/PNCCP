import { FileText, CheckCircle, Archive, AlertCircle } from 'lucide-react'

interface DocumentStatusBadgeProps {
  status: 'generado' | 'enviado' | 'archivado' | 'revocado'
  emissionDate?: string
  hash?: string
  onClick?: () => void
  showHash?: boolean
}

export function DocumentStatusBadge({
  status,
  emissionDate,
  hash,
  onClick,
  showHash = true,
}: DocumentStatusBadgeProps) {
  const statusConfig = {
    generado: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: FileText,
      label: 'Generado',
    },
    enviado: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'Enviado',
    },
    archivado: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      icon: Archive,
      label: 'Archivado',
    },
    revocado: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      label: 'Revocado',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon
  const date = emissionDate ? new Date(emissionDate).toLocaleDateString('es-GQ') : ''

  return (
    <div
      className={`${config.bg} border ${config.border} ${config.text} px-3 py-2 rounded text-sm cursor-pointer hover:shadow-md transition`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`${config.label}${date ? ` - ${date}` : ''}${hash ? ` - Hash: ${hash}` : ''}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="font-medium">{config.label}</span>
      </div>
      {date && <p className="text-xs opacity-75 mt-1">Generado: {date}</p>}
      {showHash && hash && (
        <p className="text-xs opacity-75 mt-1 font-mono">Hash: {hash.substring(0, 12)}...</p>
      )}
    </div>
  )
}
