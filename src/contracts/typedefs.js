// Contratos de datos (forma de las respuestas del API). Solo JSDoc: sin código en runtime.
// Los campos marcados "ext" son extensiones del frontend/mocks que el backend aún no expone.

/**
 * @typedef {Object} Cliente
 * @property {string} id
 * @property {string} nombreCompleto
 * @property {string} tipoDocumento
 * @property {string} numeroDocumento
 * @property {string} correo
 * @property {string} telefono
 */

/**
 * @typedef {Object} Prima
 * @property {number} monto
 * @property {string} versionReglas  Versión de las reglas de suscripción con que se calculó
 */

/**
 * @typedef {Object} Cotizacion
 * @property {string} id
 * @property {string} clienteId
 * @property {string} descripcionRiesgo
 * @property {number} valorAsegurado
 * @property {number} puntajeRiesgo     0-100
 * @property {import('./enums').EstadoCotizacion[keyof import('./enums').EstadoCotizacion]} estado
 * @property {Prima|null} prima
 */

/**
 * @typedef {Object} ReglasSuscripcion
 * @property {string} version
 * @property {number} tasaBase
 * @property {number} umbralRevisionManual  Puntaje por encima del cual se exige revisión manual
 * @property {boolean} [vigente]
 * @property {string} [vigenteDesde]
 */

/**
 * @typedef {Object} Poliza
 * @property {string} id
 * @property {string} clienteId
 * @property {number} valorAsegurado
 * @property {string} fechaInicio   ISO yyyy-mm-dd
 * @property {string} fechaFin      ISO yyyy-mm-dd
 * @property {'VIGENTE'|'VENCIDA'|'CANCELADA'|'EN_CANCELACION'} estado
 * @property {string} [numero]      ext
 * @property {string} [cotizacionId] ext
 * @property {string} [tipoRiesgo]  ext
 * @property {string} [descripcion] ext
 * @property {number} [prima]       ext
 * @property {string[]} [coberturas] ext
 */

/**
 * @typedef {Object} EventoSiniestro  ext
 * @property {string} estado
 * @property {string} fecha  ISO date-time
 * @property {string} detalle
 * @property {string} actor
 */

/**
 * @typedef {Object} Siniestro
 * @property {string} id
 * @property {string} polizaId
 * @property {string} descripcion
 * @property {import('./enums').EstadoSiniestro[keyof import('./enums').EstadoSiniestro]} estado
 * @property {number} valorAseguradoPoliza
 * @property {number|null} montoAprobado
 * @property {string} [clienteId]     ext
 * @property {string} [fechaOcurrencia] ext
 * @property {string|null} [ajustadorId] ext
 * @property {string} [comentarioDecision] ext
 * @property {EventoSiniestro[]} [historial] ext
 */

/**
 * @typedef {Object} Sesion
 * @property {string} token
 * @property {{id:string, username:string, roles:string[], clienteId:string|null}} usuario
 */

export {}
