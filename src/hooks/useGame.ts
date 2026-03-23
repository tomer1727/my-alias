import { useState, useEffect, useCallback } from 'react'
import type { Game, AppScreen } from '../types'
import {
  createGame,
  joinGame,
  subscribeToGame,
  registerDisconnect,
  gameExists,
} from '../firebase/game'
import { generateRoomCode } from '../utils/roomCode'

const PLAYER_ID_KEY = 'alias_player_id'

function getOrCreatePlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

export type GameHook = {
  screen: AppScreen
  game: Game | null
  roomCode: string
  playerId: string
  handleCreateGame: (nickname: string) => Promise<void>
  handleJoinGame: (code: string, nickname: string) => Promise<void>
  handleGoHome: () => void
  handleGoCreate: () => void
  handleGoJoin: () => void
}

export function useGame(): GameHook {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [game, setGame] = useState<Game | null>(null)
  const [roomCode, setRoomCode] = useState('')
  const [playerId] = useState(getOrCreatePlayerId)

  // Re-subscribe when roomCode changes
  useEffect(() => {
    if (!roomCode) return
    console.log(`useGame: subscribing to room ${roomCode}`)
    const unsubscribe = subscribeToGame(roomCode, updatedGame => {
      setGame(updatedGame)
    })
    return unsubscribe
  }, [roomCode])

  // Derive screen from game status (once subscribed)
  useEffect(() => {
    if (!game) return
    if (game.status === 'lobby') setScreen('lobby')
    else if (game.status === 'playing') setScreen('preTurn')
    else if (game.status === 'finished') setScreen('win')
  }, [game?.status])

  const handleCreateGame = useCallback(async (nickname: string) => {
    const code = await generateRoomCode()
    const seed = Math.random().toString(36).slice(2)
    await createGame(code, playerId, nickname, seed)
    registerDisconnect(code, playerId)
    setRoomCode(code)
    console.log(`useGame: created room ${code}`)
  }, [playerId])

  const handleJoinGame = useCallback(async (code: string, nickname: string) => {
    const exists = await gameExists(code)
    if (!exists) throw new Error(`Room "${code}" not found.`)
    await joinGame(code, playerId, nickname)
    registerDisconnect(code, playerId)
    setRoomCode(code)
    console.log(`useGame: joined room ${code}`)
  }, [playerId])

  const handleGoHome = useCallback(() => {
    setScreen('home')
    setGame(null)
    setRoomCode('')
  }, [])

  const handleGoCreate = useCallback(() => setScreen('create'), [])
  const handleGoJoin = useCallback(() => setScreen('join'), [])

  return { screen, game, roomCode, playerId, handleCreateGame, handleJoinGame, handleGoHome, handleGoCreate, handleGoJoin }
}
