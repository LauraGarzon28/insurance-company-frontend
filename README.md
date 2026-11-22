# Aseguradora Digital — Frontend

React + Vite (JavaScript). Consume el API Gateway (`/api/**`).

```powershell
cd frontend
npm install
copy .env.example .env      # ajusta si hace falta
npm run dev                 # http://localhost:5173
npm test                    # pruebas del cálculo de prima
npm run build
```

## Modo demo sin backend

Crea `frontend/.env.local` con `VITE_MOCK_DOMAINS=all`. Cuentas (contraseña `Demo12345`):
`cliente`, `suscriptor`, `asesor`, `ajustador`, `admin`. Los datos se guardan en `localStorage`.

## Qué es real y qué es simulado

`VITE_MOCK_DOMAINS` (por defecto `polizas`) decide qué dominios usan datos simulados.
Pólizas permanece simulada porque el monolito no expone aún todos sus listados. Auth, clientes,
cotizaciones y siniestros usan el backend real mediante el API Gateway.

| Dominio | Estado |
|---|---|
| auth, clientes, cotizaciones, siniestros | HTTP real vía gateway |
| pólizas | Mock por defecto hasta completar los listados del monolito |
| reglas de suscripción, feedback | Siempre simulado (no hay endpoint) |

## Estructura

```
src/
  config/      env.js (variables VITE_*), navigation.js (menú por rol)
  contracts/   enums.js + typedefs.js (forma de los datos del API)
  services/    http.js, un servicio por dominio, mocks/
  hooks/       useAuth, useAsync, useAction, useStepForm
  components/  ui/ (genéricos), domain/ (tarjetas, formularios del negocio), AppShell, RequireAuth
  views/       una carpeta por flujo (cotizaciones, polizas, siniestros, suscripcion)
  utils/       formato, validación, cálculo de prima
```

## Huecos del backend que el frontend ya anticipa

- **Rol `ASESOR`** no existe en `auth-service` (`Rol`: CLIENTE, SUSCRIPTOR, AJUSTADOR, ADMIN).
- **Evaluación automática**: `POST /cotizaciones` deja la cotización en `SOLICITADA` y `/evaluacion` exige rol SUSCRIPTOR/ADMIN; un cliente real no puede obtener su prima. El mock la evalúa al crear.
- **Listados**: no hay `GET` de cotizaciones/pólizas/siniestros por cliente, ni bandeja de pendientes del suscriptor. Con cotizaciones reales, "Mis cotizaciones" usa los IDs guardados en el navegador.
- **`clienteId` en el JWT**: el claim solo existe si el usuario fue vinculado; no hay endpoint para vincularlo. El frontend registra el cliente (`POST /clientes`) y recuerda el id en el navegador.
- **Siniestros**: faltan asignar ajustador, cerrar caso, listar ajustadores e historial/timeline (endpoints asumidos en `siniestrosService.js`).
- **CORS**: el gateway no lo configura; en desarrollo se usa el proxy de Vite (`VITE_GATEWAY_URL`), en producción hace falta un reverse proxy o CORS en el gateway.
