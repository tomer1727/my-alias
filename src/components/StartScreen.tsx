import { useState } from 'react'

type Props = {
  onStartGame: (timerDuration: number) => void
}

const MIN_DURATION = 10
const MAX_DURATION = 300
const STEP = 10

export default function StartScreen({ onStartGame }: Props) {
  const [duration, setDuration] = useState(60)

  function decrement() {
    setDuration(d => Math.max(MIN_DURATION, d - STEP))
  }

  function increment() {
    setDuration(d => Math.min(MAX_DURATION, d + STEP))
  }

  return (
    <div className="screen start-screen">
      <h1 className="start-title">Alias</h1>

      <div className="timer-selector">
        <span className="timer-selector-label">Turn duration</span>
        <div className="timer-stepper">
          <button className="stepper-btn" onClick={decrement} disabled={duration <= MIN_DURATION}>−</button>
          <span className="stepper-value">{duration}s</span>
          <button className="stepper-btn" onClick={increment} disabled={duration >= MAX_DURATION}>+</button>
        </div>
      </div>

      <button className="btn-primary btn-large" onClick={() => {
        console.log(`Start: starting game with timer=${duration}s`)
        onStartGame(duration)
      }}>
        Start New Game
      </button>
    </div>
  )
}
