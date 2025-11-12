import { useEffect, useState } from 'react'
import AttributeSelector from './AttributeSelector.jsx'
import {
  LEGEND_CLASS_OPTIONS,
  TACTICAL_FOCUS_OPTIONS,
} from '../constants/crewAttributes.js'

const EMPTY_FORM = {
  name: '',
  role: LEGEND_CLASS_OPTIONS[0],
  specialty: TACTICAL_FOCUS_OPTIONS[0],
  bio: '',
  avatar: '',
}

const withDefaults = (values) => ({
  ...EMPTY_FORM,
  ...(values ?? {}),
})

export default function CrewmateForm({
  heading,
  initialValues = null,
  submitLabel = 'Save legend',
  onSubmit,
  loading,
}) {
  const [values, setValues] = useState(() => withDefaults(initialValues))
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setValues(withDefaults(initialValues))
  }, [initialValues])

  const validate = () => {
    const nextErrors = {}
    if (!values.name?.trim()) {
      nextErrors.name = 'Give your legend a handle.'
    }
    if (!values.role) {
      nextErrors.role = 'Choose a legend class.'
    }
    if (!values.specialty) {
      nextErrors.specialty = 'Pick how they secure the win.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    if (!validate()) {
      return
    }

    try {
      await onSubmit(values)
      if (!initialValues?.id) {
        setValues(withDefaults())
        setSuccessMessage('New legend locked in for the next drop.')
      } else {
        setSuccessMessage('Legend dossier updated.')
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err instanceof Error ? err.message : 'Something went wrong saving.',
      }))
    }
  }

  return (
    <form className="crewmate-form card" onSubmit={handleSubmit}>
      {heading && <h2>{heading}</h2>}
      <label>
        Legend Handle
        <input
          type="text"
          placeholder="e.g. Nova or 'The Phase Walker'"
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </label>

      <AttributeSelector
        label="Legend Class"
        options={LEGEND_CLASS_OPTIONS}
        value={values.role}
        onChange={(role) => setValues((prev) => ({ ...prev, role }))}
      />
      {errors.role && <span className="form-error">{errors.role}</span>}

      <AttributeSelector
        label="Tactical Focus"
        options={TACTICAL_FOCUS_OPTIONS}
        value={values.specialty}
        onChange={(specialty) => setValues((prev) => ({ ...prev, specialty }))}
      />
      {errors.specialty && <span className="form-error">{errors.specialty}</span>}

      <label>
        Drop-In Lore
        <textarea
          rows="4"
          placeholder="What makes them clutch when the ring is closing?"
          value={values.bio}
          onChange={(event) => setValues((prev) => ({ ...prev, bio: event.target.value }))}
        />
      </label>

      <label>
        Banner Art URL
        <input
          type="url"
          placeholder="https://images.example.com/octane-banner.png"
          value={values.avatar}
          onChange={(event) => setValues((prev) => ({ ...prev, avatar: event.target.value }))}
        />
      </label>

      {errors.form && <p className="form-error">{errors.form}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Syncing…' : submitLabel}
      </button>
    </form>
  )
}
