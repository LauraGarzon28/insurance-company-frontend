import { useEffect, useState } from 'react'

/** Carga de datos: ejecuta `fn` al montar y cuando cambian `deps`. `reload()` repite la consulta. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let vivo = true
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.resolve(fn()).then(
      (data) => vivo && setState({ data, error: null, loading: false }),
      (error) => vivo && setState({ data: null, error, loading: false }),
    )
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
