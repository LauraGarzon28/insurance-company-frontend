import { env } from '../config/env'
import { http } from './http'
import { authMock } from './mocks/authMock'

const base = env.endpoints.auth

const real = {
  /** @returns {Promise<{accessToken:string}>} */
  login: (username, password) => http.post(`${base}/login`, { username, password }, { auth: false }),
  register: (datos) => http.post(`${base}/register`, datos, { auth: false }),
}

export const authService = env.isMock('auth') ? authMock : real
