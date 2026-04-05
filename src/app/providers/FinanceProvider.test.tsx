import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { FinanceProvider } from '@/app/providers/FinanceProvider'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { createInitialFinanceState } from '@/utils/finance'
import { serializeFinanceState } from '@/utils/storage'

const storageKey = 'finance-provider-test'

function ProviderProbe() {
  const { actions, state } = useFinanceStore()

  return (
    <div>
      <span data-testid="theme">{state.theme}</span>
      <span data-testid="currency">{state.currency}</span>
      <span data-testid="count">{state.transactions.length}</span>
      <button onClick={() => actions.setTheme('dark')} type="button">
        dark
      </button>
    </div>
  )
}

describe('FinanceProvider', () => {
  it('hydrates from localStorage and persists theme updates', async () => {
    const persistedState = createInitialFinanceState(new Date('2026-04-05T12:00:00.000Z'))
    persistedState.currency = 'EUR'
    persistedState.transactions = [
      {
        id: 'tx-1',
        type: 'income',
        amount: 900,
        categoryId: 'salary',
        description: 'Pago',
        date: '2026-04-05',
        createdAt: '2026-04-05T12:00:00.000Z',
        updatedAt: '2026-04-05T12:00:00.000Z',
      },
    ]

    window.localStorage.setItem(storageKey, serializeFinanceState(persistedState))

    const user = userEvent.setup()
    const { unmount } = render(
      <FinanceProvider storageKey={storageKey}>
        <ProviderProbe />
      </FinanceProvider>,
    )

    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')
    expect(screen.getByTestId('count')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'dark' }))

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    unmount()

    render(
      <FinanceProvider storageKey={storageKey}>
        <ProviderProbe />
      </FinanceProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}').theme).toBe('dark')
  })
})
