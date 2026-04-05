import type { Game, TurnEntry } from '../types'

type Props = {
  game: Game
  nextDescriberId: string | null
  playerId: string
  onStartNextTurn: () => Promise<void>
  onUpdateEntryResult: (index: number, result: TurnEntry['result']) => Promise<void>
}

const RESULT_LABELS: Record<TurnEntry['result'], string> = {
  correct: '✓',
  skip: '✗',
  steal: '🔀',
}

const RESULT_CLASSES: Record<TurnEntry['result'], string> = {
  correct: 'entry-badge-correct',
  skip: 'entry-badge-skip',
  steal: 'entry-badge-steal',
}

function cycleResult(current: TurnEntry['result'], isLast: boolean): TurnEntry['result'] {
  if (isLast) {
    if (current === 'correct') return 'skip'
    if (current === 'skip') return 'steal'
    return 'correct'
  }
  return current === 'correct' ? 'skip' : 'correct'
}

export default function TurnResultsScreen({ game, nextDescriberId, playerId, onStartNextTurn, onUpdateEntryResult }: Props) {
  const { team, describerId, entries } = game.currentTurn
  const describerName = game.players[describerId]?.name ?? 'Unknown'
  const entryList: TurnEntry[] = Array.isArray(entries) ? entries : []
  const isDescriber = playerId === describerId

  const correct = entryList.filter(e => e.result === 'correct').length
  const skipped = entryList.filter(e => e.result === 'skip').length
  const steals = entryList.filter(e => e.result === 'steal').length

  // Preview the turn delta before it's committed
  const otherTeam = team === 'A' ? 'B' : 'A'
  const thisTeamDelta = correct - skipped
  const otherTeamDelta = steals

  const isNextDescriber = playerId === nextDescriberId
  const nextDescriberName = nextDescriberId ? (game.players[nextDescriberId]?.name ?? 'Unknown') : null
  const isHost = playerId === game.hostId

  // Detect if this turn's score delta would end the game
  const newTeamScore = game.teams[team].score + thisTeamDelta
  const newOtherTeamScore = game.teams[otherTeam].score + otherTeamDelta
  const gameWillEnd = newTeamScore >= game.config.targetScore || newOtherTeamScore >= game.config.targetScore
  const winningTeam = newTeamScore >= game.config.targetScore ? team : otherTeam

  return (
    <div className="screen results-screen">
      <h2 className="results-title">
        Team {team} — {describerName}
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
        {entryList.map((e, i) => {
          const isLast = i === entryList.length - 1
          return (
            <li key={i} className="results-entry">
              <span className="entry-word">{e.word}</span>
              {isDescriber ? (
                <button
                  className={`entry-badge entry-badge-btn ${RESULT_CLASSES[e.result]}`}
                  onClick={() => {
                    const next = cycleResult(e.result, isLast)
                    console.log(`TurnResults: tapped entry ${i} "${e.word}" ${e.result} → ${next}`)
                    onUpdateEntryResult(i, next).catch(err => console.error('TurnResults: entry update failed', err))
                  }}
                >
                  {RESULT_LABELS[e.result]}
                </button>
              ) : (
                <span className={`entry-badge ${RESULT_CLASSES[e.result]}`}>
                  {RESULT_LABELS[e.result]}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div className="results-scores">
        <div className={`score-row ${team === 'A' ? 'score-row-active' : ''}`}>
          <span className="score-label">Team A</span>
          <span className="score-value">
            {game.teams.A.score}
            {team === 'A' && thisTeamDelta !== 0 && (
              <span className={`score-delta ${thisTeamDelta > 0 ? 'score-delta-pos' : 'score-delta-neg'}`}>
                {thisTeamDelta > 0 ? `+${thisTeamDelta}` : thisTeamDelta}
              </span>
            )}
            {otherTeam === 'A' && otherTeamDelta > 0 && (
              <span className="score-delta score-delta-pos">+{otherTeamDelta}</span>
            )}
          </span>
        </div>
        <div className={`score-row ${team === 'B' ? 'score-row-active' : ''}`}>
          <span className="score-label">Team B</span>
          <span className="score-value">
            {game.teams.B.score}
            {team === 'B' && thisTeamDelta !== 0 && (
              <span className={`score-delta ${thisTeamDelta > 0 ? 'score-delta-pos' : 'score-delta-neg'}`}>
                {thisTeamDelta > 0 ? `+${thisTeamDelta}` : thisTeamDelta}
              </span>
            )}
            {otherTeam === 'B' && otherTeamDelta > 0 && (
              <span className="score-delta score-delta-pos">+{otherTeamDelta}</span>
            )}
          </span>
        </div>
      </div>

      {gameWillEnd ? (
        <div className="results-game-over">
          <div className="results-game-over-badge">🏆 Team {winningTeam} wins!</div>
          {isHost ? (
            <button
              className="btn-primary btn-large"
              onClick={() => {
                console.log('TurnResults: host tapped Show Final Results')
                onStartNextTurn()
              }}
            >
              Show Final Results
            </button>
          ) : (
            <p className="results-waiting">Waiting for host to show final results…</p>
          )}
        </div>
      ) : isNextDescriber ? (
        <button
          className="btn-primary btn-large"
          onClick={() => {
            console.log('TurnResults: next describer tapped Start Next Turn')
            onStartNextTurn()
          }}
        >
          Start Next Turn
        </button>
      ) : (
        <p className="results-waiting">
          Waiting for {nextDescriberName ?? 'next describer'} to start…
        </p>
      )}
    </div>
  )
}
