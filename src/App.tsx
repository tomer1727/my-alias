import { useGame } from './hooks/useGame'
import HomeScreen from './screens/HomeScreen'
import CreateScreen from './screens/CreateScreen'
import JoinScreen from './screens/JoinScreen'
import LobbyScreen from './screens/LobbyScreen'
import PreTurnScreen from './screens/PreTurnScreen'
import GameScreen from './screens/GameScreen'
import TurnResultsScreen from './screens/TurnResultsScreen'
import WinScreen from './screens/WinScreen'

export default function App() {
  const {
    screen,
    game,
    roomCode,
    playerId,
    currentWord,
    nextDescriberId,
    reconnectMessage,
    pendingReconnect,
    handleCreateGame,
    handleJoinGame,
    handleGoHome,
    handleGoCreate,
    handleGoJoin,
    handleReconnect,
    handleDismissReconnect,
    handleJoinTeam,
    handleUpdateConfig,
    handleStartGame,
    handleStartTurn,
    handleWordAction,
    handleTimerExpired,
    handleStartNextTurn,
    handleUpdateEntryResult,
    handlePlayAgain,
  } = useGame()

  if (screen === 'home') {
    return (
      <HomeScreen
        onCreateGame={handleGoCreate}
        onJoinGame={handleGoJoin}
        reconnectMessage={reconnectMessage}
        pendingReconnect={pendingReconnect}
        onReconnect={handleReconnect}
        onDismissReconnect={handleDismissReconnect}
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
    return (
      <TurnResultsScreen
        game={game}
        playerId={playerId}
        nextDescriberId={nextDescriberId}
        onStartNextTurn={handleStartNextTurn}
        onUpdateEntryResult={handleUpdateEntryResult}
      />
    )
  }

  if (screen === 'win' && game) {
    return (
      <WinScreen
        game={game}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // Fallback
  return <div className="screen"><p>Loading…</p></div>
}
