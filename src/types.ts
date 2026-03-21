export type GamePhase = 'start' | 'game' | 'results'

export type TurnEntry = {
  word: string
  result: 'correct' | 'skip' | 'steal'
}

export type GameState = {
  phase: GamePhase
  deck: string[]
  deckIndex: number
  currentTurn: TurnEntry[]
  lastWord: boolean
}
