import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import {
  Building2,
  FileText,
  Gavel,
  TrendingUp,
  AlertCircle,
  BarChart3,
} from 'lucide-react'

export function Dashboard() {
  const { rol, isAdminNacional, isAdminInstitucional, isAuditor, isProveedor, isTecnico } = useAuth()

  if (isProveedor) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-institucional-dark">
          Panel del proveedor
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Mis ofertas" subtitle="Ofertas presentadas">
            <div className="flex items-center gap-4 text-gray-600">
              <Gavel className="h-10 w-10 text-institucional-accent" />
              <p className="text-sm">Consulte el estado de sus ofertas y licitaciones abiertas.</p>
            </div>
          </Card>
          <Card title="Mis contratos" subtitle="Contratos adjudicados">
            <div className="flex items-center gap-4 text-gray-600">
              <FileText className="h-10 w-10 text-institucional-accent" />
              <p className="text-sm">Contratos vigentes y seguimiento de hitos.</p>
            </div>
          </Card>
          <Card title="Mi perfil RNP" subtitle="Registro Nacional de Proveedores">
            <div className="flex items-center gap-4 text-gray-600">
              <Building2 className="h-10 w-10 text-institucional-accent" />
              <p className="text-sm">Documentación y estado en el RNP.</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (isAuditor) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-institucional-dark">
          Panel de auditoría
        </h2>
        <p className="text-gray-600">
          Acceso de solo lectura a expedientes, contratos y proveedores. Use el menú para navegar y exportar datos.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Auditoría" subtitle="Logs y trazabilidad">
            <p className="text-sm text-gray-600">
              Consulte los logs inmutables de todas las operaciones del sistema.
            </p>
          </Card>
          <Card title="Exportación" subtitle="Datos para control">
            <p className="text-sm text-gray-600">
              Exporte expedientes, contratos y estadísticas para análisis externo.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-institucional-dark">
        {isAdminNacional ? 'Dashboard nacional' : isAdminInstitucional ? 'Dashboard institucional' : 'Panel de trabajo'}
      </h2>
      <p className="text-gray-600">
        {isAdminNacional
          ? 'Vista global de instituciones, expedientes y estadísticas del país.'
          : 'Expedientes y licitaciones de su institución.'}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-institucional-light p-3">
              <FileText className="h-8 w-8 text-institucional-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-institucional-dark">—</p>
              <p className="text-sm text-gray-500">Expedientes activos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-institucional-light p-3">
              <Gavel className="h-8 w-8 text-institucional-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-institucional-dark">—</p>
              <p className="text-sm text-gray-500">Licitaciones abiertas</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-institucional-light p-3">
              <TrendingUp className="h-8 w-8 text-institucional-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-institucional-dark">—</p>
              <p className="text-sm text-gray-500">Presupuesto comprometido</p>
            </div>
          </div>
        </Card>
        {isAdminNacional && (
          <Card>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-institucional-light p-3">
                <Building2 className="h-8 w-8 text-institucional-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-institucional-dark">—</p>
                <p className="text-sm text-gray-500">Instituciones</p>
              </div>
            </div>
          </Card>
        )}
      </div>
      <Card title="Acciones rápidas" subtitle="Según su rol">
        <div className="flex flex-wrap gap-3">
          {(isAdminNacional || isAdminInstitucional) && (
            <a
              href="/expedientes/nuevo"
              className="rounded-lg border border-institucional-primary bg-white px-4 py-2 text-sm font-medium text-institucional-primary hover:bg-institucional-light"
            >
              Crear expediente
            </a>
          )}
          <a
            href="/expedientes"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver expedientes
          </a>
          <a
            href="/licitaciones"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver licitaciones
          </a>
        </div>
      </Card>
    </div>
  )
}
