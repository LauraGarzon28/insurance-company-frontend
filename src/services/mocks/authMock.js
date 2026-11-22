import { db, simular, uid, fallar } from './db'

const b64url = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

// JWT sin firma real: solo para que el frontend use el mismo camino de decodificación que con el backend.
const token = (u) => `${b64url('{"alg":"none"}')}.${b64url(JSON.stringify({
  sub: u.id, username: u.username, roles: u.roles, ...(u.clienteId && { clienteId: u.clienteId }),
  exp: Math.floor(Date.now() / 1000) + 3600,
}))}.mock`

export const authMock = {
  login: simular((username, password) => {
    const u = db().users.find((x) => x.username === username && x.password === password)
    if (!u) fallar('Usuario o contraseña incorrectos', 401)
    return { accessToken: token(u), tokenType: 'Bearer', expiresIn: 3600 }
  }),
  register: simular(({ username, correo, password }) => {
    if (db().users.some((u) => u.username === username)) fallar('Ya existe un usuario con ese nombre de usuario', 409)
    if (db().users.some((u) => u.correo === correo)) fallar('Ya existe un usuario con ese correo', 409)
    const u = { id: uid(), username, correo, password, roles: ['CLIENTE'], clienteId: null }
    db().users.push(u)
    return { id: u.id, username, correo, roles: u.roles }
  }),
  crearInterno: simular(({ username, correo, password, roles }) => {
    if (db().users.some((u) => u.username === username)) fallar('Ya existe un usuario con ese nombre de usuario', 409)
    if (db().users.some((u) => u.correo === correo)) fallar('Ya existe un usuario con ese correo', 409)
    const u = { id: uid(), username, correo, password, roles, clienteId: null }
    db().users.push(u)
    if (roles.includes('AJUSTADOR')) {
      db().ajustadores.push({ id: u.id, nombre: u.username })
    }
    return { id: u.id, username, correo, roles: u.roles }
  }),
}
