import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { useBreweryData } from '../context/BreweryDataContext.jsx'
import './DashboardPage.css'

const CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#facc15',
  '#a855f7',
  '#ef4444',
]

export default function DashboardPage() {
  const { breweries } = useBreweryData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedState, setSelectedState] = useState('all')

  const breweryTypes = useMemo(() => {
    const types = new Set()
    breweries.forEach((brewery) => {
      if (brewery?.brewery_type) {
        types.add(brewery.brewery_type)
      }
    })
    return Array.from(types).sort()
  }, [breweries])

  const states = useMemo(() => {
    const set = new Set()
    breweries.forEach((brewery) => {
      if (brewery?.state) {
        set.add(brewery.state)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [breweries])

  const filteredBreweries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return breweries.filter((brewery) => {
      const matchesQuery =
        !query ||
        [brewery?.name, brewery?.city, brewery?.state]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))

      const matchesType =
        selectedType === 'all' || brewery?.brewery_type === selectedType

      const matchesState =
        selectedState === 'all' || brewery?.state === selectedState

      return matchesQuery && matchesType && matchesState
    })
  }, [breweries, searchTerm, selectedType, selectedState])

  const stats = useMemo(() => {
    const websiteCount = filteredBreweries.filter(
      (brewery) => Boolean(brewery?.website_url),
    ).length
    const microCount = filteredBreweries.filter(
      (brewery) => brewery?.brewery_type === 'micro',
    ).length

    const avgCityPopulation = (() => {
      const byCity = new Map()
      filteredBreweries.forEach((brewery) => {
        if (!brewery?.city) {
          return
        }
        const key = `${brewery.city}-${brewery.state}`
        byCity.set(key, (byCity.get(key) ?? 0) + 1)
      })
      if (!byCity.size) {
        return 0
      }
      const total = Array.from(byCity.values()).reduce(
        (sum, count) => sum + count,
        0,
      )
      return total / byCity.size
    })()

    return {
      total: filteredBreweries.length,
      websiteCount,
      microCount,
      avgCityPopulation,
    }
  }, [filteredBreweries])

  const typeDistribution = useMemo(() => {
    const counts = new Map()
    breweries.forEach((brewery) => {
      if (!brewery?.brewery_type) {
        return
      }
      counts.set(
        brewery.brewery_type,
        (counts.get(brewery.brewery_type) ?? 0) + 1,
      )
    })

    return Array.from(counts.entries())
      .map(([type, count]) => ({
        type,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [breweries])

  const stateLeaders = useMemo(() => {
    const counts = new Map()
    breweries.forEach((brewery) => {
      if (!brewery?.state) {
        return
      }
      counts.set(brewery.state, (counts.get(brewery.state) ?? 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [breweries])

  const formatTypeLabel = (type) =>
    type
      ? type
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Unknown'

  return (
    <div className="dashboard">
      <section className="filters">
        <div className="control">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Search by city, name or state"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="control">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            <option value="all">All types</option>
            {breweryTypes.map((type) => (
              <option key={type} value={type}>
                {formatTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="control">
          <label htmlFor="state">State</label>
          <select
            id="state"
            value={selectedState}
            onChange={(event) => setSelectedState(event.target.value)}
          >
            <option value="all">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="stats-grid">
        <article>
          <p className="label">Breweries in view</p>
          <p className="value">{stats.total}</p>
          <p className="hint">Matches your search filters.</p>
        </article>
        <article>
          <p className="label">Have websites</p>
          <p className="value">{stats.websiteCount}</p>
          <p className="hint">Share a link or social profile.</p>
        </article>
        <article>
          <p className="label">Micro breweries</p>
          <p className="value">{stats.microCount}</p>
          <p className="hint">Independent craft operations.</p>
        </article>
        <article>
          <p className="label">Avg breweries per city</p>
          <p className="value">{stats.avgCityPopulation.toFixed(1)}</p>
          <p className="hint">Among cities in the current list.</p>
        </article>
      </section>

      <section className="charts">
        <article className="chart-card">
          <div className="chart-card__header">
            <h3>Distribution by Type</h3>
            <p>Counts are based on the loaded dataset.</p>
          </div>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={typeDistribution} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="type" tickFormatter={formatTypeLabel} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} breweries`, 'Count']} labelFormatter={formatTypeLabel} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {typeDistribution.map((entry, index) => (
                    <Cell
                      key={entry.type}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="chart-card">
          <div className="chart-card__header">
            <h3>Top States</h3>
            <p>States with the highest brewery counts.</p>
          </div>
          <div className="chart-card__body chart-card__body--pie">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip
                  formatter={(value, _, info) => [
                    `${value} breweries`,
                    info?.payload?.state ?? 'State',
                  ]}
                />
                <Pie
                  data={stateLeaders}
                  dataKey="count"
                  nameKey="state"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={3}
                >
                  {stateLeaders.map((entry, index) => (
                    <Cell
                      key={entry.state}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="chart-legend">
              {stateLeaders.map((entry, index) => (
                <li key={entry.state}>
                  <span
                    className="legend-swatch"
                    style={{
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                  <span>{entry.state}</span>
                  <strong>{entry.count}</strong>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="list-section">
        <div className="list-section__header">
          <div>
            <h2>Breweries</h2>
            <p>Click any brewery to view detailed insights.</p>
          </div>
          <p className="list-count">{filteredBreweries.length} results</p>
        </div>
        {filteredBreweries.length === 0 ? (
          <p className="empty-state">
            No breweries matched your filters. Try a different search.
          </p>
        ) : (
          <ul className="brewery-list">
            {filteredBreweries.map((brewery) => {
              const identifier =
                brewery?.id ??
                brewery?.obdb_id ??
                `${brewery?.name}-${brewery?.city}-${brewery?.state}`
              const routeId = encodeURIComponent(String(identifier))
              return (
                <li key={identifier} className="brewery-card">
                  <div>
                    <p className="brewery-card__eyebrow">
                      {brewery?.state ?? 'Unknown state'}
                    </p>
                    <h3>
                      <Link to={`/breweries/${routeId}`}>
                        {brewery?.name ?? 'Unnamed brewery'}
                      </Link>
                    </h3>
                    <p className="brewery-card__meta">
                      {brewery?.city ?? 'Unknown city'} ·{' '}
                      {formatTypeLabel(brewery?.brewery_type)}
                    </p>
                  </div>
                  <div className="brewery-card__cta">
                    <Link to={`/breweries/${routeId}`}>View details</Link>
                    {brewery?.website_url ? (
                      <a
                        href={brewery.website_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Website
                      </a>
                    ) : (
                      <span>No site listed</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
