import { RotateCcw, Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type { Category, Filters } from '@/types/finance'

interface TransactionFiltersProps {
  categories: Category[]
  filters: Filters
  onChange: (filters: Partial<Filters>) => void
  onReset: () => void
}

const fieldClasses =
  'min-h-11 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

export function TransactionFilters({ categories, filters, onChange, onReset }: TransactionFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[2rem] border border-outline bg-panel p-5 shadow-card xl:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.9fr_auto]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          className={`${fieldClasses} pl-11`}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Busca por descripcion, categoria o monto"
          value={filters.query}
        />
      </label>

      <select className={fieldClasses} onChange={(event) => onChange({ type: event.target.value as Filters['type'] })} value={filters.type}>
        <option value="all">Todos los tipos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Gastos</option>
      </select>

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

      <input
        className={fieldClasses}
        onChange={(event) => onChange({ dateFrom: event.target.value })}
        type="date"
        value={filters.dateFrom}
      />

      <input
        className={fieldClasses}
        onChange={(event) => onChange({ dateTo: event.target.value })}
        type="date"
        value={filters.dateTo}
      />

      <Button onClick={onReset} variant="secondary">
        <RotateCcw className="h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  )
}
