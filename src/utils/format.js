const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const fecha = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
const fechaHora = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export const money = (n) => (n == null ? '—' : cop.format(n))

// Las fechas yyyy-mm-dd se parsean como locales para evitar el desfase de zona horaria.
const parse = (v) => (typeof v === 'string' && v.length === 10 ? new Date(`${v}T00:00:00`) : new Date(v))
export const date = (v) => (v ? fecha.format(parse(v)) : '—')
export const dateTime = (v) => (v ? fechaHora.format(new Date(v)) : '—')

export const toISODate = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export const addDays = (iso, days) => {
  const d = parse(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}
export const addYears = (iso, years) => {
  const d = parse(iso)
  d.setFullYear(d.getFullYear() + years)
  return toISODate(d)
}
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000)
export const shortId = (id) => (id ? id.slice(0, 8).toUpperCase() : '—')
