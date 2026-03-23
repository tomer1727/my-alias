import type { Game } from '../types'

type Props = {
  game: Game
  playerId: string
  onStartTurn: () => Promise<void>
}

export default function PreTurnScreen({ game, playerId, onStartTurn }: Props) {
  const { team, describerId } = game.currentTurn
  const describerName = game.players[describerId]?.name ?? 'Unknown'
  const isDescriber = playerId === describerId

  return (
    <div className="screen pre-turn-screen">
      <div className="pre-turn-team">Team {team}</div>
      <div className="pre-turn-name">{describerName}</div>
      <div className="pre-turn-label">is describing</div>

      {isDescriber ? (
        <button
          className="btn-primary btn-large"
          onClick={() => {
            console.log(`PreTurn: describer ${describerName} tapped Start`)
            onStartTurn()
          }}
        >
          Start
        </button>
      ) : (
        <p className="pre-turn-waiting">Waiting for {describerName} to start…</p>
      )}
    </div>
  )
}
