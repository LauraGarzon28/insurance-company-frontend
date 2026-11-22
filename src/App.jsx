import { Route, Routes } from 'react-router-dom'
import { Rol } from './contracts/enums'
import RequireAuth from './components/RequireAuth'
import AppShell from './components/AppShell'

import Landing from './views/Landing'
import Login from './views/Login'
import Register from './views/Register'
import NotFound from './views/NotFound'
import Dashboard from './views/Dashboard'
import Confirmacion from './views/Confirmacion'
import Cotizar from './views/cotizaciones/Cotizar'
import Cotizaciones from './views/cotizaciones/Cotizaciones'
import CotizacionDetalle from './views/cotizaciones/CotizacionDetalle'
import EmitirPoliza from './views/polizas/EmitirPoliza'
import Polizas from './views/polizas/Polizas'
import PolizaDetalle from './views/polizas/PolizaDetalle'
import Siniestros from './views/siniestros/Siniestros'
import SiniestroDetalle from './views/siniestros/SiniestroDetalle'
import ReportarSiniestro from './views/siniestros/ReportarSiniestro'
import Revision from './views/suscripcion/Revision'
import Reglas from './views/suscripcion/Reglas'
import Historico from './views/suscripcion/Historico'

const { CLIENTE, SUSCRIPTOR, ASESOR, AJUSTADOR, ADMIN } = Rol

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="confirmacion" element={<Confirmacion />} />

          <Route element={<RequireAuth roles={[CLIENTE]} />}>
            <Route path="cotizar" element={<Cotizar />} />
            <Route path="cotizaciones" element={<Cotizaciones />} />
            <Route path="cotizaciones/:id/emitir" element={<EmitirPoliza />} />
            <Route path="polizas" element={<Polizas />} />
            <Route path="polizas/:id" element={<PolizaDetalle />} />
            <Route path="siniestros/nuevo" element={<ReportarSiniestro />} />
          </Route>

          <Route element={<RequireAuth roles={[CLIENTE, SUSCRIPTOR, ADMIN]} />}>
            <Route path="cotizaciones/:id" element={<CotizacionDetalle />} />
          </Route>

          <Route element={<RequireAuth roles={[CLIENTE, ASESOR, AJUSTADOR, SUSCRIPTOR, ADMIN]} />}>
            <Route path="siniestros" element={<Siniestros />} />
            <Route path="siniestros/:id" element={<SiniestroDetalle />} />
          </Route>

          <Route element={<RequireAuth roles={[SUSCRIPTOR, ADMIN]} />}>
            <Route path="revision" element={<Revision />} />
            <Route path="reglas" element={<Reglas />} />
            <Route path="historico" element={<Historico />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
