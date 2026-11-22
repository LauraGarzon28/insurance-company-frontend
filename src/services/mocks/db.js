// Base de datos simulada, persistida en localStorage. Se reinicia con resetMockDb().
import { env } from '../../config/env'
import { ApiError } from '../http'
import { TIPOS_RIESGO } from '../../contracts/enums'
import { addDays, addYears, toISODate } from '../../utils/format'

const KEY = 'aseguradora.mock.v1'
export const uid = () => crypto.randomUUID()
export const ahora = () => new Date().toISOString()
export const fallar = (mensaje, status = 400) => {
  throw new ApiError(status, mensaje)
}

/** Envuelve una función síncrona del mock: añade latencia y devuelve copias (como haría el API). */
export const simular = (fn) => async (...args) => {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
  const out = fn(...args)
  persist()
  return out === undefined ? undefined : structuredClone(out)
}

function sembrar() {
  const hoy = toISODate(new Date())
  const c1 = uid(), c2 = uid()
  const aj1 = uid(), aj2 = uid()
  const desc = (t, d) => `${TIPOS_RIESGO[t].label} — ${d}`
  const poliza = (n, clienteId, tipo, d, valor, ini, fin, prima, cancelada = false) => ({
    id: uid(), numero: `POL-2026-${String(n).padStart(4, '0')}`, clienteId, cotizacionId: uid(), valorAsegurado: valor,
    fechaInicio: ini, fechaFin: fin, cancelada, tipoRiesgo: tipo, descripcion: d, prima, coberturas: TIPOS_RIESGO[tipo].coberturas,
  })
  const p1 = poliza(1, c1, 'VEHICULO', 'Mazda CX-30 2024, placa KLM123', 95_000_000, addDays(hoy, -120), addDays(hoy, 245), 4_180_000)
  const p2 = poliza(2, c1, 'HOGAR', 'Apartamento en Chapinero, 90 m²', 280_000_000, addDays(hoy, -240), addDays(hoy, 125), 6_300_000)
  const p3 = poliza(3, c1, 'VIDA', 'Seguro de vida individual', 150_000_000, addYears(hoy, -1), addDays(hoy, -20), 3_900_000)
  const p4 = poliza(4, c1, 'SALUD', 'Plan de salud familiar', 60_000_000, addDays(hoy, -200), addDays(hoy, 165), 2_700_000, true)
  const p5 = poliza(5, c2, 'SALUD', 'Plan de salud individual', 120_000_000, addDays(hoy, -90), addDays(hoy, 275), 5_000_000)

  const ev = (estado, diasAtras, detalle, actor) => ({ estado, fecha: new Date(Date.now() - diasAtras * 864e5).toISOString(), detalle, actor })
  const sin = (p, clienteId, descripcion, estado, ajustadorId, montoAprobado, historial, comentarioDecision = null) => ({
    id: uid(), polizaId: p.id, clienteId, descripcion, estado, valorAseguradoPoliza: p.valorAsegurado, montoAprobado,
    fechaOcurrencia: addDays(hoy, -12), ajustadorId, comentarioDecision, historial,
  })
  const rep = (d) => ev('REPORTADO', d, 'El cliente reportó el siniestro.', 'Cliente')
  const asg = (d, n) => ev('EN_EVALUACION', d, `Asignado al ajustador ${n}.`, 'Asesor comercial')

  const cot = (clienteId, tipo, d, valor, puntaje, estado, prima) => ({
    id: uid(), clienteId, descripcionRiesgo: desc(tipo, d), valorAsegurado: valor, puntajeRiesgo: puntaje, estado,
    prima: prima ? { monto: prima, versionReglas: '2026.2' } : null,
  })

  return {
    users: [
      { id: uid(), username: 'cliente', correo: 'cliente@demo.co', password: 'Demo12345', roles: ['CLIENTE'], clienteId: c1 },
      { id: uid(), username: 'suscriptor', correo: 'suscriptor@demo.co', password: 'Demo12345', roles: ['SUSCRIPTOR'], clienteId: null },
      { id: uid(), username: 'asesor', correo: 'asesor@demo.co', password: 'Demo12345', roles: ['ASESOR'], clienteId: null },
      { id: aj1, username: 'ajustador', correo: 'ajustador@demo.co', password: 'Demo12345', roles: ['AJUSTADOR'], clienteId: null },
      { id: uid(), username: 'admin', correo: 'admin@demo.co', password: 'Demo12345', roles: ['ADMIN'], clienteId: null },
    ],
    ajustadores: [{ id: aj1, nombre: 'Camila Rojas' }, { id: aj2, nombre: 'Andrés Pardo' }],
    clientes: [
      { id: c1, nombreCompleto: 'Laura Gómez Pérez', tipoDocumento: 'CC', numeroDocumento: '1020304050', correo: 'cliente@demo.co', telefono: '3001234567' },
      { id: c2, nombreCompleto: 'Carlos Mendoza Ruiz', tipoDocumento: 'CC', numeroDocumento: '79845612', correo: 'carlos@demo.co', telefono: '3109876543' },
    ],
    reglas: [
      { version: '2026.2', tasaBase: 0.035, umbralRevisionManual: 70, vigente: true, vigenteDesde: addDays(hoy, -90) },
      { version: '2026.1', tasaBase: 0.032, umbralRevisionManual: 75, vigente: false, vigenteDesde: addDays(hoy, -270) },
    ],
    cotizaciones: [
      cot(c1, 'HOGAR', 'Casa en Cota, 140 m²', 320_000_000, 40, 'COTIZADA', 15_680_000),
      cot(c1, 'VIDA', 'Seguro de vida individual', 200_000_000, 55, 'RECHAZADA', 10_850_000),
      cot(c2, 'SALUD', 'Plan de salud con preexistencias', 120_000_000, 85, 'EN_REVISION_MANUAL', 7_770_000),
      cot(c2, 'VEHICULO', 'Camioneta Toyota Hilux 2022', 160_000_000, 76, 'EN_REVISION_MANUAL', 9_856_000),
      cot(c2, 'VIDA', 'Seguro de vida individual', 90_000_000, 50, 'SOLICITADA', null),
    ],
    polizas: [p1, p2, p3, p4, p5],
    siniestros: [
      sin(p1, c1, 'Colisión leve en parqueadero, daño en parachoques trasero.', 'REPORTADO', null, null, [rep(1)]),
      sin(p2, c1, 'Daño por filtración de agua en el techo de la sala.', 'EN_EVALUACION', aj1, null, [rep(8), asg(6, 'Camila Rojas')]),
      sin(p1, c1, 'Rotura del parabrisas por impacto de piedra.', 'APROBADO', aj1, 1_800_000, [
        rep(40), asg(38, 'Camila Rojas'),
        ev('APROBADO', 30, 'Evaluación aprobada por $1.800.000.', 'Ajustador'),
      ], 'Daño cubierto. Se aprueba el reemplazo del parabrisas.'),
      sin(p5, c2, 'Urgencias por fractura de muñeca.', 'EN_EVALUACION', aj2, null, [rep(5), asg(4, 'Andrés Pardo')]),
      sin(p2, c1, 'Robo de electrodomésticos sin evidencia de ingreso forzado.', 'RECHAZADO', aj1, null, [
        rep(70), asg(68, 'Camila Rojas'),
        ev('RECHAZADO', 60, 'Evaluación rechazada.', 'Ajustador'),
      ], 'No hay evidencia suficiente que sustente el hecho.'),
    ],
    feedback: [],
  }
}

let cache
function cargar() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* localStorage no disponible: se usa memoria */ }
  return sembrar()
}
export const db = () => (cache ??= cargar())
export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* sin persistencia */ }
}
export function resetMockDb() {
  cache = sembrar()
  persist()
}
