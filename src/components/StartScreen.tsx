type Props = {
  onStartGame: () => void
}

export default function StartScreen({ onStartGame }: Props) {
  return (
    <div>
      <h1>Alias</h1>
      <button onClick={onStartGame}>Start New Game</button>
    </div>
  )
}
