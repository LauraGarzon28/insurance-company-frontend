import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { cotizacionesService, hayBandejaPendientes } from '../../services/cotizacionesService'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { TextField } from '../../components/ui/Fields'
import { AsyncView, EmptyState } from '../../components/ui/States'
import { FilterChips } from '../../components/ui/Display'
import { CotizacionCard } from '../../components/domain/Cards'

export default function Revision() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('EN_REVISION_MANUAL')
  const [id, setId] = useState('')
  const state = useAsync(() => cotizacionesService.listarPendientes(), [])

  return (
    <>
      <PageHeader title="Revisión de riesgos" subtitle="Evalúa las cotizaciones marcadas para revisión manual y aprueba o rechaza el riesgo." />
      <div className="stack stack--lg">
        {!hayBandejaPendientes && (
          <Alert tone="info">
            El servicio de cotizaciones aún no ofrece un listado de pendientes. Mientras tanto, abre una cotización con su ID.
          </Alert>
        )}
        <Card title="Buscar cotización por ID">
          <form className="row" style={{ alignItems: 'flex-end' }} onSubmit={(e) => { e.preventDefault(); if (id.trim()) navigate(`/app/cotizaciones/${id.trim()}`) }}>
            <TextField label="ID de la cotización" value={id} onChange={(e) => setId(e.target.value)} className="" placeholder="xxxxxxxx-xxxx-…" />
            <Button type="submit" disabled={!id.trim()}>Abrir</Button>
          </form>
        </Card>

        {hayBandejaPendientes && (
          <AsyncView state={state}>
            {(lista) => {
              const visibles = lista.filter((c) => !filtro || c.estado === filtro)
              const n = (e) => lista.filter((c) => c.estado === e).length
              return (
                <div className="stack">
                  <FilterChips label="Filtrar" value={filtro} onChange={setFiltro} options={[
                    { value: 'EN_REVISION_MANUAL', label: `Revisión manual (${n('EN_REVISION_MANUAL')})` },
                    { value: 'SOLICITADA', label: `Por evaluar (${n('SOLICITADA')})` },
                    { value: '', label: `Todas (${lista.length})` },
                  ]} />
                  {visibles.length ? <div className="grid grid--2">{visibles.map((c) => <CotizacionCard key={c.id} cotizacion={c} />)}</div>
                    : <EmptyState icon="checkCircle" title="Bandeja al día">No hay cotizaciones pendientes en esta categoría.</EmptyState>}
                </div>
              )
            }}
          </AsyncView>
        )}
      </div>
    </>
  )
}
