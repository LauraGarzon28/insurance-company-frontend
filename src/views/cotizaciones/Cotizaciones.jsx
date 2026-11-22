import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAsync } from '../../hooks/useAsync'
import { cotizacionesService } from '../../services/cotizacionesService'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { AsyncView, EmptyState } from '../../components/ui/States'
import { FilterChips } from '../../components/ui/Display'
import { CotizacionCard } from '../../components/domain/Cards'

const FILTROS = {
  '': () => true,
  abiertas: (c) => ['SOLICITADA', 'EN_REVISION_MANUAL', 'COTIZADA'].includes(c.estado),
  ACEPTADA: (c) => c.estado === 'ACEPTADA',
  RECHAZADA: (c) => c.estado === 'RECHAZADA',
}

export default function Cotizaciones() {
  const { usuario } = useAuth()
  const [filtro, setFiltro] = useState('')
  const state = useAsync(() => (usuario.clienteId ? cotizacionesService.listarPorCliente(usuario.clienteId) : []), [usuario.clienteId])

  return (
    <>
      <PageHeader title="Mis cotizaciones" subtitle="Consulta el estado de tus cotizaciones y acepta las que quieras emitir."
        actions={<Button to="/app/cotizar">Nueva cotización</Button>} />
      <AsyncView state={state}>
        {(lista) => {
          if (!lista.length) {
            return <EmptyState icon="file" title="Aún no tienes cotizaciones" action={<Button to="/app/cotizar">Cotizar un seguro</Button>}>
              Cuando cotices un riesgo, aparecerá aquí con su estado.
            </EmptyState>
          }
          const visibles = lista.filter(FILTROS[filtro])
          return (
            <div className="stack">
              <FilterChips label="Filtrar por estado" value={filtro} onChange={setFiltro} options={[
                { value: '', label: `Todas (${lista.length})` }, { value: 'abiertas', label: 'Abiertas' },
                { value: 'ACEPTADA', label: 'Aceptadas' }, { value: 'RECHAZADA', label: 'Rechazadas' },
              ]} />
              {visibles.length ? <div className="grid grid--2">{visibles.map((c) => <CotizacionCard key={c.id} cotizacion={c} />)}</div>
                : <EmptyState icon="search" title="Sin resultados">No hay cotizaciones con ese filtro.</EmptyState>}
            </div>
          )
        }}
      </AsyncView>
    </>
  )
}
