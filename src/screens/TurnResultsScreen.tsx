import type { Game, TurnEntry } from '../types'

type Props = {
  game: Game
}

const RESULT_LABELS: Record<TurnEntry['result'], string> = {
  correct: 'Correct',
  skip: 'Skip',
  steal: 'Steal',
}

export default function TurnResultsScreen({ game }: Props) {
  const { team, describerId, entries } = game.currentTurn
  const describerName = game.players[describerId]?.name ?? 'Unknown'
  const entryList: TurnEntry[] = Array.isArray(entries) ? entries : []

  const correct = entryList.filter(e => e.result === 'correct').length
  const skipped = entryList.filter(e => e.result === 'skip').length
  const steals = entryList.filter(e => e.result === 'steal').length

  return (
    <div className="screen results-screen">
      <h2 className="results-title">
        Team {team} — {describerName}'s turn
      </h2>

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
          <span className="stat-count">{steals}</span>
          <span className="stat-label">Stolen</span>
        </div>
      </div>

      <ul className="results-list">
        {entryList.map((e, i) => (
          <li key={i} className="results-entry">
            <span className="entry-word">{e.word}</span>
            <span className={`entry-badge entry-badge-${e.result}`}>
              {RESULT_LABELS[e.result]}
            </span>
          </li>
        ))}
      </ul>

      <div className="results-scores">
        <div className="score-row">
          <span className="score-label">Team A</span>
          <span className="score-value">{game.teams.A.score}</span>
        </div>
        <div className="score-row">
          <span className="score-label">Team B</span>
          <span className="score-value">{game.teams.B.score}</span>
        </div>
      </div>

      <p className="results-placeholder-note">
        Phase 4 coming next session — scores + next turn button
      </p>
    </div>
  )
}
