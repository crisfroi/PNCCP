import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Lock, Mail } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="pnccp-panel text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-institucional-primary text-white">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-institucional-dark">
            Plataforma Nacional de Compras y Contratación Pública
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            República de Guinea Ecuatorial
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="pnccp-label">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pnccp-input pl-10"
                  placeholder="usuario@institucion.gq"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="pnccp-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pnccp-input"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Iniciar sesión
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Acceso restringido a usuarios autorizados del Estado
        </p>
      </div>
    </div>
  )
}
