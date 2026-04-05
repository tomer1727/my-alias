import { useState, useEffect, useRef } from 'react'
import type { Game, TurnEntry } from '../types'

type Props = {
  game: Game
  playerId: string
  currentWord: string | null
  onWordAction: (result: TurnEntry['result']) => Promise<void>
  onTimerExpired: () => Promise<void>
}

type Badge = { id: number; value: '+1' | '-1' }

function getTimerColor(remaining: number, total: number): string {
  const ratio = remaining / total
  if (ratio > 0.5) return '#22c55e'
  if (ratio > 0.25) return '#f59e0b'
  return '#dc2626'
}

function deriveTurnScore(entries: TurnEntry[]): number {
  return entries.reduce((acc, e) => {
    if (e.result === 'correct') return acc + 1
    if (e.result === 'skip') return acc - 1
    return acc
  }, 0)
}

export default function GameScreen({
  game,
  playerId,
  currentWord,
  onWordAction,
  onTimerExpired,
}: Props) {
  const { team, describerId, startedAt, lastWord, entries = [] } = game.currentTurn
  const { timerDuration } = game.config
  const isDescriber = playerId === describerId
  const describerName = game.players[describerId]?.name ?? 'Unknown'

  const isHost = playerId === game.hostId
  const hostConnected = game.players[game.hostId]?.connected !== false
  const showHostOverlay = !isHost && !hostConnected

  const [remaining, setRemaining] = useState(timerDuration)
  const expiredCalledRef = useRef(false)

  // Recompute remaining on every tick
  useEffect(() => {
    if (!startedAt) return
    expiredCalledRef.current = false

    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000
      const rem = Math.max(0, Math.ceil(timerDuration - elapsed))
      setRemaining(rem)
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [startedAt, timerDuration])

  // Describer writes lastWord: true when timer hits 0
  useEffect(() => {
    if (remaining === 0 && isDescriber && !lastWord && !expiredCalledRef.current) {
      expiredCalledRef.current = true
      onTimerExpired()
    }
  }, [remaining, isDescriber, lastWord, onTimerExpired])

  // ── Viewer: detect new entries and trigger badge ────────
  const [badge, setBadge] = useState<Badge | null>(null)
  const prevEntriesLenRef = useRef(entries.length)
  const badgeIdRef = useRef(0)

  useEffect(() => {
    if (isDescriber) return
    const prev = prevEntriesLenRef.current
    const curr = entries.length
    if (curr > prev) {
      const lastEntry = entries[curr - 1]
      if (lastEntry.result === 'correct' || lastEntry.result === 'skip') {
        const value = lastEntry.result === 'correct' ? '+1' : '-1'
        badgeIdRef.current += 1
        const id = badgeIdRef.current
        setBadge({ id, value })
        console.log(`Game viewer: entry badge ${value} (entry #${curr})`)
        setTimeout(() => {
          setBadge(b => (b?.id === id ? null : b))
        }, 1200)
      }
    }
    prevEntriesLenRef.current = curr
  }, [entries, isDescriber])

  const timerColor = getTimerColor(remaining, timerDuration)
  const isPulsing = remaining <= 5 && remaining > 0

  const teamAScore = game.teams.A.score
  const teamBScore = game.teams.B.score

  // ── Describer view ──────────────────────────────────────
  if (isDescriber) {
    return (
      <div className="screen game-screen">
        {showHostOverlay && (
          <div className="lobby-overlay">
            <div className="lobby-overlay-card">
              <p className="lobby-overlay-title">Host disconnected</p>
              <p className="lobby-overlay-sub">Waiting for host to reconnect…</p>
            </div>
          </div>
        )}
        <div className="game-scores">
          <span className={`game-score-chip${team === 'A' ? ' game-score-chip--active' : ''}`}>
            A: {teamAScore}
          </span>
          <span className={`game-score-chip${team === 'B' ? ' game-score-chip--active' : ''}`}>
            B: {teamBScore}
          </span>
        </div>

        <div
          className={`timer${isPulsing ? ' timer-pulse' : ''}`}
          style={{ color: timerColor }}
        >
          {remaining}
        </div>

        {lastWord && <div className="game-last-word-badge">Last word!</div>}

        <div className="current-word">{currentWord}</div>

        <div className="game-buttons">
          <button
            className="btn-correct"
            onClick={() => {
              console.log(`Game: tapped Correct — "${currentWord}"`)
              onWordAction('correct')
            }}
          >
            Correct ✓
          </button>
          <button
            className="btn-skip"
            onClick={() => {
              console.log(`Game: tapped Skip — "${currentWord}"`)
              onWordAction('skip')
            }}
          >
            Skip →
          </button>
          <button
            className={lastWord ? 'btn-steal-active' : 'btn-steal'}
            disabled={!lastWord}
            onClick={() => {
              console.log(`Game: tapped Steal — "${currentWord}"`)
              onWordAction('steal')
            }}
          >
            Steal ★
          </button>
        </div>
      </div>
    )
  }

  // ── Viewer view ─────────────────────────────────────────
  const turnScore = deriveTurnScore(entries)
  const turnScoreLabel = turnScore >= 0 ? `+${turnScore}` : `${turnScore}`

  return (
    <div className="screen game-screen">
      {showHostOverlay && (
        <div className="lobby-overlay">
          <div className="lobby-overlay-card">
            <p className="lobby-overlay-title">Host disconnected</p>
            <p className="lobby-overlay-sub">Waiting for host to reconnect…</p>
          </div>
        </div>
      )}
      <div className="game-scores">
        <span className={`game-score-chip${team === 'A' ? ' game-score-chip--active' : ''}`}>
          A: {teamAScore}
        </span>
        <span className={`game-score-chip${team === 'B' ? ' game-score-chip--active' : ''}`}>
          B: {teamBScore}
        </span>
      </div>

      <div
        className={`timer${isPulsing ? ' timer-pulse' : ''}`}
        style={{ color: timerColor }}
      >
        {remaining}
      </div>

      <p className="game-viewer-label">
        Team {team} — {describerName} is describing
      </p>

      <p className="game-turn-score">This turn: {turnScoreLabel}</p>

      {lastWord && <div className="game-last-word-badge">Last word!</div>}

      {badge && (
        <div
          key={badge.id}
          className={`game-entry-badge game-entry-badge--${badge.value === '+1' ? 'correct' : 'skip'}`}
        >
          {badge.value}
        </div>
      )}
    </div>
  )
}
