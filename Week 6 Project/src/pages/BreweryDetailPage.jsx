import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useBreweryData } from '../context/BreweryDataContext.jsx'
import './BreweryDetailPage.css'

const label = (value) =>
  value
    ? value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Unknown'

export default function BreweryDetailPage() {
  const { breweryId } = useParams()
  const decodedId = useMemo(
    () => decodeURIComponent(breweryId ?? ''),
    [breweryId],
  )
  const { breweries } = useBreweryData()

  const brewery = useMemo(
    () =>
      breweries.find(
        (item) => String(item?.id ?? item?.obdb_id ?? '') === decodedId,
      ),
    [breweries, decodedId],
  )

  const peers = useMemo(() => {
    if (!brewery?.state) {
      return []
    }

    return breweries
      .filter(
        (item) => item?.state === brewery.state && item?.id !== brewery.id,
      )
      .slice(0, 3)
  }, [breweries, brewery])

  if (!brewery) {
    return (
      <div className="detail">
        <Link className="detail__back" to="/dashboard">
          ← Back to dashboard
        </Link>
        <div className="detail__card">
          <p>We could not find that brewery. Try selecting it from the list.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="detail">
      <Link className="detail__back" to="/dashboard">
        ← Back to dashboard
      </Link>

      <header className="detail__hero">
        <div>
          <p className="detail__eyebrow">{brewery.state ?? 'Unknown state'}</p>
          <h1>{brewery.name}</h1>
          <p className="detail__meta">
            {brewery.city ?? 'Unknown city'} · {label(brewery.brewery_type)} ·{' '}
            {brewery.country ?? 'United States'}
          </p>
        </div>
        {brewery.website_url && (
          <a
            className="detail__action"
            href={brewery.website_url}
            target="_blank"
            rel="noreferrer"
          >
            Visit website
          </a>
        )}
      </header>

      <section className="detail__grid">
        <article>
          <h2>Contact</h2>
          <dl>
            <div>
              <dt>Phone</dt>
              <dd>{brewery.phone || 'Not listed'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{brewery?.email || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                {brewery.street ? `${brewery.street}, ` : ''}
                {brewery.city}, {brewery.state} {brewery.postal_code}
              </dd>
            </div>
          </dl>
        </article>
        <article>
          <h2>Coordinates</h2>
          <dl>
            <div>
              <dt>Latitude</dt>
              <dd>{brewery.latitude ?? '—'}</dd>
            </div>
            <div>
              <dt>Longitude</dt>
              <dd>{brewery.longitude ?? '—'}</dd>
            </div>
            <div>
              <dt>Created at</dt>
              <dd>{brewery?.created_at ? new Date(brewery.created_at).toLocaleDateString() : 'Unknown'}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="detail__card">
        <h2>About this brewery</h2>
        <p>
          {brewery.name} operates as a {label(brewery.brewery_type)} brewery.{' '}
          {brewery.city
            ? `It is based in ${brewery.city}, ${brewery.state}.`
            : 'Its city was not provided by the dataset.'}
          {' '}
          Use the location details above to plan your visit or learn more by
          exploring their website.
        </p>
      </section>

      {peers.length > 0 && (
        <section className="detail__card">
          <div className="detail__list-header">
            <div>
              <h2>Other breweries in {brewery.state}</h2>
              <p>These are nearby spots pulled from the dataset.</p>
            </div>
          </div>
          <ul className="peer-list">
            {peers.map((peer) => {
              const identifier =
                peer.id ?? peer.obdb_id ?? `${peer.name}-${peer.city}`
              return (
                <li key={identifier}>
                  <div>
                    <Link to={`/breweries/${encodeURIComponent(identifier)}`}>
                      {peer.name}
                    </Link>
                    <p>
                      {peer.city ?? 'Unknown city'} · {label(peer.brewery_type)}
                    </p>
                  </div>
                  {peer.website_url ? (
                    <a href={peer.website_url} target="_blank" rel="noreferrer">
                      Website
                    </a>
                  ) : (
                    <span>No site</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
