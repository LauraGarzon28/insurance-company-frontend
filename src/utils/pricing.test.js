import test from 'node:test'
import assert from 'node:assert/strict'
import { calcularPrima, calcularPuntaje } from './pricing.js'

const reglas = { tasaBase: 0.035, umbralRevisionManual: 70 }

test('prima = valor × tasa × (1 + puntaje/100)', () => {
  const r = calcularPrima(50_000_000, 40, reglas)
  assert.equal(r.total, 2_450_000)
  assert.equal(r.requiereRevisionManual, false)
})

test('puntaje por encima del umbral exige revisión manual', () => {
  assert.equal(calcularPrima(1_000_000, 71, reglas).requiereRevisionManual, true)
  assert.equal(calcularPrima(1_000_000, 70, reglas).requiereRevisionManual, false)
})

test('puntaje se mantiene entre 0 y 100', () => {
  const alto = calcularPuntaje({ tipoRiesgo: 'SALUD', siniestrosPrevios: 9, medidasProteccion: false, valorAsegurado: 9e9 })
  assert.equal(alto, 90)
  assert.equal(calcularPuntaje({ tipoRiesgo: 'X', siniestrosPrevios: 0, medidasProteccion: true, valorAsegurado: 1 }), 0)
})
