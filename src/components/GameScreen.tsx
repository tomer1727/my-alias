import { useEffect, useRef, useState } from 'react'

type Props = {
  currentWord: string
  lastWord: boolean
  onCorrect: () => void
  onSkip: () => void
  onSteal: () => void
  onTimerExpiry: () => void
}

export default function GameScreen({ currentWord, lastWord, onCorrect, onSkip, onSteal, onTimerExpiry }: Props) {
  const [timeLeft, setTimeLeft] = useState(60)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && !expiredRef.current) {
      expiredRef.current = true
      onTimerExpiry()
    }
  }, [timeLeft])

  const timerColor = timeLeft === 0 ? 'red' : timeLeft <= 10 ? 'orange' : 'green'
  const timerClass = `timer${timeLeft <= 5 && timeLeft > 0 ? ' timer-pulse' : ''}`

  return (
    <div className="screen game-screen">
      <div className={timerClass} style={{ color: timerColor }}>
        {timeLeft}
      </div>
      <p className="current-word">{currentWord}</p>
      <div className="game-buttons">
        <button className="btn-correct" onClick={onCorrect}>Correct</button>
        <button className="btn-skip" onClick={onSkip}>Skip</button>
        <button className={`btn-steal${lastWord ? ' btn-steal-active' : ''}`} onClick={onSteal} disabled={!lastWord}>
          Steal
        </button>
      </div>
    </div>
  )
}
