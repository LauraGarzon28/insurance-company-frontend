import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAction } from '../hooks/useAction'
import { useStepForm } from '../hooks/useStepForm'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/ui/Button'
import { TextField } from '../components/ui/Fields'
import { ErrorAlert } from '../components/ui/Alert'
import { isEmail } from '../utils/validation'

// Mismas reglas que RegistroRequest del auth-service.
const validate = (v) => ({
  ...((v.username.trim().length < 3 || v.username.trim().length > 50) && { username: 'El usuario debe tener entre 3 y 50 caracteres' }),
  ...(!isEmail(v.correo) && { correo: 'Ingresa un correo válido' }),
  ...(v.password.length < 8 && { password: 'La contraseña debe tener al menos 8 caracteres' }),
  ...(v.confirm !== v.password && { confirm: 'Las contraseñas no coinciden' }),
})

export default function Register() {
  const { register, autenticado } = useAuth()
  const form = useStepForm([{ id: 'registro', validate }], { username: '', correo: '', password: '', confirm: '' })
  const { run, loading, error } = useAction(() => {
    const { username, correo, password } = form.values
    return register({ username: username.trim(), correo: correo.trim(), password })
  })

  if (autenticado) return <Navigate to="/app" replace />

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Es gratis y toma menos de un minuto."
      footer={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}>
      <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); if (form.next()) run() }}>
        <TextField label="Usuario" autoComplete="username" autoFocus {...form.bind('username')} />
        <TextField label="Correo electrónico" type="email" autoComplete="email" {...form.bind('correo')} />
        <TextField label="Contraseña" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres." {...form.bind('password')} />
        <TextField label="Confirmar contraseña" type="password" autoComplete="new-password" {...form.bind('confirm')} />
        <ErrorAlert error={error} />
        <Button type="submit" block loading={loading}>Crear cuenta</Button>
      </form>
    </AuthLayout>
  )
}
