'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { saveFarmProfile } from './actions'
import type { ExtractedFarmData, FarmAnimalRow, FarmCultivoRow } from '@/lib/karai/farm-extraction'

interface Lead {
  id: string
  excerpt: string
  status: 'new' | 'contacted' | 'closed'
  created_at: string
}

interface Props {
  initialData: ExtractedFarmData
  profileName: string | null
  memberSince: number | null
  leads: Lead[]
}

type Section = 'finca' | 'ganaderia' | 'agricultura' | 'comercial'

const INTERESES_BASE = [
  'Vender ganado gordo',
  'Comprar reposición',
  'Semillas y pasturas',
  'Insumos y agroquímicos',
  'Maquinaria usada',
  'Fletes y transporte',
  'Financiamiento',
  'Servicios veterinarios',
]

const FINCA_FIELDS: (keyof ExtractedFarmData)[] = ['nombre', 'productor', 'depto', 'distrito', 'hectareas', 'telefono']

const LEAD_STATUS_LABEL: Record<Lead['status'], string> = { new: 'Nuevo', contacted: 'Contactado', closed: 'Cerrado' }

function num(v: unknown): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : Number(v) || 0
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} d`
  return new Date(iso).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })
}

const inputClass =
  'w-full bg-[var(--k-bg)] border border-[var(--k-border-strong)] rounded-[11px] px-3.5 py-2.5 text-[var(--k-text)] text-[13.5px] font-medium outline-none transition-colors focus:border-[var(--k-lime)] placeholder:text-[var(--k-muted-3)]'

const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-[var(--k-muted-2)]'

const cellInputClass =
  'w-full bg-transparent border border-transparent rounded-[9px] px-2.5 py-2 text-[13.5px] font-semibold text-[var(--k-text)] outline-none transition-colors hover:bg-[var(--k-bg)] focus:bg-[var(--k-bg)] focus:border-[var(--k-lime)]'

export function MisDatosClient({ initialData, profileName, memberSince, leads }: Props) {
  const [data, setData] = useState<ExtractedFarmData>(initialData)
  const [section, setSection] = useState<Section>('finca')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedLabel, setSavedLabel] = useState('Sin cambios')
  const [error, setError] = useState<string | null>(null)

  const animales = data.animales ?? []
  const cultivos = data.cultivos ?? []
  const intereses = data.intereses ?? {}

  const cabezas = useMemo(() => animales.reduce((t, a) => t + num(a.cantidad), 0), [animales])
  const haCultivo = useMemo(() => cultivos.reduce((t, c) => t + num(c.hectareas), 0), [cultivos])
  const haTotal = num(data.hectareas)
  const cargaAnimal = haTotal ? (cabezas / haTotal).toFixed(2).replace('.', ',') : '—'

  const completeness = useMemo(() => {
    const filled = FINCA_FIELDS.filter((k) => Boolean(data[k])).length + (animales.length ? 1 : 0) + (cultivos.length ? 1 : 0)
    return Math.round((filled / (FINCA_FIELDS.length + 2)) * 100)
  }, [data, animales.length, cultivos.length])

  function markDirty() {
    setSavedLabel('Cambios sin guardar')
  }

  function setField<K extends keyof ExtractedFarmData>(key: K, value: ExtractedFarmData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
    markDirty()
  }

  function updateAnimalRow(i: number, patch: Partial<FarmAnimalRow>) {
    setData((prev) => ({ ...prev, animales: (prev.animales ?? []).map((a, idx) => (idx === i ? { ...a, ...patch } : a)) }))
    markDirty()
  }

  function updateCultivoRow(i: number, patch: Partial<FarmCultivoRow>) {
    setData((prev) => ({ ...prev, cultivos: (prev.cultivos ?? []).map((c, idx) => (idx === i ? { ...c, ...patch } : c)) }))
    markDirty()
  }

  function addAnimal() {
    setData((prev) => ({ ...prev, animales: [...(prev.animales ?? []), { tipo: '', cantidad: 0, raza: '', potrero: '' }] }))
    markDirty()
  }

  function addCultivo() {
    setData((prev) => ({ ...prev, cultivos: [...(prev.cultivos ?? []), { tipo: '', hectareas: 0, variedad: '', estado: 'Sembrado' }] }))
    markDirty()
  }

  function removeAnimal(i: number) {
    setData((prev) => ({ ...prev, animales: (prev.animales ?? []).filter((_, idx) => idx !== i) }))
    markDirty()
  }

  function removeCultivo(i: number) {
    setData((prev) => ({ ...prev, cultivos: (prev.cultivos ?? []).filter((_, idx) => idx !== i) }))
    markDirty()
  }

  function toggleInteres(label: string) {
    setData((prev) => ({ ...prev, intereses: { ...(prev.intereses ?? {}), [label]: !(prev.intereses ?? {})[label] } }))
    markDirty()
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const result = await saveFarmProfile(data)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSavedLabel('Guardado ahora')
  }

  const sections: { id: Section; label: string; count: string }[] = [
    { id: 'finca', label: 'Datos de la finca', count: String(FINCA_FIELDS.filter((k) => Boolean(data[k])).length) },
    { id: 'ganaderia', label: 'Ganadería', count: String(animales.length) },
    { id: 'agricultura', label: 'Agricultura', count: String(cultivos.length) },
    { id: 'comercial', label: 'Comercial', count: String(leads.length) },
  ]

  const orgInitials = (data.nombre || profileName || 'MD').slice(0, 2).toUpperCase()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--k-bg)] text-[var(--k-text)]">
      <header className="shrink-0 h-[62px] border-b border-[var(--k-border)] px-4 md:px-[26px] flex items-center justify-between gap-4 bg-[var(--k-sidebar)]">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button onClick={() => setSidebarOpen((v) => !v)} className="md:hidden text-[var(--k-muted)] text-sm shrink-0">☰</button>
          <Link href="/karai" className="hidden sm:flex items-center gap-2 text-[var(--k-muted)] hover:text-[var(--k-text)] text-[13px] font-semibold transition-colors shrink-0">
            <span className="text-sm">←</span>Volver al chat
          </Link>
          <div className="hidden sm:block w-px h-6 bg-[var(--k-border-strong)] shrink-0" />
          <div className="flex items-center gap-2.5 min-w-0">
            <p className="text-[15px] font-extrabold tracking-[-0.01em] text-[var(--k-text)] truncate">Mis datos</p>
            <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wider text-[var(--k-lime)] bg-[var(--k-lime-bg)] border border-[var(--k-lime-border)] rounded-full px-2.5 py-1">
              Privado
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="hidden md:block text-[11.5px] font-medium text-[var(--k-muted-3)] font-[family-name:var(--font-karai-mono)]">{savedLabel}</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] border-none text-[#0A1424] rounded-[11px] py-2.5 px-[18px] text-[13px] font-bold cursor-pointer transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </header>

      {error && (
        <div className="shrink-0 px-4 md:px-[26px] py-2 bg-[var(--k-negative)]/10 border-b border-[var(--k-negative)]/30 text-[var(--k-negative)] text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <aside
          className={`w-[268px] shrink-0 border-r border-[var(--k-border)] bg-[var(--k-sidebar)] p-4 flex-col gap-5 overflow-y-auto ${
            sidebarOpen ? 'fixed inset-y-[62px] left-0 z-50 flex' : 'hidden md:flex'
          }`}
        >
          <div className="flex flex-col gap-3.5 bg-[#0E1829] border border-[var(--k-border-strong)] rounded-2xl p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 shrink-0 rounded-[13px] bg-[var(--k-user-bubble)] border border-[#23375A] flex items-center justify-center text-[13px] font-bold text-[var(--k-lime)] font-[family-name:var(--font-karai-mono)]">
                {orgInitials}
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <p className="text-[13.5px] font-bold text-[var(--k-text)] truncate">{data.nombre || profileName || 'Tu finca'}</p>
                <p className="text-[11.5px] font-medium text-[var(--k-muted-2)]">{memberSince ? `Miembro desde ${memberSince}` : 'Miembro de Agroconecta'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--k-muted-2)]">Perfil completo</p>
                <p className="text-xs font-bold text-[var(--k-lime)] font-[family-name:var(--font-karai-mono)]">{completeness}%</p>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--k-border-strong)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8FD63F] to-[var(--k-lime)]" style={{ width: `${completeness}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="m-0 px-2 pb-1.5 text-[10.5px] font-bold tracking-[.1em] uppercase text-[var(--k-muted-3)]">Secciones</p>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSection(s.id); setSidebarOpen(false) }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[11px] text-left transition-colors ${
                  section === s.id ? 'bg-[var(--k-user-bubble)]' : 'hover:bg-[#101B2E]'
                }`}
              >
                <p className={`flex-1 text-[13px] ${section === s.id ? 'font-semibold text-[var(--k-text)]' : 'font-medium text-[var(--k-muted)]'}`}>{s.label}</p>
                <p className={`text-[11px] font-semibold font-[family-name:var(--font-karai-mono)] ${section === s.id ? 'text-[var(--k-lime)]' : 'text-[var(--k-muted-3)]'}`}>
                  {s.count}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-auto bg-[#0E1829] border border-[var(--k-border)] rounded-[14px] p-3.5 flex flex-col gap-1.5">
            <p className="text-xs font-bold text-[var(--k-text)]">Karai completa esto por vos</p>
            <p className="text-[11.5px] font-medium leading-relaxed text-[var(--k-muted-2)]">
              Contale por chat lo que cambió en la finca y se actualiza acá solo.
            </p>
          </div>
        </aside>

        <div className="flex-1 min-w-0 overflow-y-auto p-5 md:p-[30px]">
          <div className="max-w-[940px] mx-auto flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="Superficie total" value={haTotal ? haTotal.toLocaleString('es-PY') : '—'} sub={`hectáreas${data.depto ? ` · ${data.depto}` : ''}`} />
              <KpiCard label="Cabezas" value={cabezas.toLocaleString('es-PY')} sub="animales cargados" />
              <KpiCard label="Área sembrada" value={haCultivo.toLocaleString('es-PY')} sub={`ha en ${cultivos.length} cultivos`} />
              <KpiCard label="Carga animal" value={cargaAnimal} sub="UA por hectárea" />
            </div>

            {section === 'finca' && (
              <Card title="Datos de la finca" subtitle="Identificación, ubicación y contacto principal" tag={`${FINCA_FIELDS.filter((k) => Boolean(data[k])).length} campos`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre de la finca">
                    <input className={inputClass} value={data.nombre ?? ''} onChange={(e) => setField('nombre', e.target.value)} />
                  </Field>
                  <Field label="Productor responsable">
                    <input className={inputClass} value={data.productor ?? ''} onChange={(e) => setField('productor', e.target.value)} />
                  </Field>
                  <Field label="Departamento">
                    <input className={inputClass} value={data.depto ?? ''} onChange={(e) => setField('depto', e.target.value)} />
                  </Field>
                  <Field label="Distrito / colonia">
                    <input className={inputClass} value={data.distrito ?? ''} onChange={(e) => setField('distrito', e.target.value)} />
                  </Field>
                  <Field label="Hectáreas totales">
                    <input
                      type="number"
                      min="0"
                      className={`${inputClass} font-[family-name:var(--font-karai-mono)]`}
                      value={data.hectareas ?? ''}
                      onChange={(e) => setField('hectareas', Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Teléfono / WhatsApp">
                    <input
                      className={`${inputClass} font-[family-name:var(--font-karai-mono)]`}
                      value={data.telefono ?? ''}
                      onChange={(e) => setField('telefono', e.target.value)}
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Notas de la finca">
                      <input className={inputClass} value={data.notas ?? ''} onChange={(e) => setField('notas', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </Card>
            )}

            {section === 'ganaderia' && (
              <Card
                title="Ganadería"
                subtitle="Rodeo por categoría, raza y potrero"
                action={<HeaderButton onClick={addAnimal}>+ Agregar categoría</HeaderButton>}
              >
                <TableHead cols={['Categoría', 'Cabezas', 'Raza', 'Potrero', '']} />
                <div className="flex flex-col">
                  {animales.map((a, i) => (
                    <div key={i} className="grid grid-cols-[1.4fr_.8fr_1.1fr_1.1fr_40px] items-center gap-0 px-5 md:px-[22px] py-1.5 border-b border-[#101B2E]">
                      <input className={cellInputClass} value={a.tipo} onChange={(e) => updateAnimalRow(i, { tipo: e.target.value })} />
                      <input
                        className={`${cellInputClass} text-right font-[family-name:var(--font-karai-mono)]`}
                        value={a.cantidad || ''}
                        onChange={(e) => updateAnimalRow(i, { cantidad: Number(e.target.value) })}
                      />
                      <input className={`${cellInputClass} ml-3.5 text-[var(--k-muted)]`} value={a.raza ?? ''} onChange={(e) => updateAnimalRow(i, { raza: e.target.value })} />
                      <input className={`${cellInputClass} ml-3.5 text-[var(--k-muted)]`} value={a.potrero ?? ''} onChange={(e) => updateAnimalRow(i, { potrero: e.target.value })} />
                      <RowDelete onClick={() => removeAnimal(i)} />
                    </div>
                  ))}
                  {animales.length === 0 && <EmptyRow />}
                </div>
                <TableFooter left={`${animales.length} categorías cargadas`} right={`Total ${cabezas.toLocaleString('es-PY')} cabezas`} />
              </Card>
            )}

            {section === 'agricultura' && (
              <Card
                title="Agricultura"
                subtitle="Cultivos, superficie y estado de la zafra"
                action={<HeaderButton onClick={addCultivo}>+ Agregar cultivo</HeaderButton>}
              >
                <TableHead cols={['Cultivo', 'Hectáreas', 'Variedad', 'Estado', '']} />
                <div className="flex flex-col">
                  {cultivos.map((c, i) => (
                    <div key={i} className="grid grid-cols-[1.3fr_.8fr_1.1fr_1.1fr_40px] items-center gap-0 px-5 md:px-[22px] py-1.5 border-b border-[#101B2E]">
                      <input className={cellInputClass} value={c.tipo} onChange={(e) => updateCultivoRow(i, { tipo: e.target.value })} />
                      <input
                        className={`${cellInputClass} text-right font-[family-name:var(--font-karai-mono)]`}
                        value={c.hectareas || ''}
                        onChange={(e) => updateCultivoRow(i, { hectareas: Number(e.target.value) })}
                      />
                      <input className={`${cellInputClass} ml-3.5 text-[var(--k-muted)]`} value={c.variedad ?? ''} onChange={(e) => updateCultivoRow(i, { variedad: e.target.value })} />
                      <input className={`${cellInputClass} ml-3.5 text-[var(--k-muted)]`} value={c.estado ?? ''} onChange={(e) => updateCultivoRow(i, { estado: e.target.value })} />
                      <RowDelete onClick={() => removeCultivo(i)} />
                    </div>
                  ))}
                  {cultivos.length === 0 && <EmptyRow />}
                </div>
                <TableFooter left="Zafra actual" right={`Total ${haCultivo.toLocaleString('es-PY')} ha`} />
              </Card>
            )}

            {section === 'comercial' && (
              <div className="flex flex-col gap-5">
                <Card title="Intereses comerciales" subtitle="Karai avisa a Agroconecta cuando aparece una oportunidad que encaja">
                  <div className="px-5 md:px-[22px] py-[18px] flex flex-wrap gap-2">
                    {INTERESES_BASE.map((label) => {
                      const on = Boolean(intereses[label])
                      return (
                        <button
                          key={label}
                          onClick={() => toggleInteres(label)}
                          className={`rounded-full py-2 px-3.5 text-[13px] font-semibold transition-colors ${
                            on
                              ? 'bg-[var(--k-lime-bg)] border border-[var(--k-lime-border)] text-[#CDF585]'
                              : 'bg-[var(--k-bg)] border border-[var(--k-border-strong)] text-[var(--k-muted)] hover:border-[var(--k-border-hover)] hover:text-[var(--k-text-soft)]'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </Card>

                <Card title="Tus consultas comerciales" subtitle="Lo que le pediste a Karai que le avise a Agroconecta">
                  <div className="px-5 md:px-[22px] pb-[18px] pt-1 flex flex-col">
                    {leads.map((l) => (
                      <div key={l.id} className="flex items-center gap-4 py-3.5 border-b border-[#101B2E] last:border-b-0">
                        <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wider text-[var(--k-lime)] bg-[var(--k-lime-bg)] border border-[var(--k-lime-border)] rounded-[7px] py-1 px-2.5">
                          {LEAD_STATUS_LABEL[l.status]}
                        </span>
                        <p className="flex-1 min-w-0 text-[13.5px] font-medium text-[var(--k-text)] line-clamp-1">{l.excerpt}</p>
                        <p className="shrink-0 text-[11.5px] font-medium text-[var(--k-muted-2)]">{timeAgo(l.created_at)}</p>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <p className="text-[var(--k-muted-2)] text-[13px] py-3">
                        Todavía no le pediste a Karai que avise ninguna oportunidad — usá el botón &quot;Avisar a Agroconecta&quot; en el chat.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--k-sidebar)] border border-[var(--k-border)] rounded-2xl p-4 md:p-5">
              <p className="text-[12.5px] font-medium leading-relaxed text-[var(--k-muted-2)] max-w-[560px]">
                Estos datos son solo tuyos. Agroconecta los usa únicamente para acercarte oportunidades que encajen con tu finca.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[var(--k-card)] border border-[var(--k-border-strong)] rounded-[15px] p-4 flex flex-col gap-2">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--k-muted-2)]">{label}</p>
      <p className="text-[26px] font-bold tracking-[-0.02em] text-[var(--k-text)] font-[family-name:var(--font-karai-mono)]">{value}</p>
      <p className="text-[11.5px] font-semibold text-[var(--k-muted)]">{sub}</p>
    </div>
  )
}

function Card({
  title,
  subtitle,
  tag,
  action,
  children,
}: {
  title: string
  subtitle: string
  tag?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-[var(--k-card)] border border-[var(--k-border-strong)] rounded-[18px] overflow-hidden">
      <div className="px-5 md:px-[22px] py-[18px] border-b border-[var(--k-border)] flex items-center justify-between gap-3.5 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="text-[14.5px] font-bold text-[var(--k-text)] tracking-[-0.01em]">{title}</p>
          <p className="text-xs font-medium text-[var(--k-muted-2)]">{subtitle}</p>
        </div>
        {tag && (
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--k-muted)] bg-[#111C31] border border-[var(--k-border-strong)] rounded-full py-1.5 px-2.5">
            {tag}
          </span>
        )}
        {action}
      </div>
      <div className="py-5 md:py-[20px]">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 px-5 md:px-0 md:[&:not(:first-child)]:px-0">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

function TableHead({ cols }: { cols: string[] }) {
  return (
    <div
      className="grid gap-0 px-5 md:px-[22px] py-2.5 border-b border-[var(--k-border)] bg-[var(--k-sidebar)]"
      style={{ gridTemplateColumns: cols.length === 5 ? '1.4fr .8fr 1.1fr 1.1fr 40px' : undefined }}
    >
      {cols.map((c, i) => (
        <p key={i} className={`m-0 text-[10.5px] font-bold uppercase tracking-wider text-[var(--k-muted-2)] ${i === 1 ? 'text-right pr-3.5' : i > 1 ? 'pl-3.5' : ''}`}>
          {c}
        </p>
      ))}
    </div>
  )
}

function TableFooter({ left, right }: { left: string; right: string }) {
  return (
    <div className="px-5 md:px-[22px] py-3.5 flex items-center justify-between gap-3.5 bg-[var(--k-sidebar)] mt-2">
      <p className="text-xs font-semibold text-[var(--k-muted)]">{left}</p>
      <p className="text-[13px] font-bold text-[var(--k-text)] font-[family-name:var(--font-karai-mono)]">{right}</p>
    </div>
  )
}

function EmptyRow() {
  return <p className="px-5 md:px-[22px] py-4 text-[var(--k-muted-2)] text-[13px]">Sin filas todavía — agregá la primera.</p>
}

function RowDelete({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="justify-self-end w-[30px] h-[30px] rounded-[9px] bg-transparent border-none text-[var(--k-muted-4)] hover:text-[var(--k-negative)] transition-colors">
      ✕
    </button>
  )
}

function HeaderButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#111C31] border border-[var(--k-border-strong)] hover:border-[var(--k-lime)] text-[var(--k-text)] rounded-[10px] py-2 px-3.5 text-[12.5px] font-semibold transition-colors"
    >
      {children}
    </button>
  )
}
