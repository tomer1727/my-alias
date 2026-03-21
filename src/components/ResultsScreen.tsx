import type { TurnEntry } from '../types'

type Props = {
  currentTurn: TurnEntry[]
  onStartNewTurn: () => void
}

export default function ResultsScreen({ currentTurn, onStartNewTurn }: Props) {
  return (
    <div>
      <h2>Turn Results</h2>
      <p>Correct: {currentTurn.filter(e => e.result === 'correct').length}</p>
      <p>Skipped: {currentTurn.filter(e => e.result === 'skip').length}</p>
      <p>Stolen: {currentTurn.filter(e => e.result === 'steal').length}</p>
      <ul>
        {currentTurn.map((entry, i) => (
          <li key={i}>{entry.word} — {entry.result}</li>
        ))}
      </ul>
      <button onClick={onStartNewTurn}>Start New Turn</button>
    </div>
  )
}
