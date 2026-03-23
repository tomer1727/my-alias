import { useGame } from './hooks/useGame'
import HomeScreen from './screens/HomeScreen'
import CreateScreen from './screens/CreateScreen'
import JoinScreen from './screens/JoinScreen'
import LobbyScreen from './screens/LobbyScreen'

export default function App() {
  const {
    screen,
    game,
    roomCode,
    playerId,
    handleCreateGame,
    handleJoinGame,
    handleGoHome,
    handleGoCreate,
    handleGoJoin,
    handleJoinTeam,
    handleUpdateConfig,
    handleStartGame,
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

  // Fallback
  return <div className="screen"><p>Loading…</p></div>
}
