import { Link, Navigate, useLocation } from 'react-router-dom'
import { env } from '../config/env'
import { useAuth } from '../hooks/useAuth'
import { useAction } from '../hooks/useAction'
import { useStepForm } from '../hooks/useStepForm'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/ui/Button'
import { TextField } from '../components/ui/Fields'
import { ErrorAlert } from '../components/ui/Alert'
import { ROL_LABEL } from '../contracts/enums'

const DEMO = ['cliente', 'suscriptor', 'asesor', 'ajustador', 'admin']
const STEP = [{
  id: 'login',
  validate: (v) => ({
    ...(!v.username.trim() && { username: 'Ingresa tu usuario' }),
    ...(!v.password && { password: 'Ingresa tu contraseña' }),
  }),
}]

export default function Login() {
  const { login, autenticado } = useAuth()
  const location = useLocation()
  const form = useStepForm(STEP, { username: '', password: '' })
  const { run, loading, error } = useAction(() => login(form.values.username.trim(), form.values.password))

  // Tras iniciar sesión, `autenticado` pasa a true y se vuelve a la ruta que se intentaba abrir.
  if (autenticado) return <Navigate to={location.state?.from ?? '/app'} replace />

  return (
    <AuthLayout title="Inicia sesión" subtitle="Accede a tus cotizaciones, pólizas y siniestros."
      footer={<>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></>}>
      <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); if (form.next()) run() }}>
        <TextField label="Usuario" autoComplete="username" autoFocus {...form.bind('username')} />
        <TextField label="Contraseña" type="password" autoComplete="current-password" {...form.bind('password')} />
        <ErrorAlert error={error} />
        <Button type="submit" block loading={loading}>Entrar</Button>
      </form>

      {env.isMock('auth') && (
        <div className="card card--flat demo-accounts">
          <strong className="small">Cuentas de demostración (contraseña Demo12345)</strong>
          <div className="chips">
            {DEMO.map((u) => (
              <button key={u} type="button" className="chip"
                onClick={() => { form.set('username', u); form.set('password', 'Demo12345') }}>
                {ROL_LABEL[u.toUpperCase()]}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
