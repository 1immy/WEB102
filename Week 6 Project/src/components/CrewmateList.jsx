import CrewmateCard from './CrewmateCard.jsx'

export default function CrewmateList({ crew }) {
  if (!crew.length) {
    return (
      <div className="empty-state card">
        <p>No crewmates yet. Draft someone on the left to start building your squad.</p>
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
