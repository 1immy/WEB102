import { useEffect, useState } from 'react'
import AttributeSelector from './AttributeSelector.jsx'
import { ROLE_OPTIONS, SPECIALTY_OPTIONS } from '../constants/crewAttributes.js'

const EMPTY_FORM = {
  name: '',
  role: ROLE_OPTIONS[0],
  specialty: SPECIALTY_OPTIONS[0],
  bio: '',
  avatar: '',
}

const withDefaults = (values = {}) => ({
  ...EMPTY_FORM,
  ...values,
})

export default function CrewmateForm({
  heading,
  initialValues = {},
  submitLabel = 'Save crewmate',
  onSubmit,
  loading,
}) {
  const [values, setValues] = useState(withDefaults(initialValues))
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setValues(withDefaults(initialValues))
  }, [initialValues])

  const validate = () => {
    const nextErrors = {}
    if (!values.name?.trim()) {
      nextErrors.name = 'Give your crewmate a call sign.'
    }
    if (!values.role) {
      nextErrors.role = 'Choose a role.'
    }
    if (!values.specialty) {
      nextErrors.specialty = 'Choose a specialty.'
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
        setSuccessMessage('New crewmate deployed to the roster.')
      } else {
        setSuccessMessage('Crewmate updated.')
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
        Call Sign
        <input
          type="text"
          placeholder="e.g. Nova"
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </label>

      <AttributeSelector
        label="Squad Role"
        options={ROLE_OPTIONS}
        value={values.role}
        onChange={(role) => setValues((prev) => ({ ...prev, role }))}
      />
      {errors.role && <span className="form-error">{errors.role}</span>}

      <AttributeSelector
        label="Specialty"
        options={SPECIALTY_OPTIONS}
        value={values.specialty}
        onChange={(specialty) => setValues((prev) => ({ ...prev, specialty }))}
      />
      {errors.specialty && <span className="form-error">{errors.specialty}</span>}

      <label>
        Backstory
        <textarea
          rows="4"
          placeholder="What makes them invaluable to the crew?"
          value={values.bio}
          onChange={(event) => setValues((prev) => ({ ...prev, bio: event.target.value }))}
        />
      </label>

      <label>
        Avatar URL
        <input
          type="url"
          placeholder="https://images.example.com/nova.png"
          value={values.avatar}
          onChange={(event) => setValues((prev) => ({ ...prev, avatar: event.target.value }))}
        />
      </label>

      {errors.form && <p className="form-error">{errors.form}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
