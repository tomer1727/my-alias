type Props = {
  onCreateGame: () => void
  onJoinGame: () => void
}

export default function HomeScreen({ onCreateGame, onJoinGame }: Props) {
  return (
    <div className="screen home-screen">
      <h1 className="home-title">Alias</h1>
      <div className="home-actions">
        <button className="btn-primary btn-large" onClick={onCreateGame}>
          Create Game
        </button>
        <button className="btn-secondary btn-large" onClick={onJoinGame}>
          Join Game
        </button>
      </div>
    </div>
  )
}
