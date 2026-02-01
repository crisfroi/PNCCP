import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Building2, Plus } from 'lucide-react'

const TIPOS = ['ministerio', 'entidad_autonoma', 'empresa_publica', 'administracion_central'] as const
const NIVELES = ['central', 'provincial', 'distrital'] as const

export function InstitucionesList() {
  const { isAdminNacional } = useAuth()
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre_oficial: '', codigo: '', tipo: 'ministerio' as const, nivel: 'central' as const, institucion_padre_id: '' })

  const load = () => {
    supabase
      .schema('core')
      .from('instituciones')
      .select('id, nombre_oficial, codigo, tipo, nivel, estado, created_at')
      .order('nombre_oficial')
      .then(({ data, error }) => {
        setList(error ? [] : data ?? [])
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.nombre_oficial.trim()) { setError('Nombre oficial es obligatorio.'); return }
    setSaving(true)
    const { error: err } = await supabase.schema('core').from('instituciones').insert({
      nombre_oficial: form.nombre_oficial.trim(),
      codigo: form.codigo.trim() || null,
      tipo: form.tipo,
      nivel: form.nivel,
      institucion_padre_id: form.institucion_padre_id || null,
      estado: 'activa',
    })
    if (err) { setError(err.message); setSaving(false); return }
    setForm({ nombre_oficial: '', codigo: '', tipo: 'ministerio', nivel: 'central', institucion_padre_id: '' })
    setShowForm(false)
    load()
    setSaving(false)
  }

  if (!isAdminNacional) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-institucional-dark">Instituciones</h2>
        <p className="text-gray-500">Solo el Admin Nacional puede gestionar instituciones.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-institucional-dark">Gestión institucional</h2>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nueva institución'}
        </Button>
      </div>
      {showForm && (
        <Card title="Nueva institución" subtitle="Registre una nueva institución del Estado">
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="pnccp-label">Nombre oficial</label>
              <input type="text" value={form.nombre_oficial} onChange={(e) => setForm((f) => ({ ...f, nombre_oficial: e.target.value }))} className="pnccp-input" placeholder="Ej. Ministerio de Hacienda" required />
            </div>
            <div>
              <label className="pnccp-label">Código (opcional)</label>
              <input type="text" value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} className="pnccp-input" placeholder="Ej. MINHAC" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="pnccp-label">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any }))} className="pnccp-input">
                  {TIPOS.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="pnccp-label">Nivel</label>
                <select value={form.nivel} onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value as any }))} className="pnccp-input">
                  {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="pnccp-label">Institución padre (opcional)</label>
              <select value={form.institucion_padre_id} onChange={(e) => setForm((f) => ({ ...f, institucion_padre_id: e.target.value }))} className="pnccp-input">
                <option value="">Ninguna</option>
                {list.map((i) => <option key={i.id} value={i.id}>{i.nombre_oficial}</option>)}
              </select>
            </div>
            <Button type="submit" loading={saving}>Crear institución</Button>
          </form>
        </Card>
      )}
      <Card title="Instituciones del Estado" subtitle="Administración Central, Ministerios, Entidades">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-institucional-primary border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Building2 className="h-12 w-12 mb-3" />
            <p>No hay instituciones registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nivel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {list.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{i.nombre_oficial}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{i.codigo ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{i.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{i.nivel}</td>
                    <td className="px-4 py-3">
                      <Badge estado={i.estado === 'activa' ? 'activo' : 'neutro'}>{i.estado}</Badge>
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
