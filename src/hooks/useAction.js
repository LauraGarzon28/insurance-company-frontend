import { useState } from 'react'

/** Mutaciones: `run(...args)` ejecuta `fn`, expone loading/error y devuelve el resultado (undefined si falló). */
export function useAction(fn) {
  const [state, setState] = useState({ loading: false, error: null })

  const run = async (...args) => {
    setState({ loading: true, error: null })
    try {
      const result = await fn(...args)
      setState({ loading: false, error: null })
      return result
    } catch (error) {
      setState({ loading: false, error })
      return undefined
    }
  }

  return { run, ...state, clearError: () => setState((s) => ({ ...s, error: null })) }
}
