import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

interface LocalStorageOptions<T> {
  parse?: (raw: string | null) => T
  serialize?: (value: T) => string
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  options: LocalStorageOptions<T> = {},
): readonly [T, Dispatch<SetStateAction<T>>] {
  const { parse, serialize } = options

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    if (parse) {
      return parse(window.localStorage.getItem(key))
    }

    const raw = window.localStorage.getItem(key)

    if (!raw) {
      return initialValue
    }

    try {
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const nextValue = serialize ? serialize(state) : JSON.stringify(state)
    window.localStorage.setItem(key, nextValue)
  }, [key, serialize, state])

  return [state, setState] as const
}
