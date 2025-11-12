import CrewmateForm from '../components/CrewmateForm.jsx'
import CrewmateList from '../components/CrewmateList.jsx'
import { useCrewmates } from '../context/CrewmatesContext.jsx'

export default function TeamBuilderPage() {
  const { crew, loading, error, addCrewmate, isSaving } = useCrewmates()
  const sortedCrew = [...crew].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <div className="page team-builder">
      <header className="page-header">
        <div>
          <p className="eyebrow">Apex Legends Character Creator</p>
          <h1>Create your own Apex Fantasy Team!</h1>
          <p>Change classes, kit and even lore notes to build your Apex Legends team.</p>
        </div>
        <div className="page-header__stats card">
          <p>Total legends prepped</p>
          <strong>{crew.length}</strong>
        </div>
      </header>

      <section className="split-panel">
        <CrewmateForm
          heading="Add a new legend"
          submitLabel="Add to dropship manifest"
          loading={isSaving}
          onSubmit={addCrewmate}
        />

        <div className="panel card">
          <div className="panel__header">
            <h2>Active roster</h2>
            <p>Newest legends appear first.</p>
          </div>
          {error && <p className="status-message status-message--error">{error}</p>}
          {loading ? (
            <p className="status-message">Loading roster…</p>
          ) : (
            <CrewmateList crew={sortedCrew} />
          )}
        </div>
      </section>
    </div>
  )
}
