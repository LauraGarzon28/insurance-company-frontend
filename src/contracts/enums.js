// Contratos de datos: enumeraciones del backend (+ extensiones del frontend marcadas con "ext").

export const Rol = {
  CLIENTE: 'CLIENTE',
  SUSCRIPTOR: 'SUSCRIPTOR',
  AJUSTADOR: 'AJUSTADOR',
  ADMIN: 'ADMIN',
  ASESOR: 'ASESOR', // ext: el auth-service aún no define este rol
}

export const ROL_LABEL = {
  CLIENTE: 'Cliente',
  SUSCRIPTOR: 'Suscriptor',
  AJUSTADOR: 'Ajustador',
  ADMIN: 'Administrador',
  ASESOR: 'Asesor comercial',
}

export const EstadoCotizacion = {
  SOLICITADA: 'SOLICITADA',
  EN_REVISION_MANUAL: 'EN_REVISION_MANUAL',
  COTIZADA: 'COTIZADA',
  ACEPTADA: 'ACEPTADA',
  RECHAZADA: 'RECHAZADA',
}

export const EstadoPoliza = { VIGENTE: 'VIGENTE', VENCIDA: 'VENCIDA', CANCELADA: 'CANCELADA' }

export const EstadoSiniestro = {
  REPORTADO: 'REPORTADO',
  EN_EVALUACION: 'EN_EVALUACION',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  CERRADO: 'CERRADO', // ext: cierre administrativo tras la decisión
}

/** Etiqueta y tono visual (Badge) por estado. */
export const ESTADO_META = {
  // cotización
  SOLICITADA: { label: 'En evaluación', tone: 'info' },
  EN_REVISION_MANUAL: { label: 'Revisión manual', tone: 'warning' },
  COTIZADA: { label: 'Cotizada', tone: 'success' },
  ACEPTADA: { label: 'Aceptada', tone: 'primary' },
  RECHAZADA: { label: 'Rechazada', tone: 'danger' },
  // póliza
  VIGENTE: { label: 'Vigente', tone: 'success' },
  VENCIDA: { label: 'Vencida', tone: 'warning' },
  CANCELADA: { label: 'Cancelada', tone: 'danger' },
  // siniestro
  REPORTADO: { label: 'Reportado', tone: 'info' },
  EN_EVALUACION: { label: 'En evaluación', tone: 'warning' },
  APROBADO: { label: 'Aprobado', tone: 'success' },
  RECHAZADO: { label: 'Rechazado', tone: 'danger' },
  CERRADO: { label: 'Cerrado', tone: 'neutral' },
}

export const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'Pasaporte']

export const TIPOS_RIESGO = {
  HOGAR: { label: 'Hogar', base: 20, coberturas: ['Incendio y explosión', 'Daños por agua', 'Robo y hurto', 'Responsabilidad civil'] },
  VEHICULO: { label: 'Vehículo', base: 35, coberturas: ['Pérdida total por daños', 'Pérdida total por hurto', 'Responsabilidad civil', 'Asistencia en carretera'] },
  SALUD: { label: 'Salud', base: 40, coberturas: ['Hospitalización', 'Cirugía', 'Consulta especializada', 'Urgencias'] },
  VIDA: { label: 'Vida', base: 30, coberturas: ['Muerte por cualquier causa', 'Incapacidad total y permanente', 'Enfermedades graves'] },
}
