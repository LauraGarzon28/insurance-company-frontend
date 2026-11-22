import { env } from '../config/env'
import { http, qs } from './http'
import { cotizacionesMock } from './mocks/cotizacionesMock'

const base = env.endpoints.cotizaciones

// shortcut: el backend no expone listados; se guardan localmente los ids de las cotizaciones del cliente
// y se consultan una a una. Reemplazar por GET ?clienteId= cuando exista.
const clave = (clienteId) => `aseguradora.cotizaciones.${clienteId}`
const leerIds = (clienteId) => {
  try { return JSON.parse(localStorage.getItem(clave(clienteId))) ?? [] } catch { return [] }
}

const real = {
  solicitar: async (datos) => {
    const c = await http.post(base, datos)
    try { localStorage.setItem(clave(datos.clienteId), JSON.stringify([c.id, ...leerIds(datos.clienteId)])) } catch { /* sin persistencia */ }
    return c
  },
  obtener: (id) => http.get(`${base}/${id}`),
  listarPorCliente: (clienteId) => http.get(`${base}${qs({ clienteId })}`),
  listarPendientes: () => http.get(`${base}${qs({ estado: 'EN_REVISION_MANUAL' })}`),
  evaluar: (id, reglas) =>
    http.post(`${base}/${id}/evaluacion`, {
      versionReglas: reglas.version, tasaBase: reglas.tasaBase, umbralRevisionManual: reglas.umbralRevisionManual,
    }),
  aprobar: (id) => http.post(`${base}/${id}/aprobacion`),
  rechazar: (id) => http.post(`${base}/${id}/rechazo`),
  aceptar: (id) => http.post(`${base}/${id}/aceptacion`),
}

export const cotizacionesService = env.isMock('cotizaciones') ? cotizacionesMock : real
/** Indica si existe un listado global de cotizaciones pendientes para el suscriptor. */
export const hayBandejaPendientes = true
