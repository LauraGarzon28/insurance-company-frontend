import { TIPOS_RIESGO } from '../contracts/enums.js'

/**
 * Espejo de EvaluacionRiesgoService (cotizaciones-service): prima = valor × tasaBase × (1 + puntaje/100).
 * Es una ESTIMACIÓN para el cliente; la prima oficial la fija el backend.
 */
export function calcularPrima(valorAsegurado, puntaje, reglas) {
  const base = valorAsegurado * reglas.tasaBase
  const recargo = base * (puntaje / 100)
  return {
    base,
    recargo,
    total: Math.round((base + recargo) * 100) / 100,
    requiereRevisionManual: puntaje > reglas.umbralRevisionManual,
  }
}

/** La descripción de una cotización se guarda como "<Tipo> — <detalle>"; devuelve la clave del tipo (p. ej. 'HOGAR'). */
export const tipoDeDescripcion = (descripcion) =>
  Object.keys(TIPOS_RIESGO).find((k) => TIPOS_RIESGO[k].label === descripcion.split(' — ')[0])

/** Tasa base implícita en una prima ya calculada (para explicar el costo de una cotización existente). */
export const tasaImplicita = (valorAsegurado, puntaje, monto) => monto / (1 + puntaje / 100) / valorAsegurado

/** Puntaje de riesgo 0-100 a partir de las respuestas del formulario (el backend lo recibe como `puntajeRiesgo`). */
export function calcularPuntaje({ tipoRiesgo, siniestrosPrevios, medidasProteccion, valorAsegurado }) {
  let p = TIPOS_RIESGO[tipoRiesgo]?.base ?? 0
  p += 15 * Math.min(Number(siniestrosPrevios) || 0, 2)
  if (!medidasProteccion) p += 10
  if (Number(valorAsegurado) > 500_000_000) p += 10
  return Math.max(0, Math.min(100, p))
}
