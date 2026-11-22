import { useNavigate } from 'react-router-dom'
import { useAction } from '../../hooks/useAction'
import { useStepForm } from '../../hooks/useStepForm'
import { Rol, ROL_LABEL } from '../../contracts/enums'
import { authService } from '../../services/authService'
import { isEmail } from '../../utils/validation'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { TextField, ChoiceField } from '../../components/ui/Fields'
import { ErrorAlert } from '../../components/ui/Alert'

const ROLES = [Rol.SUSCRIPTOR, Rol.ASESOR, Rol.AJUSTADOR, Rol.ADMIN]

const STEP = [{
  id: 'usuario',
  validate: (v) => ({
    ...((v.username.trim().length < 3 || v.username.trim().length > 50) && { username: 'El usuario debe tener entre 3 y 50 caracteres' }),
    ...(!isEmail(v.correo) && { correo: 'Ingresa un correo válido' }),
    ...(v.password.length < 8 && { password: 'La contraseña debe tener al menos 8 caracteres' }),
    ...(v.confirm !== v.password && { confirm: 'Las contraseñas no coinciden' }),
    ...(!v.rol && { rol: 'Selecciona un rol' }),
  }),
}]

export default function CrearUsuario() {
  const navigate = useNavigate()
  const form = useStepForm(STEP, { username: '', correo: '', password: '', confirm: '', rol: '' })
  const crear = useAction(async () => {
    const { username, correo, password, rol } = form.values
    const usuario = await authService.crearInterno({
      username: username.trim(),
      correo: correo.trim(),
      password,
      roles: [rol],
    })
    navigate('/app/confirmacion', {
      state: {
        title: 'Usuario creado',
        message: 'El nuevo usuario ya puede iniciar sesión con su contraseña.',
        details: [
          ['Usuario', usuario.username],
          ['Correo', usuario.correo],
          ['Rol', ROL_LABEL[usuario.roles[0]]],
        ],
        contexto: 'crear usuario',
      },
    })
  })

  return (
    <>
      <PageHeader title="Crear usuario" subtitle="Crea cuentas internas para el personal de la aseguradora." />
      <Card title="Datos de la cuenta" accent>
        <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); if (form.next()) crear.run() }}>
          <div className="grid grid--2">
            <TextField label="Usuario" autoComplete="username" {...form.bind('username')} />
            <TextField label="Correo electrónico" type="email" autoComplete="email" {...form.bind('correo')} />
            <TextField label="Contraseña" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres." {...form.bind('password')} />
            <TextField label="Confirmar contraseña" type="password" autoComplete="new-password" {...form.bind('confirm')} />
          </div>
          <ChoiceField
            label="Rol"
            name="rol"
            value={form.values.rol}
            error={form.errors.rol}
            onChange={(e) => form.set('rol', e.target.value)}
            options={ROLES.map((rol) => ({ value: rol, label: ROL_LABEL[rol] }))}
          />
          <ErrorAlert error={crear.error} />
          <div className="row">
            <Button type="submit" loading={crear.loading}>Crear usuario</Button>
            <Button type="button" variant="secondary" to="/app">Cancelar</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
