import { useMemo, useState } from 'react'
import './App.css'

const flashcards = [
  {
    id: 1,
    prompt: 'Stacks vs. Queues',
    answer: 'Stacks use LIFO ordering; queues use FIFO ordering.'
  },
  {
    id: 2,
    prompt: 'Big-O of Binary Search',
    answer: 'Runs in O(log n) time by halving the search space each step.'
  },
  {
    id: 3,
    prompt: 'HTTP Status 404',
    answer: 'Indicates the requested resource could not be found on the server.'
  },
  {
    id: 4,
    prompt: 'What is JSX?',
    answer: 'A syntax extension for JavaScript that looks like HTML and compiles to React.createElement calls.'
  },
  {
    id: 5,
    prompt: 'Mutable vs. Immutable Data',
    answer: 'Mutable data can change after creation; immutable data cannot, which helps avoid unintended side-effects.'
  },
  {
    id: 6,
    prompt: 'Purpose of a REST API',
    answer: 'REST APIs provide stateless endpoints that let clients create, read, update, or delete resources via HTTP.'
  }
]

function App() {
  const totalCards = useMemo(() => flashcards.length, [])
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * totalCards)
  )
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = flashcards[currentIndex]

  const handleCardToggle = () => {
    setIsFlipped((prev) => !prev)
  }

  const handleKeyToggle = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardToggle()
    }
  }

  const handleNextCard = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => {
      if (totalCards <= 1) {
        return prev
      }

      let nextIndex = prev
      while (nextIndex === prev) {
        nextIndex = Math.floor(Math.random() * totalCards)
      }
      return nextIndex
    })
  }

  return (
    <div className="app">
      <header className="set-details">
        <h1 className="set-title">CS Concepts Flashcards</h1>
        <p className="set-description">
          Practice of must know programming and web fundamentals. Flip each card to
          reveal the answer, then jump to a random card to keep the session
          fresh.
        </p>
        <p className="set-count">
          Total Cards: <span>{totalCards}</span>
        </p>
      </header>

      <main className="study-area">
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

        <button type="button" className="next-button" onClick={handleNextCard}>
          Pull next Card
        </button>
      </main>
    </div>
  )
}

export default App
