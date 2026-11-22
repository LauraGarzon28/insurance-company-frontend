import { useState } from 'react'

/**
 * Formulario por pasos. `steps`: [{ id, title, validate?(values) => { campo: mensaje } }].
 * `next()` valida el paso actual y avanza solo si no hay errores.
 */
export function useStepForm(steps, initial) {
  const [index, setIndex] = useState(0)
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }))
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e))
  }
  const validate = () => {
    const found = steps[index].validate?.(values) ?? {}
    setErrors(found)
    return Object.keys(found).length === 0
  }

  /** Props listas para TextField/SelectField/etc.: { name, value, onChange, error }. */
  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    error: errors[name],
    onChange: (e) => set(name, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
  })

  return {
    index, step: steps[index], values, errors, set, bind,
    isLast: index === steps.length - 1,
    /** Valida el paso actual; si es válido avanza (sin pasar del último) y devuelve true. */
    next: () => {
      const ok = validate()
      if (ok) setIndex((i) => Math.min(i + 1, steps.length - 1))
      return ok
    },
    back: () => { setErrors({}); setIndex((i) => Math.max(i - 1, 0)) },
  }
}
