import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  createCrewmate,
  deleteCrewmate,
  fetchCrewmates,
  updateCrewmate,
} from '../services/crewmates.js'

const CrewmatesContext = createContext(null)

export function CrewmatesProvider({ children }) {
  const [crew, setCrew] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadCrewmates = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchCrewmates()
      setCrew(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sync your roster.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCrewmates()
  }, [loadCrewmates])

  const addCrewmate = useCallback(async (payload) => {
    try {
      setIsSaving(true)
      setError('')
      const created = await createCrewmate(payload)
      setCrew((prev) => [created, ...prev])
      return created
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to add that legend.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsSaving(false)
    }
  }, [])

  const editCrewmate = useCallback(async (id, updates) => {
    try {
      setIsSaving(true)
      setError('')
      const updated = await updateCrewmate(id, updates)
      setCrew((prev) => prev.map((mate) => (mate.id === id ? updated : mate)))
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update that legend.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsSaving(false)
    }
  }, [])

  const removeCrewmate = useCallback(async (id) => {
    try {
      setIsSaving(true)
      setError('')
      await deleteCrewmate(id)
      setCrew((prev) => prev.filter((mate) => mate.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to retire that legend.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsSaving(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      crew,
      loading,
      error,
      isSaving,
      refresh: loadCrewmates,
      addCrewmate,
      editCrewmate,
      removeCrewmate,
    }),
    [crew, loading, error, isSaving, loadCrewmates, addCrewmate, editCrewmate, removeCrewmate],
  )

  return <CrewmatesContext.Provider value={value}>{children}</CrewmatesContext.Provider>
}

export function useCrewmates() {
  const context = useContext(CrewmatesContext)
  if (!context) {
    throw new Error('useCrewmates must be used within a CrewmatesProvider')
  }

  return context
}
