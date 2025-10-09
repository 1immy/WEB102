import { useState } from 'react'
import './App.css'

const flashcards = [
  {
    id: 1,
    prompt: 'What does HTML stand for?',
    answer: 'HTML stands for HyperText Markup Language.'
  },
  {
    id: 2,
    prompt: 'What is CSS used for?',
    answer: 'CSS is used to style how web pages look.'
  },
  {
    id: 3,
    prompt: 'Which keyword makes a constant in JavaScript?',
    answer: 'The const keyword makes a constant.'
  },
  {
    id: 4,
    prompt: 'Which data structure uses FIFO ordering?',
    answer: 'A queue uses first-in, first-out ordering.'
  },
  {
    id: 5,
    prompt: 'What values can a boolean hold?',
    answer: 'A boolean can be true or false.'
  },
  {
    id: 6,
    prompt: 'What does API stand for?',
    answer: 'API stands for Application Programming Interface.'
  }
]

function App() {
  const totalCards = flashcards.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState('idle')

  const currentCard = flashcards[currentIndex]

  const handleCardToggle = () => {
    setIsFlipped((prev) => !prev)
  }

  const normalize = (value) =>
    value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()

  const handleGuessSubmit = (event) => {
    event.preventDefault()
    const trimmedGuess = guess.trim()
    if (!trimmedGuess) {
      return
    }

    const normalizedGuess = normalize(trimmedGuess)
    const normalizedAnswer = normalize(currentCard.answer)

    const isExactMatch = normalizedGuess === normalizedAnswer

    const guessTokens = normalizedGuess.split(' ').filter(Boolean)
    const fuzzyMatch =
      !isExactMatch &&
      guessTokens.length > 0 &&
      guessTokens.every((token) => normalizedAnswer.includes(token))

    const isCorrect = isExactMatch || fuzzyMatch
    setFeedback(isCorrect ? 'correct' : 'incorrect')

    if (isCorrect) {
      setIsFlipped(true)
    }
  }

  const handleKeyToggle = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardToggle()
    }
  }

  const resetCardState = () => {
    setIsFlipped(false)
    setGuess('')
    setFeedback('idle')
  }

  const handleNextCard = () => {
    if (currentIndex >= totalCards - 1) {
      return
    }

    setCurrentIndex((prev) => prev + 1)
    resetCardState()
  }

  const handlePreviousCard = () => {
    if (currentIndex <= 0) {
      return
    }

    setCurrentIndex((prev) => prev - 1)
    resetCardState()
  }

  const isAtBeginning = currentIndex === 0
  const isAtEnd = currentIndex === totalCards - 1
  const isSubmitDisabled = guess.trim().length === 0

  return (
    <div className="app">
      <header className="set-details">
        <h1 className="set-title">CS Concepts Flashcards</h1>
        <p className="set-description">
          Practice and quiz your computer science knowledge! Try guess the answer before you flip the box.
        </p>
        <p className="set-count">
          Total Cards: <span>{totalCards}</span>
        </p>
      </header>

      <main className="study-area">
        <form className="guess-form" onSubmit={handleGuessSubmit}>
          <label className="guess-label" htmlFor="flashcard-guess">
            Your Guess
          </label>
          <div className="guess-input-row">
            <input
              id="flashcard-guess"
              type="text"
              // was thinking of other funny placeholders to put
              // i ultimately chose to keep it casual
              placeholder="Enter your best guess here..."
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
            />
            <button type="submit" disabled={isSubmitDisabled}>
              Submit
            </button>
          </div>
          {feedback !== 'idle' && (
            <p
              className={`feedback-message ${
                feedback === 'correct' ? 'correct' : 'incorrect'
              }`}
            >
              {feedback === 'correct'
                ? 'Smarty pants! You got it right.'
                : 'Dude, that was way off. Try again!'}
            </p>
          )}
        </form>

        <section
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={handleCardToggle}
          onKeyDown={handleKeyToggle}
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
        >
          <div className="card-face card-front">
            <h2>Prompt</h2>
            <p>{currentCard.prompt}</p>
            <span className="flip-hint">Click to reveal answer</span>
          </div>
          <div className="card-face card-back">
            <h2>Answer</h2>
            <p>{currentCard.answer}</p>
            <span className="flip-hint">Click to hide answer</span>
          </div>
        </section>

        <div className="navigation">
          <button
            type="button"
            className="nav-button"
            onClick={handlePreviousCard}
            disabled={isAtBeginning}
          >
            Previous
          </button>
          <span className="card-position">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <button
            type="button"
            className="nav-button"
            onClick={handleNextCard}
            disabled={isAtEnd}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
