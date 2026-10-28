import type { TagGroup } from '@/lib/content-tags'
import { Help } from './ui'

interface Props {
  groups: TagGroup[]
  selected?: string[]
}

// Etiquetas de un contenido, agrupadas por categoría (se manejan en /admin/intereses). Manda los valores
// elegidos como `tags` en el formulario; la acción los guarda con saveContentTags.
export function TagPicker({ groups, selected = [] }: Props) {
  const chosen = new Set(selected)
  if (groups.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <label className="text-sm font-medium text-foreground">
          Etiquetas
          <Help text="Temas puntuales del contenido (soja, sésamo, tambo…). Se le recomienda y se le avisa a quien sigue esas etiquetas. Podés elegir varias, de distintas categorías." />
        </label>
        <a href="/admin/intereses?tipo=produccion" target="_blank" className="text-xs text-muted hover:text-foreground">
          Agregar etiquetas ↗
        </a>
      </div>
      <div className="space-y-3">
        {groups.map((g) => (
          <fieldset key={g.category}>
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">{g.label}</legend>
            <div className="flex flex-wrap gap-2">
              {g.tags.map((t) => (
                <label key={t.value} className="cursor-pointer select-none">
                  <input type="checkbox" name="tags" value={t.value} defaultChecked={chosen.has(t.value)} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-bdr bg-secondary px-3 py-1.5 text-xs text-muted transition-colors peer-checked:border-lime peer-checked:bg-lime/15 peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-lime">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  )
}
