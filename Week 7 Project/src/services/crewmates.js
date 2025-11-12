import { supabase } from '../lib/supabaseClient.js'

const TABLE = 'crewmates'

function handleError(error, fallbackMessage) {
  if (error) {
    throw new Error(error.message || fallbackMessage)
  }
}

export async function fetchCrewmates() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  handleError(error, 'Unable to load your legend roster right now.')
  return data ?? []
}

export async function fetchCrewmateById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
  handleError(error, 'Unable to find that legend.')
  return data
}

export async function createCrewmate(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: payload.name,
      role: payload.role,
      specialty: payload.specialty,
      bio: payload.bio ?? '',
      avatar: payload.avatar ?? '',
    })
    .select()
    .single()

  handleError(error, 'Unable to add that legend.')
  return data
}

export async function updateCrewmate(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name: updates.name,
      role: updates.role,
      specialty: updates.specialty,
      bio: updates.bio ?? '',
      avatar: updates.avatar ?? '',
    })
    .eq('id', id)
    .select()
    .single()

  handleError(error, 'Unable to update that legend.')
  return data
}

export async function deleteCrewmate(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  handleError(error, 'Unable to retire that legend.')
}
