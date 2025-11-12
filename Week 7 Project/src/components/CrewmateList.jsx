import CrewmateCard from './CrewmateCard.jsx'

export default function CrewmateList({ crew }) {
  if (!crew.length) {
    return (
      <div className="empty-state card">
        <p>No legends in prep. Lock in your first pick to start theorycrafting comps.</p>
      </div>
    )
  }

  return (
    <div className="crewmate-list">
      {crew.map((mate) => (
        <CrewmateCard key={mate.id} crewmate={mate} />
      ))}
    </div>
  )
}
