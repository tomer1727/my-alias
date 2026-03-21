import { useState } from 'react'
import type { GameState } from './types'
import phrases from './phrases'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import ResultsScreen from './components/ResultsScreen'

function shuffle(arr: string[]): string[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const initialState: GameState = {
  phase: 'start',
  deck: [],
  deckIndex: 0,
  currentTurn: [],
  lastWord: false,
  timerDuration: 60,
  gameTotals: { correct: 0, skip: 0, steal: 0 },
}

export default function App() {
  const [state, setState] = useState<GameState>(initialState)

  function handleStartGame(timerDuration: number) {
    console.log(`Game: new game started, timer=${timerDuration}s`)
    setState({
      phase: 'game',
      deck: shuffle(phrases),
      deckIndex: 0,
      currentTurn: [],
      lastWord: false,
      timerDuration,
      gameTotals: { correct: 0, skip: 0, steal: 0 },
    })
  }

  function handleStartNewTurn() {
    console.log('Game: new turn started, deck index', state.deckIndex)
    setState(s => ({ ...s, phase: 'game', currentTurn: [], lastWord: false }))
  }

  function handleNewGame() {
    console.log('Game: new game — resetting totals and reshuffling deck')
    setState(s => ({
      ...s,
      phase: 'game',
      deck: shuffle(phrases),
      deckIndex: 0,
      currentTurn: [],
      lastWord: false,
      gameTotals: { correct: 0, skip: 0, steal: 0 },
    }))
  }

  function handleTimerExpiry() {
    console.log('Game: timer expired, last word active')
    setState(s => ({ ...s, lastWord: true }))
  }

  function recordAndAdvance(result: 'correct' | 'skip' | 'steal') {
    const word = state.deck[state.deckIndex] ?? ''
    const entry = { word, result }

    if (state.lastWord) {
      console.log(`Game: ${result} on last word — transitioning to results`)
      setState(s => {
        const turn = [...s.currentTurn, entry]
        const totals = {
          correct: s.gameTotals.correct + turn.filter(e => e.result === 'correct').length,
          skip: s.gameTotals.skip + turn.filter(e => e.result === 'skip').length,
          steal: s.gameTotals.steal + turn.filter(e => e.result === 'steal').length,
        }
        console.log(`Results: totals correct=${totals.correct} skip=${totals.skip} steal=${totals.steal}`)
        return { ...s, phase: 'results', currentTurn: turn, gameTotals: totals }
      })
    } else {
      const nextIndex = (state.deckIndex + 1) % state.deck.length
      if (nextIndex === 0) console.log('Game: deck wrapped around to beginning')
      console.log(`Game: ${result}, advancing to word index ${nextIndex}`)
      setState(s => ({
        ...s,
        deckIndex: nextIndex,
        currentTurn: [...s.currentTurn, entry],
      }))
    }
  }

  function handleCorrect() { recordAndAdvance('correct') }
  function handleSkip() { recordAndAdvance('skip') }
  function handleSteal() { recordAndAdvance('steal') }

  const currentWord = state.deck[state.deckIndex] ?? ''

  if (state.phase === 'start') {
    return <StartScreen onStartGame={handleStartGame} />
  }

  if (state.phase === 'game') {
    return (
      <GameScreen
        currentWord={currentWord}
        lastWord={state.lastWord}
        timerDuration={state.timerDuration}
        onCorrect={handleCorrect}
        onSkip={handleSkip}
        onSteal={handleSteal}
        onTimerExpiry={handleTimerExpiry}
      />
    )
  }

  return (
    <ResultsScreen
      currentTurn={state.currentTurn}
      gameTotals={state.gameTotals}
      onStartNewTurn={handleStartNewTurn}
      onNewGame={handleNewGame}
    />
  )
}
