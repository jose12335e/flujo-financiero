import { useFinanceStore } from '@/hooks/useFinanceStore'
import type { ThemeMode } from '@/types/finance'

export function useTheme() {
  const { state, actions } = useFinanceStore()

  return {
    theme: state.theme,
    setTheme: (theme: ThemeMode) => actions.setTheme(theme),
    toggleTheme: () => actions.setTheme(state.theme === 'light' ? 'dark' : 'light'),
  }
}
