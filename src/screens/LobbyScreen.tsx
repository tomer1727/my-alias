import type { Game, Team } from '../types'

type Props = {
  game: Game
  roomCode: string
  playerId: string
  onJoinTeam: (team: Team) => Promise<void>
  onUpdateConfig: (key: 'timerDuration' | 'targetScore', value: number) => Promise<void>
  onStartGame: () => Promise<void>
}

const TIMER_MIN = 10
const TIMER_MAX = 300
const TIMER_STEP = 5
const SCORE_MIN = 5
const SCORE_MAX = 100
const SCORE_STEP = 5

export default function LobbyScreen({
  game,
  roomCode,
  playerId,
  onJoinTeam,
  onUpdateConfig,
  onStartGame,
}: Props) {
  const isHost = playerId === game.hostId
  const myTeam = game.players[playerId]?.team ?? null
  const hostConnected = game.players[game.hostId]?.connected !== false
  const showHostDisconnected = !isHost && !hostConnected

  const playersByTeam = (team: Team) =>
    Object.entries(game.players).filter(([, p]) => p.team === team)

  const unassigned = Object.entries(game.players).filter(([, p]) => p.team === null)

  const teamAFull = playersByTeam('A').length >= 1
  const teamBFull = playersByTeam('B').length >= 1
  const canStart = teamAFull && teamBFull

  const { timerDuration, targetScore } = game.config

  return (
    <div className="screen lobby-screen">
      {/* Host disconnected overlay */}
      {showHostDisconnected && (
        <div className="lobby-overlay">
          <div className="lobby-overlay-card">
            <p className="lobby-overlay-title">Host disconnected</p>
            <p className="lobby-overlay-sub">Waiting for host to reconnect…</p>
          </div>
        </div>
      )}

      {/* Room code */}
      <div className="lobby-room-code">
        <span className="lobby-room-label">Room Code</span>
        <span className="lobby-room-value">{roomCode}</span>
      </div>

      {/* Teams */}
      <div className="lobby-teams">
        {(['A', 'B'] as Team[]).map(team => {
          const members = playersByTeam(team)
          const isMyTeam = myTeam === team
          return (
            <div key={team} className={`lobby-team-col${isMyTeam ? ' lobby-team-col--mine' : ''}`}>
              <p className="lobby-team-heading">Team {team}</p>
              <div className="lobby-team-players">
                {members.length === 0 ? (
                  <p className="lobby-team-empty">No players yet</p>
                ) : (
                  members.map(([id, p]) => (
                    <div key={id} className="lobby-team-player">
                      <span>{p.name}</span>
                      {id === game.hostId && (
                        <span className="lobby-host-badge">Host</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              {!isMyTeam && (
                <button
                  className="btn-team-join"
                  onClick={() => {
                    console.log(`Lobby: tapped Join Team ${team}`)
                    onJoinTeam(team)
                  }}
                >
                  Join Team {team}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div className="lobby-unassigned">
          <p className="lobby-players-label">Not on a team yet</p>
          <div className="lobby-unassigned-list">
            {unassigned.map(([id, p]) => (
              <div key={id} className="lobby-team-player">
                <span>{p.name}</span>
                {id === game.hostId && (
                  <span className="lobby-host-badge">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config */}
      <div className="lobby-config">
        <div className="lobby-config-row">
          <span className="lobby-config-label">Timer</span>
          <div className="timer-stepper">
            <button
              className="stepper-btn"
              disabled={!isHost || timerDuration <= TIMER_MIN}
              onClick={() => {
                console.log(`Lobby: timer set to ${timerDuration - TIMER_STEP}s`)
                onUpdateConfig('timerDuration', timerDuration - TIMER_STEP)
              }}
            >−</button>
            <span className="stepper-value">{timerDuration}s</span>
            <button
              className="stepper-btn"
              disabled={!isHost || timerDuration >= TIMER_MAX}
              onClick={() => {
                console.log(`Lobby: timer set to ${timerDuration + TIMER_STEP}s`)
                onUpdateConfig('timerDuration', timerDuration + TIMER_STEP)
              }}
            >+</button>
          </div>
        </div>

        <div className="lobby-config-row">
          <span className="lobby-config-label">Target score</span>
          <div className="timer-stepper">
            <button
              className="stepper-btn"
              disabled={!isHost || targetScore <= SCORE_MIN}
              onClick={() => {
                console.log(`Lobby: target score set to ${targetScore - SCORE_STEP}`)
                onUpdateConfig('targetScore', targetScore - SCORE_STEP)
              }}
            >−</button>
            <span className="stepper-value">{targetScore}</span>
            <button
              className="stepper-btn"
              disabled={!isHost || targetScore >= SCORE_MAX}
              onClick={() => {
                console.log(`Lobby: target score set to ${targetScore + SCORE_STEP}`)
                onUpdateConfig('targetScore', targetScore + SCORE_STEP)
              }}
            >+</button>
          </div>
        </div>
      </div>

      {/* Start Game */}
      {isHost && (
        <button
          className="btn-primary btn-large"
          disabled={!canStart}
          onClick={() => {
            console.log('Lobby: host tapped Start Game')
            onStartGame()
          }}
        >
          Start Game
        </button>
      )}

      {!isHost && (
        <p className="lobby-waiting">Waiting for host to start the game…</p>
      )}
    </div>
  )
}
