import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { profile, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-institucional-dark">
          PNCCP
        </h1>
        <span className="text-sm text-gray-500">|</span>
        <span className="text-sm text-gray-600">
          {profile?.institucion_nombre ?? 'Plataforma Nacional'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          {profile?.nombre_completo}
        </span>
        <span className="rounded-full bg-institucional-light px-2 py-0.5 text-xs font-medium text-institucional-primary">
          {profile?.rol_nombre ?? '—'}
        </span>
        <Button variant="ghost" size="sm" onClick={() => signOut()} icon={<LogOut className="h-4 w-4" />}>
          Salir
        </Button>
      </div>
    </header>
  )
}
