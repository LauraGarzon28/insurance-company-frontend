import { env } from '../config/env'
import { http, qs } from './http'
import { siniestrosMock } from './mocks/siniestrosMock'

const base = env.endpoints.siniestros
const claveIds = 'aseguradora.siniestros'
const leerIds = () => {
  try { return JSON.parse(localStorage.getItem(claveIds)) ?? [] } catch { return [] }
}
const guardarId = (id) => {
  try { localStorage.setItem(claveIds, JSON.stringify([id, ...leerIds().filter((x) => x !== id)])) } catch { /* sin persistencia */ }
}

const real = {
  reportar: async ({ polizaId, descripcion }) => {
    const siniestro = await http.post(base, { polizaId, descripcion })
    guardarId(siniestro.id)
    return siniestro
  },
  obtener: (id) => http.get(`${base}/${id}`),
  listar: async (filtros = {}) => {
    if (filtros.clienteId) {
      return (await Promise.allSettled(leerIds().map((id) => http.get(`${base}/${id}`))))
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((s) => !filtros.estado || s.estado === filtros.estado)
        .filter((s) => !filtros.polizaId || s.polizaId === filtros.polizaId)
    }
    return http.get(`${base}${qs(filtros)}`)
  },
  listarAjustadores: () =>
    http.get('/auth/usuarios/ajustadores').then((usuarios) =>
      usuarios.map((usuario) => ({ id: usuario.id, nombre: usuario.username, correo: usuario.correo }))),
  asignar: (id, ajustadorId) => http.post(`${base}/${id}/asignacion`, { ajustadorId }),
  evaluar: (id, { aprobado, montoPropuesto }) =>
    http.post(`${base}/${id}/evaluacion`, { esFraude: !aprobado, montoPropuesto: aprobado ? montoPropuesto : null }),
  cerrar: (id) => http.post(`${base}/${id}/cierre`),
}

export const siniestrosService = env.isMock('siniestros') ? siniestrosMock : real
