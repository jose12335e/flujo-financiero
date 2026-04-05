import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FinanceProvider } from '@/app/providers/FinanceProvider'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { createInitialFinanceState } from '@/utils/finance'

function SettingsProbe() {
  const { state } = useFinanceStore()

  return (
    <div>
      <span data-testid="probe-currency">{state.currency}</span>
      <span data-testid="probe-theme">{state.theme}</span>
      <span data-testid="probe-count">{state.transactions.length}</span>
    </div>
  )
}

describe('SettingsPage', () => {
  it('updates the selected currency and keeps it in state', async () => {
    const user = userEvent.setup()
    const initialState = createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))

    render(
      <FinanceProvider initialState={initialState} storageKey="settings-currency">
        <SettingsPage />
        <SettingsProbe />
      </FinanceProvider>,
    )

    await user.selectOptions(screen.getByLabelText('Moneda'), 'JPY')
    await user.click(screen.getByRole('button', { name: 'Guardar preferencias' }))

    await waitFor(() => {
      expect(screen.getByTestId('probe-currency')).toHaveTextContent('JPY')
      expect(screen.getByDisplayValue('JPY - Yen japones')).toBeInTheDocument()
      expect(screen.getByText(/preferencias actualizadas/i)).toBeInTheDocument()
    })
  })

  it('resets finance data while preserving theme and currency', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const initialState = createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))

    initialState.currency = 'EUR'
    initialState.theme = 'dark'
    initialState.transactions = [
      {
        id: 'expense-1',
        type: 'expense',
        amount: 80,
        categoryId: 'food',
        description: 'Cena',
        date: '2026-04-05',
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T12:00:00.000Z',
      },
    ]

    render(
      <FinanceProvider initialState={initialState} storageKey="settings-reset">
        <SettingsPage />
        <SettingsProbe />
      </FinanceProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Restablecer datos' }))

    await waitFor(() => {
      expect(screen.getByTestId('probe-count')).toHaveTextContent('0')
      expect(screen.getByTestId('probe-theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('probe-currency')).toHaveTextContent('EUR')
    })

    confirmSpy.mockRestore()
  })
})
