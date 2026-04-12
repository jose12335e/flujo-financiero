export function resolveSupabaseSyncErrorMessage(error: unknown, phase: 'load' | 'save') {
  const fallbackMessage =
    phase === 'load'
      ? 'No pudimos conectar con tu cuenta. La app sigue disponible en este equipo.'
      : 'Hubo un problema al sincronizar. Tus cambios siguen guardados en este equipo.'

  if (!(error instanceof Error)) {
    return fallbackMessage
  }

  const normalizedMessage = error.message.toLowerCase()

  if (
    normalizedMessage.includes('finance_settings') ||
    normalizedMessage.includes('finance_transactions') ||
    normalizedMessage.includes('finance_recurring_rules') ||
    normalizedMessage.includes('finance_debts') ||
    normalizedMessage.includes('finance_debt_payments') ||
    normalizedMessage.includes('finance_salary_profiles') ||
    normalizedMessage.includes('finance_salary_deductions') ||
    normalizedMessage.includes('relation') && normalizedMessage.includes('does not exist') ||
    normalizedMessage.includes('could not find the table')
  ) {
    return 'La conexion esta lista, pero faltan tablas de finanzas. Ejecuta `supabase/schema.sql` en el SQL Editor.'
  }

  if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('permission denied')) {
    return 'La base rechazo el acceso. Revisa las politicas RLS y confirma que el esquema de finanzas este instalado.'
  }

  return fallbackMessage
}
