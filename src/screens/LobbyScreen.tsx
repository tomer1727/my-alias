import type { Game } from '../types'

type Props = {
  game: Game
  roomCode: string
  playerId: string
}

export default function LobbyScreen({ game, roomCode, playerId: _playerId }: Props) {
  const players = Object.values(game.players)

  return (
    <div className="screen lobby-screen">
      <h2 className="lobby-title">Lobby</h2>
      <div className="lobby-room-code">
        <span className="lobby-room-label">Room Code</span>
        <span className="lobby-room-value">{roomCode}</span>
      </div>
      <div className="lobby-players">
        <p className="lobby-players-label">Players ({players.length})</p>
        {players.map(p => (
          <div key={p.name} className="lobby-player-row">
            <span>{p.name}</span>
            {p.name === game.players[game.hostId]?.name && (
              <span className="lobby-host-badge">Host</span>
            )}
          </div>
        ))}
      </div>
      <p className="lobby-waiting">Team assignment coming in Phase 2…</p>
    </div>
  )
}
