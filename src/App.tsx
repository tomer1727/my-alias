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
}

export default function App() {
  const [state, setState] = useState<GameState>(initialState)

  function handleStartGame() {
    console.log('Game: new game started')
    setState({
      phase: 'game',
      deck: shuffle(phrases),
      deckIndex: 0,
      currentTurn: [],
      lastWord: false,
    })
  }

  function handleStartNewTurn() {
    console.log('Game: new turn started, deck index', state.deckIndex)
    setState(s => ({ ...s, phase: 'game', currentTurn: [], lastWord: false }))
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
      setState(s => ({
        ...s,
        phase: 'results',
        currentTurn: [...s.currentTurn, entry],
      }))
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
      onStartNewTurn={handleStartNewTurn}
    />
  )
}
