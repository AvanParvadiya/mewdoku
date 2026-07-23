import { GameBoard } from './components/GameBoard';
import { MainDashboard } from './components/Dashboard';
import { Decorations } from './components/Decorations';
import { EditProfileModal } from './components/EditProfileModal';
import { GameHeader } from './components/GameHeader';
import { GoalsHUD } from './components/GoalsHUD';
import { GameOverModal, PauseModal, VictoryModal } from './components/Modals';
import { useGamePlay } from './hooks/useGamePlay';
import { useUserProfile } from './hooks/useUserProfile';
import { audio } from './utils/AudioEngine';

export default function App() {
  // Gameplay Logic Hook
  const {
    screen,
    setScreen,
    difficulty,
    boardSize,
    puzzle,
    grid,
    mistakes,
    history,
    isPaused,
    setIsPaused,
    isVictory,
    isGameOver,
    isMuted,
    errorCell,
    hintUsedCount,
    stats,
    saveStats,
    timer,
    formatTime,
    startNewGame,
    handleCellClick,
    handleUndo,
    handleUseHint,
    toggleMute,
    resetCurrentGame,
    getGameProgress,
  } = useGamePlay();

  // User Profile Hook
  const {
    username,
    avatar,
    isEditingProfile,
    editName,
    setEditName,
    editAvatar,
    setEditAvatar,
    handleOpenEditProfile,
    handleSaveProfile,
    setIsEditingProfile,
  } = useUserProfile();

  return (
    <div className="app-container">
      {/* Decorative sakura petals */}
      <Decorations />

      {/* 1. HOME / DASHBOARD SCREEN */}
      {screen === 'home' && (
        <MainDashboard
          username={username}
          avatar={avatar}
          gamesWon={stats.gamesWon}
          isMuted={isMuted}
          onPlayDifficulty={startNewGame}
          onMuteToggle={toggleMute}
          onOpenProfile={handleOpenEditProfile}
          stats={stats}
          onResetStats={() => {
            saveStats({
              gamesPlayed: 0,
              gamesWon: 0,
              bestTimes: { easy: null, medium: null, hard: null, expert: null, master: null }
            });
          }}
          formatTime={formatTime}
        />
      )}

      {/* 2. GAME PLAY SCREEN */}
      {screen === 'game' && puzzle && (
        <div className="screen">
          <GameHeader
            username={username}
            avatar={avatar}
            mistakes={mistakes}
            timer={timer}
            onMenuClick={() => { audio.playClick(); setScreen('home'); }}
            onProfileClick={handleOpenEditProfile}
            formatTime={formatTime}
          />

          {/* 3-Column Goal HUD Bar */}
          {(() => {
            const progress = getGameProgress();
            return (
              <GoalsHUD
                catsCount={progress.catsCount}
                rowsDone={progress.rowsDone}
                colsDone={progress.colsDone}
                regionsDone={progress.regionsDone}
                boardSize={boardSize}
              />
            );
          })()}

          {/* Grid Board */}
          <GameBoard
            puzzle={puzzle}
            boardSize={boardSize}
            grid={grid}
            errorCell={errorCell}
            onCellClick={handleCellClick}
          />

          <div className="game-footer">
            <div className="action-buttons">
              <button className="btn-action" onClick={handleUndo} disabled={history.length === 0}>
                ↩️ Undo
              </button>
              <button className="btn-action" onClick={handleUseHint}>
                💡 Hint
              </button>
              <button className="btn-action" onClick={() => { audio.playClick(); setIsPaused(true); }}>
                ⏸️ Pause
              </button>
            </div>
          </div>

          {/* Pause Modal */}
          <PauseModal
            isPaused={isPaused}
            onResume={() => { audio.playClick(); setIsPaused(false); }}
            onRestart={resetCurrentGame}
            onExit={() => { audio.playClick(); setScreen('home'); }}
          />

          {/* Victory Modal */}
          <VictoryModal
            isVictory={isVictory}
            timer={timer}
            formatTime={formatTime}
            difficulty={difficulty}
            hintUsedCount={hintUsedCount}
            onPlayAgain={() => startNewGame(boardSize)}
            onMenu={() => setScreen('home')}
          />

          {/* Game Over Modal */}
          <GameOverModal
            isGameOver={isGameOver}
            onRestart={resetCurrentGame}
            onNewBoard={() => startNewGame(boardSize)}
            onMenu={() => setScreen('home')}
          />
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <EditProfileModal
          editName={editName}
          setEditName={setEditName}
          editAvatar={editAvatar}
          setEditAvatar={setEditAvatar}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditingProfile(false)}
        />
      )}
    </div>
  );
}
