import { RotateCcw, Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type { Category, Filters } from '@/types/finance'
import { cn } from '@/utils/cn'

interface TransactionFiltersProps {
  categories: Category[]
  className?: string
  filters: Filters
  onChange: (filters: Partial<Filters>) => void
  onReset: () => void
}

const fieldClasses =
  'min-h-11 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

export function TransactionFilters({ categories, className, filters, onChange, onReset }: TransactionFiltersProps) {
  return (
    <div
      className={cn(
        'grid gap-4 rounded-[1.7rem] border border-outline bg-panel p-4 shadow-card sm:rounded-[2rem] sm:p-5 xl:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.9fr_auto]',
        className,
      )}
    >
      <label className="relative block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-text-muted xl:sr-only">
          Buscar
        </span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          className={`${fieldClasses} pl-11`}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Busca por descripcion, categoria o monto"
          value={filters.query}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-text-muted xl:sr-only">
          Tipo
        </span>
        <select className={fieldClasses} onChange={(event) => onChange({ type: event.target.value as Filters['type'] })} value={filters.type}>
          <option value="all">Todos los tipos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-text-muted xl:sr-only">
          Categoria
        </span>
        <select
          className={fieldClasses}
          onChange={(event) => onChange({ categoryId: event.target.value })}
          value={filters.categoryId}
        >
          <option value="all">Todas las categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-text-muted xl:sr-only">
          Desde
        </span>
        <input
          className={fieldClasses}
          onChange={(event) => onChange({ dateFrom: event.target.value })}
          type="date"
          value={filters.dateFrom}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-text-muted xl:sr-only">
          Hasta
        </span>
        <input
          className={fieldClasses}
          onChange={(event) => onChange({ dateTo: event.target.value })}
          type="date"
          value={filters.dateTo}
        />
      </label>

      <Button className="w-full xl:w-auto" onClick={onReset} variant="secondary">
        <RotateCcw className="h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  )
}
