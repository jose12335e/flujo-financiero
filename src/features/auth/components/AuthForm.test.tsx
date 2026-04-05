import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AuthForm } from '@/features/auth/components/AuthForm'

describe('AuthForm', () => {
  it('submits login without requiring confirmPassword', async () => {
    const user = userEvent.setup()
    const onSubmitLogin = vi.fn().mockResolvedValue(undefined)

    render(
      <AuthForm
        errorMessage=""
        infoMessage=""
        isSubmitting={false}
        mode="login"
        onModeChange={vi.fn()}
        onSubmitLogin={onSubmitLogin}
        onSubmitRegister={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText(/correo electronico/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^contrasena$/i), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(onSubmitLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123',
      })
    })
  })

  it('validates confirmPassword only in register mode', async () => {
    const user = userEvent.setup()

    render(
      <AuthForm
        errorMessage=""
        infoMessage=""
        isSubmitting={false}
        mode="register"
        onModeChange={vi.fn()}
        onSubmitLogin={vi.fn()}
        onSubmitRegister={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText(/correo electronico/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^contrasena$/i), 'secret123')
    await user.click(screen.getAllByRole('button', { name: 'Crear cuenta' })[1])

    expect(await screen.findByText(/las contrasenas no coinciden|confirma la contrasena/i)).toBeInTheDocument()
  })
})
