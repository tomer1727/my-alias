// ── Firebase data model ───────────────────────────────────

export type Team = 'A' | 'B'

export type TurnEntry = {
  word: string
  result: 'correct' | 'skip' | 'steal'
}

export type Player = {
  name: string
  team: Team | null
  connected: boolean
}

export type CurrentTurn = {
  team: Team
  describerId: string
  phase: 'waiting' | 'active' | 'results'
  startedAt: number | null
  entries: TurnEntry[]
  lastWord: boolean
}

export type Game = {
  status: 'lobby' | 'playing' | 'finished'
  hostId: string
  createdAt: number
  config: {
    timerDuration: number
    targetScore: number
  }
  players: Record<string, Player>
  teams: {
    A: { score: number; turnDescIndex: number }
    B: { score: number; turnDescIndex: number }
  }
  globalTurnIndex: number
  deckSeed: string
  deckIndex: number
  currentTurn: CurrentTurn
  winner: Team | null
}

// ── Local state ───────────────────────────────────────────

export type AppScreen =
  | 'home'
  | 'create'
  | 'join'
  | 'lobby'
  | 'preTurn'
  | 'game'
  | 'turnResults'
  | 'win'
