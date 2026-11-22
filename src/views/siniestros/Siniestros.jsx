import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { Rol } from '../../contracts/enums'
import { siniestrosService } from '../../services/siniestrosService'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { AsyncView, EmptyState } from '../../components/ui/States'
import { FilterChips } from '../../components/ui/Display'
import { SiniestroCard } from '../../components/domain/Cards'

const TEXTOS = {
  [Rol.CLIENTE]: ['Mis siniestros', 'Consulta el estado de tus reclamaciones.'],
  [Rol.AJUSTADOR]: ['Mis casos asignados', 'Evalúa y resuelve los siniestros que te asignaron.'],
  default: ['Siniestros reportados', 'Revisa los reportes y asigna cada siniestro a un ajustador.'],
}

/** Bandeja de siniestros: el alcance de la consulta depende del rol. */
export default function Siniestros() {
  const { usuario, rolPrincipal } = useAuth()
  const [filtro, setFiltro] = useState('')
  const esCliente = rolPrincipal === Rol.CLIENTE
  const esAjustador = rolPrincipal === Rol.AJUSTADOR
  const [titulo, subtitulo] = TEXTOS[rolPrincipal] ?? TEXTOS.default

  const state = useAsync(() => {
    if (esCliente) return usuario.clienteId ? siniestrosService.listar({ clienteId: usuario.clienteId }) : []
    return siniestrosService.listar(esAjustador ? { ajustadorId: usuario.id } : {})
  }, [esCliente, esAjustador, usuario.id, usuario.clienteId])

  return (
    <>
      <PageHeader title={titulo} subtitle={subtitulo}
        actions={esCliente && <Button to="/app/siniestros/nuevo">Reportar siniestro</Button>} />
      <AsyncView state={state}>
        {(lista) => {
          if (!lista.length) {
            return <EmptyState icon="inbox" title="No hay siniestros por ahora"
              action={esCliente && <Button to="/app/siniestros/nuevo">Reportar un siniestro</Button>}>
              {esCliente ? 'Si tienes un percance con una póliza vigente, repórtalo aquí.' : 'Cuando haya casos aparecerán en esta bandeja.'}
            </EmptyState>
          }
          const n = (e) => lista.filter((s) => s.estado === e).length
          const visibles = filtro ? lista.filter((s) => s.estado === filtro) : lista
          return (
            <div className="stack">
              <FilterChips label="Filtrar por estado" value={filtro} onChange={setFiltro} options={[
                { value: '', label: `Todos (${lista.length})` },
                { value: 'REPORTADO', label: `${esCliente || esAjustador ? 'Reportados' : 'Por asignar'} (${n('REPORTADO')})` },
                { value: 'EN_EVALUACION', label: `En evaluación (${n('EN_EVALUACION')})` },
                { value: 'APROBADO', label: `Aprobados (${n('APROBADO')})` },
                { value: 'RECHAZADO', label: `Rechazados (${n('RECHAZADO')})` },
                { value: 'CERRADO', label: `Cerrados (${n('CERRADO')})` },
              ]} />
              {visibles.length ? <div className="grid">{visibles.map((s) => <SiniestroCard key={s.id} siniestro={s} />)}</div>
                : <EmptyState icon="search" title="Sin resultados">No hay siniestros con ese estado.</EmptyState>}
            </div>
          )
        }}
      </AsyncView>
    </>
  )
}
