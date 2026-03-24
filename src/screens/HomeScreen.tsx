type Props = {
  onCreateGame: () => void
  onJoinGame: () => void
  reconnectMessage?: string | null
  pendingReconnect?: string | null
  onReconnect?: () => void
  onDismissReconnect?: () => void
}

export default function HomeScreen({ onCreateGame, onJoinGame, reconnectMessage, pendingReconnect, onReconnect, onDismissReconnect }: Props) {
  return (
    <div className="screen home-screen">
      <h1 className="home-title">Alias</h1>
      {pendingReconnect && (
        <div className="home-rejoin-card">
          <p className="home-rejoin-text">Rejoin room <strong>{pendingReconnect}</strong>?</p>
          <div className="home-rejoin-actions">
            <button className="btn-primary" onClick={onReconnect}>Rejoin</button>
            <button className="btn-secondary" onClick={onDismissReconnect}>Dismiss</button>
          </div>
        </div>
      )}
      {reconnectMessage && (
        <p className="home-reconnect-msg">{reconnectMessage}</p>
      )}
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
