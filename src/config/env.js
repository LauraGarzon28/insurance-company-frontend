// Única puerta de entrada a las variables de entorno (VITE_*).
const e = import.meta.env

const mockDomains = new Set(
  (e.VITE_MOCK_DOMAINS ?? 'polizas,siniestros').split(',').map((s) => s.trim()).filter(Boolean),
)

export const env = {
  apiBaseUrl: e.VITE_API_BASE_URL ?? '/api',
  endpoints: {
    auth: e.VITE_EP_AUTH ?? '/auth',
    clientes: e.VITE_EP_CLIENTES ?? '/clientes',
    cotizaciones: e.VITE_EP_COTIZACIONES ?? '/cotizaciones',
    polizas: e.VITE_EP_POLIZAS ?? '/polizas',
    siniestros: e.VITE_EP_SINIESTROS ?? '/siniestros',
  },
  mockLatencyMs: Number(e.VITE_MOCK_LATENCY_MS ?? 350),
  /** @param {'auth'|'clientes'|'cotizaciones'|'polizas'|'siniestros'} dominio */
  isMock: (dominio) => mockDomains.has('all') || mockDomains.has(dominio),
}
