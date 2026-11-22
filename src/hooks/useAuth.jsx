import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { configureHttp } from '../services/http'
import { Rol } from '../contracts/enums'

const STORE = 'aseguradora.session'
const clienteKey = (userId) => `aseguradora.clienteId.${userId}`

const guardado = () => { try { return sessionStorage.getItem(STORE) } catch { return null } }
const leerClienteId = (userId) => { try { return localStorage.getItem(clienteKey(userId)) } catch { return null } }

export function decodeJwt(token) {
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))))
}

/** @returns {import('../contracts/typedefs').Sesion|null} */
function construirSesion(token) {
  try {
    const c = decodeJwt(token)
    if (c.exp * 1000 < Date.now()) return null
    // El JWT trae clienteId solo si el auth-service lo vinculó; si no, se usa el que guardó el frontend al registrar el cliente.
    return { token, usuario: { id: c.sub, username: c.username, roles: c.roles ?? [], clienteId: c.clienteId ?? leerClienteId(c.sub) } }
  } catch {
    return null
  }
}

// Registrado a nivel de módulo (no en un efecto) para que ya exista cuando los hijos hagan su primera petición.
configureHttp({
  getToken: guardado,
  onUnauthorized: () => {
    try { sessionStorage.removeItem(STORE) } catch { /* noop */ }
    window.dispatchEvent(new Event('auth:logout'))
  },
})

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => { const t = guardado(); return t ? construirSesion(t) : null })

  useEffect(() => {
    const salir = () => setSesion(null)
    window.addEventListener('auth:logout', salir)
    return () => window.removeEventListener('auth:logout', salir)
  }, [])

  const value = useMemo(() => {
    const login = async (username, password) => {
      const { accessToken } = await authService.login(username, password)
      try { sessionStorage.setItem(STORE, accessToken) } catch { /* noop */ }
      setSesion(construirSesion(accessToken))
    }
    const usuario = sesion?.usuario ?? null
    return {
      usuario,
      autenticado: !!usuario,
      login,
      register: async (datos) => { await authService.register(datos); await login(datos.username, datos.password) },
      logout: () => {
        try { sessionStorage.removeItem(STORE) } catch { /* noop */ }
        setSesion(null)
      },
      /** Recuerda el clienteId del usuario (el JWT aún no lo trae) tras registrarlo en clientes-service. */
      vincularCliente: (clienteId) => {
        try { localStorage.setItem(clienteKey(usuario.id), clienteId) } catch { /* noop */ }
        setSesion((s) => ({ ...s, usuario: { ...s.usuario, clienteId } }))
      },
      puede: (roles) => !!usuario && roles.some((r) => usuario.roles.includes(r)),
      rolPrincipal: usuario && [Rol.ADMIN, Rol.SUSCRIPTOR, Rol.ASESOR, Rol.AJUSTADOR, Rol.CLIENTE].find((r) => usuario.roles.includes(r)),
    }
  }, [sesion])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
