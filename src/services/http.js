import { env } from '../config/env'

export class ApiError extends Error {
  /** @param {number} status @param {string} message @param {{campo:string,mensaje:string}[]} [errores] */
  constructor(status, message, errores = []) {
    super(message)
    this.status = status
    this.errores = errores
  }
}

const MENSAJES = {
  401: 'Tu sesión expiró o las credenciales no son válidas.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No encontramos lo que buscas.',
  503: 'El servicio no está disponible en este momento. Inténtalo más tarde.',
}

// El AuthContext registra aquí cómo obtener el token y qué hacer ante un 401.
const hooks = { getToken: () => null, onUnauthorized: () => {} }
export const configureHttp = (h) => Object.assign(hooks, h)

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const token = auth ? hooks.getToken() : null
  let res
  try {
    res = await fetch(env.apiBaseUrl + path, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && auth) hooks.onUnauthorized()
    throw new ApiError(res.status, data?.mensaje ?? MENSAJES[res.status] ?? 'Ocurrió un error inesperado.', data?.errores ?? [])
  }
  return data
}

export const http = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
}

/** Arma query string omitiendo valores vacíos. */
export const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString()
  return s ? `?${s}` : ''
}
