import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CrewmateForm from '../components/CrewmateForm.jsx'
import { useCrewmates } from '../context/CrewmatesContext.jsx'
import { fetchCrewmateById } from '../services/crewmates.js'

export default function EditCrewmatePage() {
  const { crewmateId } = useParams()
  const navigate = useNavigate()
  const { editCrewmate, removeCrewmate, isSaving } = useCrewmates()
  const [crewmate, setCrewmate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCrewmate() {
      try {
        setLoading(true)
        setError('')
        const data = await fetchCrewmateById(crewmateId)
        setCrewmate(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load that legend.')
      } finally {
        setLoading(false)
      }
    }

    loadCrewmate()
  }, [crewmateId])

  const handleSubmit = async (values) => {
    const updated = await editCrewmate(crewmateId, values)
    setCrewmate(updated)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Remove this legend from your roster?')
    if (!confirmed) return
    await removeCrewmate(crewmateId)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="page edit-page">
        <p className="status-message">Loading edit form…</p>
      </div>
    )
  }

  if (error || !crewmate) {
    return (
      <div className="page edit-page">
        <p className="status-message status-message--error">{error || 'Legend not found.'}</p>
        <Link to="/" className="button-link">
          Return to roster
        </Link>
      </div>
    )
  }

  return (
    <div className="page edit-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Legend tuning</p>
          <h1>Dial in {crewmate.name}</h1>
          <p>Swap loadouts, rewrite character story and keep the squad ready for the next drop.</p>
        </div>
        <Link to={`/crewmates/${crewmate.id}`} className="button-link button-link--muted">
          View details
        </Link>
      </header>

      <CrewmateForm
        heading="Edit legend dossier"
        initialValues={crewmate}
        submitLabel="Save legend updates"
        loading={isSaving}
        onSubmit={handleSubmit}
      />

      <button type="button" className="button-danger" onClick={handleDelete} disabled={isSaving}>
        Remove this legend
      </button>
    </div>
  )
}
