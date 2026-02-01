import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, RolNombre } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  rol: RolNombre | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdminNacional: boolean
  isAdminInstitucional: boolean
  isAuditor: boolean
  isProveedor: boolean
  isTecnico: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ROLES: RolNombre[] = [
  'Admin Nacional',
  'Admin Institucional',
  'Técnico',
  'Auditor',
  'Proveedor',
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const rol: RolNombre | null = profile?.rol_nombre ?? null

  const loadProfile = async (uid: string) => {
    const { data: p } = await supabase
      .schema('core')
      .from('profiles')
      .select(`
        id, nombre_completo, cargo, email_institucional, telefono,
        institucion_id, rol_sistema_id, estado, fecha_creacion, updated_at,
        roles_sistema ( nombre_rol ),
        instituciones ( nombre_oficial )
      `)
      .eq('id', uid)
      .single()
    if (p) {
      const r = (p as any).roles_sistema?.nombre_rol
      const inst = (p as any).instituciones?.nombre_oficial
      setProfile({
        ...p,
        rol_nombre: ROLES.includes(r) ? r : undefined,
        institucion_nombre: inst,
      } as Profile)
    } else setProfile(null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const value: AuthContextValue = {
    user,
    profile,
    rol,
    loading,
    signIn,
    signOut,
    isAdminNacional: rol === 'Admin Nacional',
    isAdminInstitucional: rol === 'Admin Institucional',
    isAuditor: rol === 'Auditor',
    isProveedor: rol === 'Proveedor',
    isTecnico: rol === 'Técnico',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
