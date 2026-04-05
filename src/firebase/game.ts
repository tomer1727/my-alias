import {
  ref,
  set,
  get,
  update,
  onValue,
  onDisconnect,
  type DatabaseReference,
  type Unsubscribe,
} from 'firebase/database'
import { db } from './config'
import type { Game, Player, TurnEntry } from '../types'

// ── Helpers ──────────────────────────────────────────────

function gameRef(roomCode: string): DatabaseReference {
  return ref(db, `games/${roomCode}`)
}

// ── Read ─────────────────────────────────────────────────

export async function gameExists(roomCode: string): Promise<boolean> {
  const snap = await get(gameRef(roomCode))
  return snap.exists()
}

export async function getGame(roomCode: string): Promise<Game | null> {
  const snap = await get(gameRef(roomCode))
  return snap.exists() ? (snap.val() as Game) : null
}

// ── Create ───────────────────────────────────────────────

export async function createGame(
  roomCode: string,
  hostId: string,
  hostName: string,
  deckSeed: string,
): Promise<void> {
  const game: Game = {
    status: 'lobby',
    hostId,
    createdAt: Date.now(), // used to identify stale games; clean up old rooms manually via Firebase console
    config: {
      timerDuration: 60,
      targetScore: 30,
    },
    players: {
      [hostId]: { name: hostName, team: null, connected: true },
    },
    teams: {
      A: { score: 0, turnDescIndex: 0 },
      B: { score: 0, turnDescIndex: 0 },
    },
    globalTurnIndex: 0,
    deckSeed,
    deckIndex: 0,
    currentTurn: {
      team: 'A',
      describerId: '',
      phase: 'waiting',
      startedAt: null,
      entries: [],
      lastWord: false,
    },
    winner: null,
  }
  await set(gameRef(roomCode), game)
  console.log(`Firebase: created game ${roomCode}, host=${hostName}`)
}

// ── Join ─────────────────────────────────────────────────

export async function joinGame(
  roomCode: string,
  playerId: string,
  playerName: string,
): Promise<void> {
  const playerRef = ref(db, `games/${roomCode}/players/${playerId}`)
  const player: Player = { name: playerName, team: null, connected: true }
  await set(playerRef, player)
  console.log(`Firebase: player ${playerName} joined game ${roomCode}`)
}

// ── Disconnect handling ───────────────────────────────────

export function registerDisconnect(roomCode: string, playerId: string): void {
  const connectedRef = ref(db, `games/${roomCode}/players/${playerId}/connected`)
  onDisconnect(connectedRef).set(false)
}

// ── Subscribe ─────────────────────────────────────────────

export function subscribeToGame(
  roomCode: string,
  onUpdate: (game: Game | null) => void,
): Unsubscribe {
  return onValue(gameRef(roomCode), snap => {
    onUpdate(snap.exists() ? (snap.val() as Game) : null)
  })
}

// ── Update ────────────────────────────────────────────────

export async function updateGame(
  roomCode: string,
  updates: Record<string, unknown>,
): Promise<void> {
  await update(gameRef(roomCode), updates)
}

export async function updateEntryResult(
  roomCode: string,
  index: number,
  result: TurnEntry['result'],
): Promise<void> {
  await update(ref(db, `games/${roomCode}/currentTurn/entries/${index}`), { result })
}
