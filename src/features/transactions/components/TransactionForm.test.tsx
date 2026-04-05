import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { defaultCategories } from '@/data/categories'
import { TransactionForm } from '@/features/transactions/components/TransactionForm'

describe('TransactionForm', () => {
  it('shows validation errors for invalid submissions', async () => {
    const user = userEvent.setup()

    render(<TransactionForm categories={defaultCategories} onSubmit={vi.fn()} />)

    await user.clear(screen.getByLabelText('Fecha'))
    await user.click(screen.getByRole('button', { name: 'Guardar movimiento' }))

    expect(await screen.findByText('Ingresa un monto mayor a cero.')).toBeInTheDocument()
    expect(await screen.findByText('Selecciona una fecha.')).toBeInTheDocument()
  })

  it('submits normalized values when the form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<TransactionForm categories={defaultCategories} onSubmit={onSubmit} />)

    await user.clear(screen.getByLabelText('Monto'))
    await user.type(screen.getByLabelText('Monto'), '1250.5')
    await user.type(screen.getByLabelText('Descripcion'), 'Proyecto freelance')
    await user.click(screen.getByRole('button', { name: /Ingreso/ }))
    await user.selectOptions(screen.getByLabelText('Categoria'), 'freelance')
    await user.click(screen.getByRole('button', { name: 'Guardar movimiento' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'income',
          amount: 1250.5,
          categoryId: 'freelance',
          description: 'Proyecto freelance',
        }),
      )
    })
  })
})
