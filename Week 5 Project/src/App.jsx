import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'https://api.openbrewerydb.org/v1/breweries?per_page=50'
const EARTH_RADIUS_MILES = 3958.8

const toRadians = (value) => (value * Math.PI) / 180

const haversineDistanceMiles = (lat1, lon1, lat2, lon2) => {
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_MILES * c
}

function App() {
  const [breweries, setBreweries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [userLatitude, setUserLatitude] = useState('43.0731')
  const [userLongitude, setUserLongitude] = useState('-89.4012')
  const [minDistance, setMinDistance] = useState('')
  const [maxDistance, setMaxDistance] = useState('')

  useEffect(() => {
    const fetchBreweries = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(API_URL)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (Array.isArray(data)) {
          setBreweries(data)
        } else {
          setBreweries([])
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong while fetching breweries.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBreweries()
  }, [])

  const userLocation = useMemo(() => {
    const latitude = Number.parseFloat(userLatitude)
    const longitude = Number.parseFloat(userLongitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null
    }

    return { latitude, longitude }
  }, [userLatitude, userLongitude])

  const breweryTypes = useMemo(() => {
    const types = new Set()
    breweries.forEach((brewery) => {
      if (brewery?.brewery_type) {
        types.add(brewery.brewery_type)
      }
    })

    return ['all', ...Array.from(types).sort()]
  }, [breweries])

  const filteredBreweries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const minDistanceValue = Number.parseFloat(minDistance)
    const maxDistanceValue = Number.parseFloat(maxDistance)
    const hasMinDistance = Number.isFinite(minDistanceValue)
    const hasMaxDistance = Number.isFinite(maxDistanceValue)

    const matchesQuery = (brewery) => {
      if (!normalizedQuery) {
        return true
      }

      const searchableFields = [
        brewery?.name ?? '',
        brewery?.city ?? '',
        brewery?.state ?? '',
      ]

      return searchableFields.some((field) =>
        field.toLowerCase().includes(normalizedQuery),
      )
    }

    const matchesSelectedType = (brewery) =>
      selectedType === 'all' || brewery?.brewery_type === selectedType

    const matchesDistanceBounds = (brewery) => {
      if (!hasMinDistance && !hasMaxDistance) {
        return true
      }

      if (!Number.isFinite(brewery.distance)) {
        return false
      }

      if (hasMinDistance && brewery.distance < minDistanceValue) {
        return false
      }

      if (hasMaxDistance && brewery.distance > maxDistanceValue) {
        return false
      }

      return true
    }

    return breweries
      .map((brewery) => {
        const latitude = Number.parseFloat(brewery?.latitude)
        const longitude = Number.parseFloat(brewery?.longitude)
        const hasValidCoordinates =
          Number.isFinite(latitude) && Number.isFinite(longitude)

        const distance =
          userLocation && hasValidCoordinates
            ? haversineDistanceMiles(
                userLocation.latitude,
                userLocation.longitude,
                latitude,
                longitude,
              )
            : null

        return { ...brewery, distance }
      })
      .filter(
        (brewery) => matchesQuery(brewery) && matchesSelectedType(brewery),
      )
      .filter((brewery) => matchesDistanceBounds(brewery))
      .sort((a, b) => {
        const nameA = a?.name ?? ''
        const nameB = b?.name ?? ''
        return nameA.localeCompare(nameB)
      })
  }, [
    breweries,
    searchQuery,
    selectedType,
    userLocation,
    minDistance,
    maxDistance,
  ])

  const stats = useMemo(() => {
    const total = filteredBreweries.length
    const microCount = filteredBreweries.filter(
      (brewery) => brewery?.brewery_type === 'micro',
    ).length
    const websiteCount = filteredBreweries.filter(
      (brewery) => Boolean(brewery?.website_url),
    ).length
    const uniqueStates = new Set(
      filteredBreweries
        .map((brewery) => brewery?.state)
        .filter((state) => Boolean(state)),
    ).size
    const distanceValues = filteredBreweries
      .map((brewery) => brewery.distance)
      .filter((distance) => Number.isFinite(distance))
    const nearestDistance =
      distanceValues.length > 0
        ? Math.min(...distanceValues)
        : null
    const averageDistance =
      distanceValues.length > 0
        ? distanceValues.reduce((sum, distance) => sum + distance, 0) /
          distanceValues.length
        : null

    return {
      total,
      microCount,
      websiteCount,
      uniqueStates,
      nearestDistance,
      averageDistance,
    }
  }, [filteredBreweries])

  const formatBreweryType = (type) =>
    (type ?? 'Unknown')
      .split('_')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ')

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">CodePath Project 5</p>
          <h1>I Need A Beer</h1>
          <p className="intro">
            Explore breweries across the United States and find a cold one today. Use the search and type
            filter to discover new taprooms, small breweries and more.
          </p>
        </div>
      </header>

      <section className="controls">
        <div className="control-group">
          <label htmlFor="search">Search breweries</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name, city or state..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="control-group">
          <label htmlFor="brewery-type">Filter by type</label>
          <select
            id="brewery-type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            {breweryTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All brewery types' : formatBreweryType(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group control-group--split">
          <span className="control-group__legend">
            Approximate location (lat, lon)
          </span>
          <div className="control-group__fields">
            <label className="control-field" htmlFor="latitude">
              <span>Lat</span>
              <input
                id="latitude"
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={userLatitude}
                onChange={(event) => setUserLatitude(event.target.value)}
              />
            </label>
            <label className="control-field" htmlFor="longitude">
              <span>Lon</span>
              <input
                id="longitude"
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={userLongitude}
                onChange={(event) => setUserLongitude(event.target.value)}
              />
            </label>
          </div>
          <p className="control-group__help">
            {userLocation
              ? 'Defaults to Madison, WI. Update to your location to refine distance filters.'
              : 'Enter a valid latitude and longitude to enable distance calculations.'}
          </p>
        </div>

        <div className="control-group control-group--split">
          <span className="control-group__legend">Distance range (miles)</span>
          <div className="control-group__fields">
            <label className="control-field" htmlFor="min-distance">
              <span>Min</span>
              <input
                id="min-distance"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={minDistance}
                onChange={(event) => setMinDistance(event.target.value)}
              />
            </label>
            <label className="control-field" htmlFor="max-distance">
              <span>Max</span>
              <input
                id="max-distance"
                type="number"
                min="0"
                step="0.1"
                placeholder="250"
                value={maxDistance}
                onChange={(event) => setMaxDistance(event.target.value)}
              />
            </label>
          </div>
          <p className="control-group__help">
            {userLocation
              ? 'Leave blank to ignore a bound. Breweries without coordinates are hidden when a range is applied.'
              : 'Distance bounds require a valid location.'}
          </p>
        </div>
      </section>

      <section className="summary">
        <article className="summary-card">
          <p className="summary-card__label">Total Breweries</p>
          <p className="summary-card__value">{stats.total}</p>
          <p className="summary-card__hint">
            Breweries matching your current search.
          </p>
        </article>
        <article className="summary-card">
          <p className="summary-card__label">Micro Breweries</p>
          <p className="summary-card__value">{stats.microCount}</p>
          <p className="summary-card__hint">
            Independent micro breweries in the list.
          </p>
        </article>
        <article className="summary-card">
          <p className="summary-card__label">With Websites</p>
          <p className="summary-card__value">{stats.websiteCount}</p>
          <p className="summary-card__hint">
            Breweries that share a website or social link.
          </p>
        </article>
        <article className="summary-card">
          <p className="summary-card__label">States Represented</p>
          <p className="summary-card__value">{stats.uniqueStates}</p>
          <p className="summary-card__hint">
            Unique states represented in the results.
          </p>
        </article>
        <article className="summary-card">
          <p className="summary-card__label">Nearest Brewery</p>
          <p className="summary-card__value">
            {stats.nearestDistance != null
              ? `${stats.nearestDistance.toFixed(1)} mi`
              : '—'}
          </p>
          <p className="summary-card__hint">
            {stats.averageDistance != null
              ? `Average distance: ${stats.averageDistance.toFixed(1)} mi.`
              : 'Provide a location to calculate distances.'}
          </p>
        </article>
      </section>

      <section className="breweries-section">
        <div className="breweries-section__header">
          <h2>Breweries</h2>
          <p>
            Showing {stats.total}{' '}
            {stats.total === 1 ? 'brewery' : 'breweries'} sorted by name.
          </p>
        </div>

        {loading && (
          <p className="status-message" role="status">
            Loading breweries...
          </p>
        )}

        {error && !loading && (
          <p className="status-message status-message--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && filteredBreweries.length === 0 && (
          <p className="status-message">
            No breweries matched your search. Try a different search query
            or type filter.
          </p>
        )}

        {!loading && !error && filteredBreweries.length > 0 && (
          <ul className="brewery-list">
            {filteredBreweries.map((brewery) => {
              const key =
                brewery?.id ??
                brewery?.obdb_id ??
                `${brewery?.name}-${brewery?.city}-${brewery?.state}`

              return (
                <li key={key} className="brewery-card">
                  <div className="brewery-card__header">
                    <h3>{brewery?.name ?? 'Unnamed Brewery'}</h3>
                    <span className="brewery-card__type">
                      {formatBreweryType(brewery?.brewery_type)}
                    </span>
                  </div>
                  <p className="brewery-card__location">
                    {brewery?.city ?? 'Unknown city'}, {brewery?.state ?? '??'}
                  </p>
                  <p className="brewery-card__meta">
                    {brewery?.street ? `${brewery.street}, ` : ''}
                    {brewery?.postal_code ?? ''}
                  </p>

                  {Number.isFinite(brewery.distance) && (
                    <p className="brewery-card__distance">
                      Approx. {brewery.distance.toFixed(1)} miles away
                    </p>
                  )}
                  {brewery?.website_url ? (
                    <a
                      href={brewery.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="brewery-card__link"
                    >
                      Visit website
                    </a>
                  ) : (
                    <p className="brewery-card__link brewery-card__link--disabled">
                      No website listed
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
