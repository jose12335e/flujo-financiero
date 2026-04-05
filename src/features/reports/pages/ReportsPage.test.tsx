import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FinanceProvider } from '@/app/providers/FinanceProvider'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { createInitialFinanceState } from '@/utils/finance'

describe('ReportsPage', () => {
  it('renders empty report states without transactions', () => {
    render(
      <FinanceProvider initialState={createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))} storageKey="reports-empty">
        <ReportsPage />
      </FinanceProvider>,
    )

    expect(screen.getByText(/sin informacion para este grafico/i)).toBeInTheDocument()
    expect(screen.getByText(/no hay gastos registrados en el periodo seleccionado/i)).toBeInTheDocument()
    expect(screen.getByText(/indicadores clave/i)).toBeInTheDocument()
  })
})
