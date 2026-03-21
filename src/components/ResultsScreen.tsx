import type { TurnEntry } from '../types'

type Props = {
  currentTurn: TurnEntry[]
  onStartNewTurn: () => void
}

const RESULT_LABEL: Record<TurnEntry['result'], string> = {
  correct: 'Correct',
  skip: 'Skipped',
  steal: 'Stolen',
}

export default function ResultsScreen({ currentTurn, onStartNewTurn }: Props) {
  const correct = currentTurn.filter(e => e.result === 'correct').length
  const skipped = currentTurn.filter(e => e.result === 'skip').length
  const stolen = currentTurn.filter(e => e.result === 'steal').length

  console.log(`Results: correct=${correct} skipped=${skipped} stolen=${stolen}`)

  return (
    <div className="screen results-screen">
      <h2 className="results-title">Turn Results</h2>

      <div className="results-stats">
        <div className="stat-card stat-correct">
          <span className="stat-count">{correct}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat-card stat-skip">
          <span className="stat-count">{skipped}</span>
          <span className="stat-label">Skipped</span>
        </div>
        <div className="stat-card stat-steal">
          <span className="stat-count">{stolen}</span>
          <span className="stat-label">Stolen</span>
        </div>
      </div>

      <ul className="results-list">
        {currentTurn.map((entry, i) => (
          <li key={i} className="results-entry">
            <span className="entry-word">{entry.word}</span>
            <span className={`entry-badge entry-badge-${entry.result}`}>{RESULT_LABEL[entry.result]}</span>
          </li>
        ))}
      </ul>

      <button className="btn-primary btn-large" onClick={onStartNewTurn}>Start New Turn</button>
    </div>
  )
}
