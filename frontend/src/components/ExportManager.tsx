import { Download } from 'lucide-react'

interface ExportManagerProps {
  data: any[]
  filename: string
  format?: 'csv' | 'json'
  buttonLabel?: string
  buttonSize?: 'sm' | 'md' | 'lg'
}

export function ExportManager({
  data,
  filename,
  format = 'csv',
  buttonLabel = 'Exportar',
  buttonSize = 'md',
}: ExportManagerProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    let content = ''
    let type = ''
    let fileExtension = ''

    if (format === 'csv') {
      // Convertir a CSV
      const headers = Object.keys(data[0])
      const rows = data.map((row) =>
        headers.map((header) => {
          const value = row[header]
          // Escapar comillas en valores de texto
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
      )

      content = [headers, ...rows].map((row) => row.join(',')).join('\n')
      type = 'text/csv;charset=utf-8;'
      fileExtension = 'csv'
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      type = 'application/json;charset=utf-8;'
      fileExtension = 'json'
    }

    const blob = new Blob([content], { type })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.${fileExtension}`)
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className={`${sizeClasses[buttonSize]} inline-flex items-center gap-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-medium`}
      title={`Exportar en formato ${format.toUpperCase()}`}
    >
      <Download className="h-4 w-4" />
      {buttonLabel} ({format.toUpperCase()})
    </button>
  )
}
