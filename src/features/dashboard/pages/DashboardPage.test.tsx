import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FinanceProvider } from '@/app/providers/FinanceProvider'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { createInitialFinanceState } from '@/utils/finance'

describe('DashboardPage', () => {
  it('falls back to the previous month when the active month has no movements', () => {
    const state = createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))

    state.transactions = [
      {
        id: 'income-1',
        type: 'income',
        amount: 60720,
        categoryId: 'salary',
        description: 'Salario',
        date: '2026-03-10',
        createdAt: '2026-03-10T12:00:00.000Z',
        updatedAt: '2026-03-10T12:00:00.000Z',
      },
      {
        id: 'expense-1',
        type: 'expense',
        amount: 6500,
        categoryId: 'housing',
        description: 'Alquiler',
        date: '2026-03-12',
        createdAt: '2026-03-12T12:00:00.000Z',
        updatedAt: '2026-03-12T12:00:00.000Z',
      },
    ]

    render(
      <MemoryRouter>
        <FinanceProvider initialState={state} storageKey="dashboard-fallback">
          <DashboardPage />
        </FinanceProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/en abril 2026 aun no hay gastos/i)).toBeInTheDocument()
    expect(screen.getByText(/ultima distribucion disponible de marzo 2026/i)).toBeInTheDocument()
    expect(screen.getByText('Vivienda')).toBeInTheDocument()
    expect(screen.queryByText(/sin gastos para analizar/i)).not.toBeInTheDocument()
  })

  it('does not fall back to the previous month when the active month already has movements', () => {
    const state = createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))

    state.transactions = [
      {
        id: 'expense-previous',
        type: 'expense',
        amount: 6500,
        categoryId: 'housing',
        description: 'Alquiler',
        date: '2026-03-12',
        createdAt: '2026-03-12T12:00:00.000Z',
        updatedAt: '2026-03-12T12:00:00.000Z',
      },
      {
        id: 'income-current',
        type: 'income',
        amount: 2000,
        categoryId: 'salary',
        description: 'Pago parcial',
        date: '2026-04-06',
        createdAt: '2026-04-06T12:00:00.000Z',
        updatedAt: '2026-04-06T12:00:00.000Z',
      },
    ]

    render(
      <MemoryRouter>
        <FinanceProvider initialState={state} storageKey="dashboard-no-fallback">
          <DashboardPage />
        </FinanceProvider>
      </MemoryRouter>,
    )

    expect(screen.queryByText(/ultima distribucion disponible de marzo 2026/i)).not.toBeInTheDocument()
    expect(screen.getByText(/sin gastos para analizar/i)).toBeInTheDocument()
  })
})
