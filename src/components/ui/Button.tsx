import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { buttonStyles, type ButtonSize, type ButtonVariant } from '@/components/ui/buttonStyles'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function Button({
  children,
  className,
  fullWidth,
  size,
  type = 'button',
  variant,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button className={cn(buttonStyles({ variant, size, fullWidth }), className)} type={type} {...props}>
      {children}
    </button>
  )
}
