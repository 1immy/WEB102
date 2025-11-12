export default function AttributeSelector({ label, options, value, onChange }) {
  return (
    <div className="attribute-selector">
      <p className="attribute-selector__label">{label}</p>
      <div className="attribute-selector__options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`pill ${option === value ? 'pill--selected' : ''}`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
