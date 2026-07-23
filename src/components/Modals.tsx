import React from 'react';

interface PauseModalProps {
  isPaused: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ isPaused, onResume, onRestart, onExit }) => {
  if (!isPaused) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Game Paused 💤</h3>
        <p className="modal-body">Take your time. The cats are napping.</p>
        <div className="modal-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '10px' }}>
          <button className="btn-primary" onClick={onResume}>
            ▶️ Resume Game
          </button>
          <button className="btn-secondary" onClick={onRestart}>
            🔄 Restart Puzzle
          </button>
          <button className="btn-action" onClick={onExit} style={{ border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--text-muted)' }}>
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  isVictory: boolean;
  timer: number;
  formatTime: (s: number) => string;
  difficulty: string;
  hintUsedCount: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isVictory,
  timer,
  formatTime,
  difficulty,
  hintUsedCount,
  onPlayAgain,
  onMenu,
}) => {
  if (!isVictory) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content animation-popIn">
        <span className="modal-icon-victory">🏆</span>
        <h3 className="modal-title">Purr-fect Victory! 🎉</h3>
        <p className="modal-body" style={{ margin: '10px 0' }}>
          You solved the MewDoku puzzle correctly! The cats are happy.
        </p>

        <div style={{ background: '#fdfaf2', padding: '12px', borderRadius: '16px', margin: '15px 0', border: '1px solid #efebe9', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span>⏱️ Time:</span>
            <strong>{formatTime(timer)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span>🐾 Difficulty:</span>
            <strong style={{ textTransform: 'capitalize' }}>{difficulty}</strong>
          </div>
          {hintUsedCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>💡 Hints Used:</span>
              <strong>{hintUsedCount}</strong>
            </div>
          )}
        </div>

        <div className="modal-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button className="btn-primary" onClick={onPlayAgain}>
            Play Again 🐾
          </button>
          <button className="btn-secondary" onClick={onMenu}>
            🏠 Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  isGameOver: boolean;
  onRestart: () => void;
  onNewBoard: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isGameOver,
  onRestart,
  onNewBoard,
  onMenu,
}) => {
  if (!isGameOver) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content animation-popIn" style={{ borderTop: '6px solid #e53935' }}>
        <span className="modal-icon-gameover">😿</span>
        <h3 className="modal-title" style={{ color: '#c62828' }}>No More Hearts 💔</h3>
        <p className="modal-body">
          Don't worry, even cats make mistakes. Want to try again?
        </p>
        
        <div className="modal-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '15px' }}>
          <button className="btn-primary" onClick={onRestart}>
            🔄 Retry Puzzle
          </button>
          <button className="btn-secondary" onClick={onNewBoard}>
            🐾 New Board
          </button>
          <button className="btn-action" onClick={onMenu} style={{ border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--text-muted)' }}>
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
