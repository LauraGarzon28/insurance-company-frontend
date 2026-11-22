import { Rol } from '../contracts/enums'

const { CLIENTE, SUSCRIPTOR, ASESOR, AJUSTADOR, ADMIN } = Rol

/** Menú lateral: cada ítem se muestra si el usuario tiene alguno de sus roles. */
export const NAV = [
  { to: '/app', label: 'Inicio', icon: 'home', end: true, roles: [CLIENTE, SUSCRIPTOR, ASESOR, AJUSTADOR, ADMIN] },
  { to: '/app/cotizar', label: 'Cotizar', icon: 'calculator', roles: [CLIENTE] },
  { to: '/app/cotizaciones', label: 'Mis cotizaciones', icon: 'file', roles: [CLIENTE] },
  { to: '/app/polizas', label: 'Mis pólizas', icon: 'shield', roles: [CLIENTE] },
  { to: '/app/siniestros', label: 'Mis siniestros', icon: 'alert', roles: [CLIENTE] },
  { to: '/app/revision', label: 'Revisión de riesgos', icon: 'clipboard', roles: [SUSCRIPTOR, ADMIN] },
  { to: '/app/reglas', label: 'Reglas vigentes', icon: 'book', roles: [SUSCRIPTOR, ADMIN] },
  { to: '/app/historico', label: 'Histórico de siniestros', icon: 'history', roles: [SUSCRIPTOR, ADMIN] },
  { to: '/app/usuarios/nuevo', label: 'Crear usuario', icon: 'user', roles: [ADMIN] },
  { to: '/app/siniestros', label: 'Siniestros reportados', icon: 'inbox', roles: [ASESOR, ADMIN] },
  { to: '/app/siniestros', label: 'Mis casos asignados', icon: 'alert', roles: [AJUSTADOR] },
]
