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
          <p className="eyebrow">Operation Starforge</p>
          <h1>Assemble your dream strike team</h1>
          <p>Create wildly different specialists, then keep tabs on their dossiers.</p>
        </div>
        <div className="page-header__stats card">
          <p>Total crewmates</p>
          <strong>{crew.length}</strong>
        </div>
      </header>

      <section className="split-panel">
        <CrewmateForm
          heading="Recruit a new crewmate"
          submitLabel="Add to roster"
          loading={isSaving}
          onSubmit={addCrewmate}
        />

        <div className="panel card">
          <div className="panel__header">
            <h2>Active roster</h2>
            <p>Sorted by most recent recruits.</p>
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
