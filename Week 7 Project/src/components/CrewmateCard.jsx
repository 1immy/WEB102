import { useState } from 'react'
import { Link } from 'react-router-dom'

function CrewBadge({ label }) {
  return <span className="crew-badge">{label}</span>
}

export default function CrewmateCard({ crewmate }) {
  const [imageBroken, setImageBroken] = useState(false)
  const detailPath = `/crewmates/${crewmate.id}`
  const editPath = `/crewmates/${crewmate.id}/edit`
  const initials = crewmate.name?.slice(0, 1).toUpperCase() || '?'

  return (
    <article className="crewmate-card card">
      <Link to={detailPath} className="crewmate-card__primary">
        {crewmate.avatar && !imageBroken ? (
          <img
            src={crewmate.avatar}
            alt={`${crewmate.name} avatar`}
            className="crewmate-card__avatar"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <span className="crewmate-card__fallback">{initials}</span>
        )}
        <div>
          <h3>{crewmate.name}</h3>
          <p className="crewmate-card__meta">
            {crewmate.bio || 'No drop intel logged yet.'}
          </p>
          <div className="crewmate-card__badges">
            <CrewBadge label={crewmate.role} />
            <CrewBadge label={crewmate.specialty} />
          </div>
        </div>
      </Link>
      <div className="crewmate-card__actions">
        <Link to={detailPath}>Details</Link>
        <Link to={editPath} className="link-secondary">
          Edit
        </Link>
      </div>
    </article>
  )
}
