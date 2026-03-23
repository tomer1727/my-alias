import { useState } from 'react'

type Props = {
  onBack: () => void
  onCreate: (nickname: string) => Promise<void>
}

export default function CreateScreen({ onBack, onCreate }: Props) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = nickname.trim()
    if (!name) return
    setLoading(true)
    setError('')
    try {
      console.log(`Create: creating game as "${name}"`)
      await onCreate(name)
    } catch (err) {
      console.error('Create: failed to create game', err)
      setError('Failed to create game. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="screen entry-screen">
      <button className="btn-back" onClick={onBack}>← Back</button>
      <h2 className="entry-title">Create Game</h2>
      <form className="entry-form" onSubmit={handleSubmit}>
        <label className="entry-label" htmlFor="nickname">Your nickname</label>
        <input
          id="nickname"
          className="entry-input"
          type="text"
          placeholder="e.g. Tomer"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          maxLength={20}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
        />
        {error && <p className="entry-error">{error}</p>}
        <button
          className="btn-primary btn-large"
          type="submit"
          disabled={!nickname.trim() || loading}
        >
          {loading ? 'Creating…' : 'Create Game'}
        </button>
      </form>
    </div>
  )
}
