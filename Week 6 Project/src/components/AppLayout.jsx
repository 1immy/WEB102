import { Outlet } from 'react-router-dom'
import { useMemo } from 'react'
import { useBreweryData } from '../context/BreweryDataContext.jsx'
import Sidebar from './Sidebar.jsx'
import './AppLayout.css'

export default function AppLayout() {
  const { breweries, loading, error, lastUpdated } = useBreweryData()

  const sidebarStats = useMemo(() => {
    const states = new Set()
    const types = new Set()

    breweries.forEach((brewery) => {
      if (brewery?.state) {
        states.add(brewery.state)
      }
      if (brewery?.brewery_type) {
        types.add(brewery.brewery_type)
      }
    })

    return {
      total: breweries.length,
      states: states.size,
      types: types.size,
      lastUpdated,
    }
  }, [breweries, lastUpdated])

  return (
    <div className="app-layout">
      <Sidebar stats={sidebarStats} />
      <main className="app-layout__main">
        {loading && (
          <p className="status-message" role="status">
            Loading breweries…
          </p>
        )}
        {error && !loading && (
          <p className="status-message status-message--error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && <Outlet />}
      </main>
    </div>
  )
}
