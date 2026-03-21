import type { GameTotals, TurnEntry } from '../types'

type Props = {
  currentTurn: TurnEntry[]
  gameTotals: GameTotals
  onStartNewTurn: () => void
  onNewGame: () => void
}

const RESULT_LABEL: Record<TurnEntry['result'], string> = {
  correct: 'Correct',
  skip: 'Skipped',
  steal: 'Stolen',
}

export default function ResultsScreen({ currentTurn, gameTotals, onStartNewTurn, onNewGame }: Props) {
  const turnCorrect = currentTurn.filter(e => e.result === 'correct').length
  const turnSkipped = currentTurn.filter(e => e.result === 'skip').length
  const turnStolen = currentTurn.filter(e => e.result === 'steal').length
  const turnScore = turnCorrect - turnSkipped

  const totalScore = gameTotals.correct - gameTotals.skip

  console.log(`Results: turn correct=${turnCorrect} skipped=${turnSkipped} stolen=${turnStolen} score=${turnScore}`)
  console.log(`Results: total correct=${gameTotals.correct} skip=${gameTotals.skip} steal=${gameTotals.steal} score=${totalScore}`)

  return (
    <div className="screen results-screen">
      <h2 className="results-title">Turn Results</h2>

      <div className="results-stats">
        <div className="stat-card stat-correct">
          <span className="stat-count">{turnCorrect}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat-card stat-skip">
          <span className="stat-count">{turnSkipped}</span>
          <span className="stat-label">Skipped</span>
        </div>
        <div className="stat-card stat-steal">
          <span className="stat-count">{turnStolen}</span>
          <span className="stat-label">Stolen</span>
        </div>
      </div>

      <div className="score-row">
        <span className="score-label">Turn score</span>
        <span className="score-value">{turnScore > 0 ? `+${turnScore}` : turnScore}</span>
      </div>

      <ul className="results-list">
        {currentTurn.map((entry, i) => (
          <li key={i} className="results-entry">
            <span className="entry-word">{entry.word}</span>
            <span className={`entry-badge entry-badge-${entry.result}`}>{RESULT_LABEL[entry.result]}</span>
          </li>
        ))}
      </ul>

      <div className="game-total-section">
        <h3 className="game-total-title">Game Total</h3>
        <div className="results-stats">
          <div className="stat-card stat-correct">
            <span className="stat-count">{gameTotals.correct}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat-card stat-skip">
            <span className="stat-count">{gameTotals.skip}</span>
            <span className="stat-label">Skipped</span>
          </div>
          <div className="stat-card stat-steal">
            <span className="stat-count">{gameTotals.steal}</span>
            <span className="stat-label">Stolen</span>
          </div>
        </div>
        <div className="score-row">
          <span className="score-label">Total score</span>
          <span className="score-value score-value-total">{totalScore > 0 ? `+${totalScore}` : totalScore}</span>
        </div>
      </div>

      <div className="results-actions">
        <button className="btn-primary btn-large" onClick={onStartNewTurn}>Next Turn</button>
        <button className="btn-secondary btn-large" onClick={onNewGame}>New Game</button>
      </div>
    </div>
  )
}
