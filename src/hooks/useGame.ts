import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Game, AppScreen, Team, TurnEntry } from '../types'
import {
  createGame,
  joinGame,
  subscribeToGame,
  registerDisconnect,
  gameExists,
  getGame,
  updateGame,
} from '../firebase/game'
import { generateRoomCode } from '../utils/roomCode'
import { seededShuffle } from '../utils/seededShuffle'
import phrases from '../phrases'

const PLAYER_ID_KEY = 'alias_player_id'
const ROOM_CODE_KEY = 'alias_room_code'

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
  currentWord: string | null
  isDescriber: boolean
  nextDescriberId: string | null
  reconnectMessage: string | null
  pendingReconnect: string | null
  handleCreateGame: (nickname: string) => Promise<void>
  handleJoinGame: (code: string, nickname: string) => Promise<void>
  handleGoHome: () => void
  handleGoCreate: () => void
  handleGoJoin: () => void
  handleReconnect: () => void
  handleDismissReconnect: () => void
  handleJoinTeam: (team: Team) => Promise<void>
  handleUpdateConfig: (key: 'timerDuration' | 'targetScore', value: number) => Promise<void>
  handleStartGame: () => Promise<void>
  handleStartTurn: () => Promise<void>
  handleWordAction: (result: TurnEntry['result']) => Promise<void>
  handleTimerExpired: () => Promise<void>
  handleStartNextTurn: () => Promise<void>
  handlePlayAgain: () => Promise<void>
}

export function useGame(): GameHook {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [game, setGame] = useState<Game | null>(null)
  const [roomCode, setRoomCode] = useState('')
  const [playerId] = useState(getOrCreatePlayerId)
  const [reconnectMessage, setReconnectMessage] = useState<string | null>(null)
  const [pendingReconnect, setPendingReconnect] = useState<string | null>(null)

  // On mount: check localStorage for a previous room and surface a rejoin prompt
  useEffect(() => {
    const storedCode = localStorage.getItem(ROOM_CODE_KEY)
    if (!storedCode) return
    getGame(storedCode).then(storedGame => {
      if (!storedGame || !storedGame.players[playerId]) {
        localStorage.removeItem(ROOM_CODE_KEY)
        setReconnectMessage('Your previous room is no longer available.')
        console.log(`useGame: reconnect failed — room ${storedCode} not found or player not in it`)
        return
      }
      setPendingReconnect(storedCode)
      console.log(`useGame: reconnect available for room ${storedCode}`)
    }).catch(() => {
      localStorage.removeItem(ROOM_CODE_KEY)
    })
  }, [playerId])

  // Re-subscribe when roomCode changes
  useEffect(() => {
    if (!roomCode) return
    console.log(`useGame: subscribing to room ${roomCode}`)
    const unsubscribe = subscribeToGame(roomCode, updatedGame => {
      setGame(updatedGame)
    })
    return unsubscribe
  }, [roomCode])

  // Derive screen from game status and currentTurn.phase
  useEffect(() => {
    if (!game) return
    if (game.status === 'lobby') {
      setScreen('lobby')
    } else if (game.status === 'playing') {
      const phase = game.currentTurn?.phase
      if (phase === 'waiting') setScreen('preTurn')
      else if (phase === 'active') setScreen('game')
      else if (phase === 'results') setScreen('turnResults')
    } else if (game.status === 'finished') {
      setScreen('win')
    }
  }, [game?.status, game?.currentTurn?.phase])

  // Compute shuffled deck from deckSeed (stable for the whole game)
  const shuffledDeck = useMemo(
    () => game ? seededShuffle(phrases, game.deckSeed) : [],
    [game?.deckSeed],
  )

  const currentWord = game ? (shuffledDeck[game.deckIndex] ?? null) : null
  const isDescriber = !!game && game.currentTurn?.describerId === playerId

  // Compute who will describe next (used in TurnResultsScreen to gate the button)
  const nextDescriberId = useMemo(() => {
    if (!game || game.currentTurn?.phase !== 'results') return null
    const nextTeam: Team = game.currentTurn.team === 'A' ? 'B' : 'A'
    const nextTeamPlayers = Object.keys(game.players).filter(id => game.players[id].team === nextTeam)
    if (nextTeamPlayers.length === 0) return null
    const idx = game.teams[nextTeam].turnDescIndex % nextTeamPlayers.length
    return nextTeamPlayers[idx]
  }, [game])

  const handleCreateGame = useCallback(async (nickname: string) => {
    const code = await generateRoomCode()
    const seed = Math.random().toString(36).slice(2)
    await createGame(code, playerId, nickname, seed)
    registerDisconnect(code, playerId)
    localStorage.setItem(ROOM_CODE_KEY, code)
    setRoomCode(code)
    console.log(`useGame: created room ${code}`)
  }, [playerId])

  const handleJoinGame = useCallback(async (code: string, nickname: string) => {
    const exists = await gameExists(code)
    if (!exists) throw new Error(`Room "${code}" not found.`)
    await joinGame(code, playerId, nickname)
    registerDisconnect(code, playerId)
    localStorage.setItem(ROOM_CODE_KEY, code)
    setRoomCode(code)
    console.log(`useGame: joined room ${code}`)
  }, [playerId])

  const handleGoHome = useCallback(() => {
    localStorage.removeItem(ROOM_CODE_KEY)
    setScreen('home')
    setGame(null)
    setRoomCode('')
  }, [])

  const handleGoCreate = useCallback(() => setScreen('create'), [])
  const handleGoJoin = useCallback(() => setScreen('join'), [])

  const handleReconnect = useCallback(() => {
    if (!pendingReconnect) return
    registerDisconnect(pendingReconnect, playerId)
    setRoomCode(pendingReconnect)
    setPendingReconnect(null)
    console.log(`useGame: rejoined room ${pendingReconnect}`)
  }, [pendingReconnect, playerId])

  const handleDismissReconnect = useCallback(() => {
    localStorage.removeItem(ROOM_CODE_KEY)
    setPendingReconnect(null)
    console.log('useGame: dismissed reconnect prompt')
  }, [])

  const handleJoinTeam = useCallback(async (team: Team) => {
    await updateGame(roomCode, { [`players/${playerId}/team`]: team })
    console.log(`Lobby: joined Team ${team}`)
  }, [roomCode, playerId])

  const handleUpdateConfig = useCallback(async (key: 'timerDuration' | 'targetScore', value: number) => {
    await updateGame(roomCode, { [`config/${key}`]: value })
    console.log(`Lobby: config updated — ${key}=${value}`)
  }, [roomCode])

  const handleStartGame = useCallback(async () => {
    if (!game) return
    const teamAPlayers = Object.keys(game.players).filter(id => game.players[id].team === 'A')
    const firstDescriberId = teamAPlayers[0]
    await updateGame(roomCode, {
      status: 'playing',
      'currentTurn/team': 'A',
      'currentTurn/describerId': firstDescriberId,
      'currentTurn/phase': 'waiting',
      'currentTurn/startedAt': null,
      'currentTurn/lastWord': false,
    })
    console.log(`Lobby: game started — first describer=${game.players[firstDescriberId]?.name}`)
  }, [roomCode, game])

  const handleStartTurn = useCallback(async () => {
    await updateGame(roomCode, {
      'currentTurn/startedAt': Date.now(),
      'currentTurn/phase': 'active',
    })
    console.log('PreTurn: turn started')
  }, [roomCode])

  const handleWordAction = useCallback(async (result: TurnEntry['result']) => {
    if (!game) return
    const word = shuffledDeck[game.deckIndex]
    const entries: TurnEntry[] = Array.isArray(game.currentTurn.entries) ? game.currentTurn.entries : []
    const isLastWord = game.currentTurn.lastWord
    const updates: Record<string, unknown> = {
      [`currentTurn/entries/${entries.length}`]: { word, result },
      deckIndex: game.deckIndex + 1,
    }
    if (isLastWord) {
      updates['currentTurn/phase'] = 'results'
    }
    await updateGame(roomCode, updates)
    console.log(`Game: word action — "${word}" → ${result}${isLastWord ? ' (last word, phase→results)' : ''}`)
  }, [roomCode, game, shuffledDeck])

  const handleTimerExpired = useCallback(async () => {
    if (!game || game.currentTurn.lastWord) return
    await updateGame(roomCode, { 'currentTurn/lastWord': true })
    console.log('Game: timer expired — last word active')
  }, [roomCode, game])

  const handleStartNextTurn = useCallback(async () => {
    if (!game) return
    const { team, entries } = game.currentTurn
    const entryList: TurnEntry[] = Array.isArray(entries) ? entries : []

    // Score delta for the current team: correct +1, skip -1
    const currentTeamDelta = entryList.reduce((acc, e) => {
      if (e.result === 'correct') return acc + 1
      if (e.result === 'skip') return acc - 1
      return acc
    }, 0)
    // Steals give +1 to the opposing team
    const stealCount = entryList.filter(e => e.result === 'steal').length
    const otherTeam: Team = team === 'A' ? 'B' : 'A'

    const newCurrentTeamScore = game.teams[team].score + currentTeamDelta
    const newOtherTeamScore = game.teams[otherTeam].score + stealCount

    const newGlobalTurnIndex = game.globalTurnIndex + 1
    // Advance describer index for the team that just finished
    const currentTeamPlayers = Object.keys(game.players).filter(id => game.players[id].team === team)
    const newCurrentTurnDescIndex = currentTeamPlayers.length > 0
      ? (game.teams[team].turnDescIndex + 1) % currentTeamPlayers.length
      : 0

    // Next team is the one that didn't just play
    const nextTeam: Team = otherTeam
    const nextTeamPlayers = Object.keys(game.players).filter(id => game.players[id].team === nextTeam)
    const nextDescIndex = game.teams[nextTeam].turnDescIndex % Math.max(nextTeamPlayers.length, 1)
    const nextDescriberId = nextTeamPlayers[nextDescIndex] ?? ''

    // Win check
    const targetScore = game.config.targetScore
    const currentTeamWins = newCurrentTeamScore >= targetScore
    const otherTeamWins = newOtherTeamScore >= targetScore

    const updates: Record<string, unknown> = {
      [`teams/${team}/score`]: newCurrentTeamScore,
      [`teams/${otherTeam}/score`]: newOtherTeamScore,
      [`teams/${team}/turnDescIndex`]: newCurrentTurnDescIndex,
      globalTurnIndex: newGlobalTurnIndex,
    }

    if (currentTeamWins || otherTeamWins) {
      updates.winner = currentTeamWins ? team : otherTeam
      updates.status = 'finished'
      console.log(`Game: win check — Team ${currentTeamWins ? team : otherTeam} wins!`)
    } else {
      updates['currentTurn/team'] = nextTeam
      updates['currentTurn/describerId'] = nextDescriberId
      updates['currentTurn/phase'] = 'waiting'
      updates['currentTurn/startedAt'] = null
      updates['currentTurn/entries'] = []
      updates['currentTurn/lastWord'] = false
    }

    await updateGame(roomCode, updates)
    console.log(`TurnResults: next turn started — Team ${nextTeam}, score A=${newCurrentTeamScore} B=${newOtherTeamScore}`)
  }, [roomCode, game])

  const handlePlayAgain = useCallback(async () => {
    if (!game) return
    const resetPlayers: Record<string, unknown> = {}
    Object.keys(game.players).forEach(id => {
      resetPlayers[`players/${id}/team`] = null
    })
    await updateGame(roomCode, {
      status: 'lobby',
      'teams/A/score': 0,
      'teams/A/turnDescIndex': 0,
      'teams/B/score': 0,
      'teams/B/turnDescIndex': 0,
      globalTurnIndex: 0,
      winner: null,
      ...resetPlayers,
    })
    console.log('WinScreen: play again — reset to lobby')
  }, [roomCode, game])

  return { screen, game, roomCode, playerId, currentWord, isDescriber, nextDescriberId, reconnectMessage, pendingReconnect, handleCreateGame, handleJoinGame, handleGoHome, handleGoCreate, handleGoJoin, handleReconnect, handleDismissReconnect, handleJoinTeam, handleUpdateConfig, handleStartGame, handleStartTurn, handleWordAction, handleTimerExpired, handleStartNextTurn, handlePlayAgain }
}
