import { useId } from 'react'

function Field({ id, label, error, hint, className = '', children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="field__hint" id={`${id}-d`}>{hint}</span>}
      {error && <span className="field__error" id={`${id}-d`} role="alert">{error}</span>}
    </div>
  )
}

const aria = (id, error, hint) => ({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error || hint ? `${id}-d` : undefined })

export function TextField({ label, error, hint, className, ...input }) {
  const id = useId()
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <input className="field__input" {...aria(id, error, hint)} {...input} />
    </Field>
  )
}

export function TextAreaField({ label, error, hint, className, ...input }) {
  const id = useId()
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <textarea className="field__input" {...aria(id, error, hint)} {...input} />
    </Field>
  )
}

/** options: [{ value, label }] */
export function SelectField({ label, error, hint, options, placeholder, className, ...input }) {
  const id = useId()
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <select className="field__input" {...aria(id, error, hint)} {...input}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}

export function CheckboxField({ label, hint, ...input }) {
  return (
    <label className="check">
      <input type="checkbox" {...input} />
      <span>{label}{hint && <span className="field__hint" style={{ display: 'block' }}>{hint}</span>}</span>
    </label>
  )
}

/** Selector de tarjetas (radio visual). options: [{ value, label, icon? }] */
export function ChoiceField({ label, error, options, name, value, onChange }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="field__label" style={{ marginBottom: '.5rem' }}>{label}</legend>
      <div className="choice-grid">
        {options.map((o) => (
          <label className="choice" key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={onChange} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && <span className="field__error" role="alert">{error}</span>}
    </fieldset>
  )
}
