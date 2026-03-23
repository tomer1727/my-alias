import { useGame } from './hooks/useGame'
import HomeScreen from './screens/HomeScreen'
import CreateScreen from './screens/CreateScreen'
import JoinScreen from './screens/JoinScreen'
import LobbyScreen from './screens/LobbyScreen'
import PreTurnScreen from './screens/PreTurnScreen'
import GameScreen from './screens/GameScreen'
import TurnResultsScreen from './screens/TurnResultsScreen'

export default function App() {
  const {
    screen,
    game,
    roomCode,
    playerId,
    currentWord,
    handleCreateGame,
    handleJoinGame,
    handleGoHome,
    handleGoCreate,
    handleGoJoin,
    handleJoinTeam,
    handleUpdateConfig,
    handleStartGame,
    handleStartTurn,
    handleWordAction,
    handleTimerExpired,
  } = useGame()

  if (screen === 'home') {
    return (
      <HomeScreen
        onCreateGame={handleGoCreate}
        onJoinGame={handleGoJoin}
      />
    )
  }

  if (screen === 'create') {
    return (
      <CreateScreen
        onBack={handleGoHome}
        onCreate={handleCreateGame}
      />
    )
  }

  if (screen === 'join') {
    return (
      <JoinScreen
        onBack={handleGoHome}
        onJoin={handleJoinGame}
      />
    )
  }

  if (screen === 'lobby' && game) {
    return (
      <LobbyScreen
        game={game}
        roomCode={roomCode}
        playerId={playerId}
        onJoinTeam={handleJoinTeam}
        onUpdateConfig={handleUpdateConfig}
        onStartGame={handleStartGame}
      />
    )
  }

  if (screen === 'preTurn' && game) {
    return (
      <PreTurnScreen
        game={game}
        playerId={playerId}
        onStartTurn={handleStartTurn}
      />
    )
  }

  if (screen === 'game' && game && currentWord) {
    return (
      <GameScreen
        game={game}
        playerId={playerId}
        currentWord={currentWord}
        onWordAction={handleWordAction}
        onTimerExpired={handleTimerExpired}
      />
    )
  }

  if (screen === 'turnResults' && game) {
    return <TurnResultsScreen game={game} />
  }

  // Fallback
  return <div className="screen"><p>Loading…</p></div>
}
