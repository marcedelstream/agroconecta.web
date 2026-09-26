import Link from 'next/link'
import { CheckCircle2, CircleHelp, Info, TriangleAlert } from 'lucide-react'

// Piezas compartidas del panel (rediseño 2026-09): mismo encabezado, ayudas, estados vacíos y avisos
// en todas las pantallas, para que quien recién empieza aprenda una sola forma de usarlo.

interface PageHeaderProps {
  title: string
  /** "¿Para qué sirve?": una o dos líneas, en simple. */
  help: string
  actions?: React.ReactNode
}

export function PageHeader({ title, help, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display font-bold text-[28px] leading-tight text-foreground">{title}</h1>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="flex gap-3 rounded-2xl border border-lime/40 bg-lime/10 px-4 py-3">
        <Info size={18} className="shrink-0 mt-0.5 text-lime" aria-hidden />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-semibold">¿Para qué sirve? </span>
          {help}
        </p>
      </div>
    </div>
  )
}

/** "?" al lado de un campo que no es obvio. El texto aparece al pasar el mouse o al tocarlo. */
export function Help({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group align-middle ml-1" tabIndex={0} aria-label={text}>
      <CircleHelp size={15} className="text-muted group-hover:text-foreground" aria-hidden />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-6 z-30 w-60 -translate-x-1/2 rounded-xl bg-foreground px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}

/** Etiqueta de campo con su ayuda opcional. */
export function FieldLabel({ children, help, htmlFor }: { children: React.ReactNode; help?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground mb-1.5">
      {children}
      {help && <Help text={help} />}
    </label>
  )
}

/** Lista vacía que enseña qué hacer. */
export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 px-6 py-10">
      <p className="font-display font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted max-w-md">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Aviso verde o rojo después de una acción (se lee de ?ok= / ?error= en la URL). */
export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null
  const good = !!ok && !error
  const Icon = good ? CheckCircle2 : TriangleAlert
  return (
    <div
      role="status"
      className={`mb-6 flex gap-3 rounded-2xl border px-4 py-3 text-sm ${
        good ? 'border-success/40 bg-success/10 text-foreground' : 'border-danger/40 bg-danger/10 text-foreground'
      }`}
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${good ? 'text-success' : 'text-danger'}`} aria-hidden />
      <p>{error ?? ok}</p>
    </div>
  )
}

/** Pestañas para secciones con más de una pantalla (ej. Publicidad: Banners / Reporte). */
export function SectionTabs({ tabs, current }: { tabs: { href: string; label: string }[]; current: string }) {
  return (
    <div className="mb-6 inline-flex gap-1 rounded-2xl bg-secondary p-1" role="tablist">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          role="tab"
          aria-selected={t.href === current}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            t.href === current ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}

/** Título de bloque dentro de una pantalla. */
export function SectionTitle({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <h2 className="font-display font-semibold text-lg text-foreground mb-3">
      {children}
      {help && <Help text={help} />}
    </h2>
  )
}
