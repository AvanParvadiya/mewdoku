import React from 'react';

interface GameHeaderProps {
  username: string;
  avatar: string;
  mistakes: number;
  timer: number;
  onMenuClick: () => void;
  onProfileClick: () => void;
  formatTime: (s: number) => string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  username,
  avatar,
  mistakes,
  timer,
  onMenuClick,
  onProfileClick,
  formatTime,
}) => {
  return (
    <div className="game-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="header-btn" onClick={onMenuClick}>
          🏠 Menu
        </button>
        
        <div className="game-profile-badge" onClick={onProfileClick} title="Edit Profile">
          <span className="game-profile-avatar">{avatar}</span>
          <span className="game-profile-name">{username}</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div className="timer-badge" style={{ padding: '4px 8px', fontSize: '13px' }}>
          ⏱️ {formatTime(timer)}
        </div>
        <div className="hearts-container" style={{ fontSize: '16px' }}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <span 
              key={idx} 
              className={`heart-icon ${idx < mistakes ? 'heart-lost' : ''}`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
