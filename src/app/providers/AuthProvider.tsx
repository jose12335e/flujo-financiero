/* eslint-disable react-refresh/only-export-components */
import { type PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

type AuthStatus = 'loading' | 'ready' | 'error'

interface SignUpResult {
  requiresEmailConfirmation: boolean
}

interface AuthContextValue {
  isConfigured: boolean
  session: Session | null
  status: AuthStatus
  user: User | null
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<SignUpResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>(() => (isSupabaseConfigured ? 'loading' : 'error'))
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const client = getSupabaseClient()

    if (!client) {
      return
    }

    let isActive = true

    void client.auth.getSession().then(({ data, error }) => {
      if (!isActive) {
        return
      }

      if (error) {
        setStatus('error')
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
      setStatus('ready')
    })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return
      }

      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setStatus('ready')
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      session,
      status,
      user,
      async signInWithPassword(email, password) {
        const client = getSupabaseClient()

        if (!client) {
          throw new Error('La conexion de datos aun no esta configurada.')
        }

        const { error } = await client.auth.signInWithPassword({ email, password })

        if (error) {
          throw error
        }
      },
      async signUp(email, password) {
        const client = getSupabaseClient()

        if (!client) {
          throw new Error('La conexion de datos aun no esta configurada.')
        }

        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })

        if (error) {
          throw error
        }

        return {
          requiresEmailConfirmation: !data.session,
        }
      },
      async signOut() {
        const client = getSupabaseClient()

        if (!client) {
          return
        }

        const { error } = await client.auth.signOut()

        if (error) {
          throw error
        }
      },
    }),
    [session, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }

  return context
}
