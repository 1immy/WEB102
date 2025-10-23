import { useCallback, useEffect, useState } from 'react'
import './App.css'

const RANDOM_USER_API = 'https://randomuser.me/api/'
const MAX_FETCH_ATTEMPTS = 12

function App() {
  const [currentProfile, setCurrentProfile] = useState(null)
  const [banList, setBanList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchNewProfile = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt += 1) {
        const response = await fetch(RANDOM_USER_API)

        if (!response.ok) {
          throw new Error('Request to Random User API failed.')
        }

        const data = await response.json()
        const user = data?.results?.[0]

        if (!user) {
          continue
        }

        const country = user.location?.country
        const picture = user.picture?.large

        if (!country || !picture) {
          continue
        }

        if (banList.includes(country)) {
          continue
        }

        const firstName = user.name?.first ?? ''
        const lastName = user.name?.last ?? ''

        setCurrentProfile({
          id: user.login?.uuid ?? `${firstName}-${lastName}-${Date.now()}`,
          fullName: `${firstName} ${lastName}`.trim(),
          country,
          picture,
          email: user.email,
          username: user.login?.username ?? '',
          city: user.location?.city ?? '',
          age: user.dob?.age ?? '',
        })

        return
      }

      setCurrentProfile(null)
      setError(
        'No new discoveries available right now. Remove a ban or try again in a moment.',
      )
    } catch (fetchError) {
      console.error(fetchError)
      setCurrentProfile(null)
      setError('Unable to reach the discovery service. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [banList])

  useEffect(() => {
    fetchNewProfile()
  }, [fetchNewProfile])

  useEffect(() => {
    if (currentProfile && banList.includes(currentProfile.country)) {
      fetchNewProfile()
    }
  }, [banList, currentProfile, fetchNewProfile])

  const handleAddBan = (value) => {
    if (!value) {
      return
    }

    setBanList((prev) => (prev.includes(value) ? prev : [...prev, value]))
  }

  const handleRemoveBan = (value) => {
    setBanList((prev) => prev.filter((item) => item !== value))
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Veni Vici Explorer</h1>
        <p className="tagline">
          Click discover and meet someone new. For people with strong preferences, you may ban countries to adjust the people you meet.
        </p>
      </header>

      <section className="controls">
        <button
          className="discover-button"
          onClick={fetchNewProfile}
          disabled={loading}
          type="button"
        >
          {loading ? 'Finding someone...' : 'Discover Someone New'}
        </button>
        {error ? <p className="status status-error">{error}</p> : null}
      </section>

      <main className="content">
        {currentProfile ? (
          <article className="profile-card" key={currentProfile.id}>
            <div className="image-wrapper">
              <img
                src={currentProfile.picture}
                alt={`Portrait of ${currentProfile.fullName || 'a random user'}`}
                loading="lazy"
              />
            </div>
            <div className="details">
              <h2>{currentProfile.fullName || currentProfile.username}</h2>
              <p className="detail-line">
                <span className="detail-label">From</span>
                <button
                  className="attribute-button"
                  onClick={() => handleAddBan(currentProfile.country)}
                  type="button"
                >
                  {currentProfile.country}
                </button>
              </p>
              {currentProfile.city ? (
                <p className="detail-line">
                  <span className="detail-label">City</span>
                  <span>{currentProfile.city}</span>
                </p>
              ) : null}
              {currentProfile.age ? (
                <p className="detail-line">
                  <span className="detail-label">Age</span>
                  <span>{currentProfile.age}</span>
                </p>
              ) : null}
              <p className="detail-line">
                <span className="detail-label">Email</span>
                <span>{currentProfile.email}</span>
              </p>
              <p className="detail-line">
                <span className="detail-label">Username</span>
                <span>{currentProfile.username}</span>
              </p>
            </div>
          </article>
        ) : (
          <div className="empty-state">
            <p>Ready for your next discovery. Hit the button to begin!</p>
          </div>
        )}
      </main>

      <section className="ban-list">
        <h3>Ban List</h3>
        {banList.length === 0 ? (
          <p className="ban-hint">
            Click the country on a profile to skip it in future discoveries.
          </p>
        ) : (
          <ul className="ban-items">
            {banList.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="ban-chip"
                  onClick={() => handleRemoveBan(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="app-footer">
        <p>
          Data obtained from{' '}
          <a
            href="https://randomuser.me"
            target="_blank"
            rel="noreferrer"
            className="api-link"
          >
            randomuser.me
          </a>
          .
        </p>
      </footer>
    </div>
  )
}

export default App
