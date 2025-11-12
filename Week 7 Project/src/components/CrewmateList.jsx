import CrewmateCard from './CrewmateCard.jsx'

export default function CrewmateList({ crew }) {
  if (!crew.length) {
    return (
      <div className="empty-state card">
        <p>No legends in your Fantasy Team exist yet. Add a legend to get started!</p>
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
