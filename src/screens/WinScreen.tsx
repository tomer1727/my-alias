import type { Game } from '../types'

type Props = {
  game: Game
  onPlayAgain: () => Promise<void>
}

export default function WinScreen({ game, onPlayAgain }: Props) {
  const winner = game.winner!
  const loser = winner === 'A' ? 'B' : 'A'

  return (
    <div className="screen win-screen">
      <div className="win-trophy">🏆</div>
      <h1 className="win-title">Team {winner} Wins!</h1>

      <div className="win-scores">
        <div className={`win-score-card ${winner === 'A' ? 'win-score-winner' : ''}`}>
          <span className="win-score-label">Team A</span>
          <span className="win-score-value">{game.teams.A.score}</span>
        </div>
        <div className={`win-score-card ${winner === 'B' ? 'win-score-winner' : ''}`}>
          <span className="win-score-label">Team B</span>
          <span className="win-score-value">{game.teams.B.score}</span>
        </div>
      </div>

      <p className="win-margin">
        Team {winner} beat Team {loser} by {Math.abs(game.teams[winner].score - game.teams[loser].score)} point{Math.abs(game.teams[winner].score - game.teams[loser].score) !== 1 ? 's' : ''}
      </p>

      <button
        className="btn-primary btn-large"
        onClick={() => {
          console.log('WinScreen: play again tapped')
          onPlayAgain()
        }}
      >
        Play Again
      </button>
    </div>
  )
}
