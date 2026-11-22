import { env } from '../config/env'
import { http, qs } from './http'
import { siniestrosMock } from './mocks/siniestrosMock'

const base = env.endpoints.siniestros

// Contrato real (monolito): POST /siniestros, GET /{id}, POST /{id}/evaluacion.
// shortcut: listado, asignación, cierre y ajustadores son endpoints asumidos; no existen aún en el monolito.
const real = {
  reportar: ({ polizaId, descripcion, valorAseguradoPoliza }) => http.post(base, { polizaId, descripcion, valorAseguradoPoliza }),
  obtener: (id) => http.get(`${base}/${id}`),
  listar: (filtros = {}) => http.get(`${base}${qs(filtros)}`),
  listarAjustadores: () => http.get(`${base}/ajustadores`),
  asignar: (id, ajustadorId) => http.post(`${base}/${id}/asignacion`, { ajustadorId }),
  // El backend decide aprobar/rechazar con estadoPoliza + esFraude: un rechazo se envía como esFraude=true.
  evaluar: (id, { aprobado, montoPropuesto }) =>
    http.post(`${base}/${id}/evaluacion`, { estadoPoliza: 'ACTIVA', esFraude: !aprobado, montoPropuesto: aprobado ? montoPropuesto : null }),
  cerrar: (id) => http.post(`${base}/${id}/cierre`),
}

export const siniestrosService = env.isMock('siniestros') ? siniestrosMock : real
