import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCrewmateById } from '../services/crewmates.js'

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function CrewmateDetailPage() {
  const { crewmateId } = useParams()
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
        setError(err instanceof Error ? err.message : 'Unable to load that crewmate.')
      } finally {
        setLoading(false)
      }
    }

    loadCrewmate()
  }, [crewmateId])

  const joinedDate = useMemo(() => {
    if (!crewmate?.created_at) return ''
    return formatter.format(new Date(crewmate.created_at))
  }, [crewmate])

  if (loading) {
    return (
      <div className="page detail-page">
        <p className="status-message">Loading dossier…</p>
      </div>
    )
  }

  if (error || !crewmate) {
    return (
      <div className="page detail-page">
        <p className="status-message status-message--error">{error || 'Crewmate not found.'}</p>
        <Link to="/" className="button-link">
          Return to roster
        </Link>
      </div>
    )
  }

  return (
    <div className="page detail-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Crewmate dossier</p>
          <h1>{crewmate.name}</h1>
          <p>Detailed intel that is only visible on this page.</p>
        </div>
        <div className="page-header__actions">
          <Link to={`/crewmates/${crewmate.id}/edit`} className="button-link">
            Edit crewmate
          </Link>
          <Link to="/" className="button-link button-link--muted">
            Back to roster
          </Link>
        </div>
      </header>

      <section className="detail-card card">
        <div className="detail-card__avatar">
          {crewmate.avatar ? (
            <img src={crewmate.avatar} alt={`${crewmate.name}`} />
          ) : (
            <span>{crewmate.name?.slice(0, 1).toUpperCase() || '?'}</span>
          )}
        </div>
        <div className="detail-card__content">
          <dl>
            <div>
              <dt>Role</dt>
              <dd>{crewmate.role}</dd>
            </div>
            <div>
              <dt>Specialty</dt>
              <dd>{crewmate.specialty}</dd>
            </div>
            <div>
              <dt>Recruitment date</dt>
              <dd>{joinedDate}</dd>
            </div>
            <div>
              <dt>Database ID</dt>
              <dd>{crewmate.id}</dd>
            </div>
          </dl>

          <div className="detail-card__bio">
            <h3>Backstory</h3>
            <p>{crewmate.bio || 'No intel yet.'}</p>
          </div>

          <p className="detail-card__hint">
            Share this link with your teammates to brag about {crewmate.name}&rsquo;s skills:
            <br />
            <code>{window.location.href}</code>
          </p>
        </div>
      </section>
    </div>
  )
}
