import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FinanceProvider } from '@/app/providers/FinanceProvider'
import { HistoryPage } from '@/features/transactions/pages/HistoryPage'
import { createInitialFinanceState } from '@/utils/finance'

describe('HistoryPage', () => {
  it('renders empty state when there are no transactions', () => {
    render(
      <MemoryRouter>
        <FinanceProvider initialState={createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))} storageKey="history-empty">
          <HistoryPage />
        </FinanceProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Todavia no hay movimientos')).toBeInTheDocument()
  })

  it('deletes a transaction after confirmation', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const state = createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))

    state.transactions = [
      {
        id: 'expense-1',
        type: 'expense',
        amount: 280,
        categoryId: 'food',
        description: 'Mercado semanal',
        date: '2026-04-05',
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T12:00:00.000Z',
      },
    ]

    render(
      <MemoryRouter>
        <FinanceProvider initialState={state} storageKey="history-delete">
          <HistoryPage />
        </FinanceProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])

    await waitFor(() => {
      expect(screen.queryByText('Mercado semanal')).not.toBeInTheDocument()
      expect(screen.getByText('Todavia no hay movimientos')).toBeInTheDocument()
    })

    confirmSpy.mockRestore()
  })
})
