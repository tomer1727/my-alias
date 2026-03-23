import { useState } from 'react'

type Props = {
  onBack: () => void
  onJoin: (roomCode: string, nickname: string) => Promise<void>
}

export default function JoinScreen({ onBack, onJoin }: Props) {
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = roomCode.trim().toUpperCase()
    const name = nickname.trim()
    if (!code || !name) return
    setLoading(true)
    setError('')
    try {
      console.log(`Join: joining room ${code} as "${name}"`)
      await onJoin(code, name)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join game.'
      console.error('Join: failed to join game', err)
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="screen entry-screen">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 className="entry-title">Join Game</h2>
      <form className="entry-form" onSubmit={handleSubmit}>
        <label className="entry-label" htmlFor="room-code">Room code</label>
        <input
          id="room-code"
          className="entry-input entry-input-code"
          type="text"
          placeholder="XXXXXX"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
        />
        <label className="entry-label" htmlFor="nickname">Your nickname</label>
        <input
          id="nickname"
          className="entry-input"
          type="text"
          placeholder="e.g. Tomer"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          maxLength={20}
          autoComplete="off"
          autoCorrect="off"
        />
        {error && <p className="entry-error">{error}</p>}
        <button
          className="btn-primary btn-large"
          type="submit"
          disabled={roomCode.trim().length !== 6 || !nickname.trim() || loading}
        >
          {loading ? 'Joining…' : 'Join Game'}
        </button>
      </form>
    </div>
  )
}
