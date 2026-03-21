type Props = {
  onStartGame: () => void
}

export default function StartScreen({ onStartGame }: Props) {
  return (
    <div className="screen start-screen">
      <h1 className="start-title">Alias</h1>
      <button className="btn-primary btn-large" onClick={onStartGame}>Start New Game</button>
    </div>
  )
}
