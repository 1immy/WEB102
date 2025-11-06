import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const API_URL =
  'https://api.openbrewerydb.org/v1/breweries?per_page=60&by_country=united_states'

const BreweryDataContext = createContext(null)

export function BreweryDataProvider({ children }) {
  const [breweries, setBreweries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchBreweries() {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(API_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('API responded with malformed data')
        }
        setBreweries(data)
        setLastUpdated(new Date())
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }

        setError(
          err instanceof Error ? err.message : 'Something went wrong fetching data.',
        )
        setBreweries([])
      } finally {
        setLoading(false)
      }
    }

    fetchBreweries()
    return () => controller.abort()
  }, [])

  const value = useMemo(
    () => ({
      breweries,
      loading,
      error,
      lastUpdated,
    }),
    [breweries, loading, error, lastUpdated],
  )

  return (
    <BreweryDataContext.Provider value={value}>
      {children}
    </BreweryDataContext.Provider>
  )
}

export function useBreweryData() {
  const context = useContext(BreweryDataContext)
  if (!context) {
    throw new Error('useBreweryData must be used within a BreweryDataProvider')
  }

  return context
}
