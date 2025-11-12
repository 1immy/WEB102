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
        setError(err instanceof Error ? err.message : 'Unable to load that legend.')
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
        <p className="status-message">Loading infomation..</p>
      </div>
    )
  }

  if (error || !crewmate) {
    return (
      <div className="page detail-page">
        <p className="status-message status-message--error">{error || 'Legend not found.'}</p>
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
          <p className="eyebrow">Legend Tablet</p>
          <h1>{crewmate.name}</h1>
          <p>Deep lore, kit notes and scouting intel for this legend.</p>
        </div>
        <div className="page-header__actions">
          <Link to={`/crewmates/${crewmate.id}/edit`} className="button-link">
            Edit legend
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
              <dt>Legend class</dt>
              <dd>{crewmate.role}</dd>
            </div>
            <div>
              <dt>Tactical focus</dt>
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
            <h3>Drop-in lore</h3>
            <p>{crewmate.bio || 'No intel yet.'}</p>
          </div>

          <p className="detail-card__hint">
            Share this roster with your squadmates to sync info for {crewmate.name}:
            <br />
            <code>{window.location.href}</code>
          </p>
        </div>
      </section>
    </div>
  )
}
