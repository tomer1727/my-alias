type Props = {
  currentWord: string
  lastWord: boolean
  onCorrect: () => void
  onSkip: () => void
  onSteal: () => void
}

export default function GameScreen({ currentWord, lastWord, onCorrect, onSkip, onSteal }: Props) {
  return (
    <div>
      <p>{currentWord}</p>
      <button onClick={onCorrect}>Correct</button>
      <button onClick={onSkip}>Skip</button>
      <button onClick={onSteal} disabled={!lastWord}>Steal</button>
    </div>
  )
}
