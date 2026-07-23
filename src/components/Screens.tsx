import React from 'react';
import { audio } from '../utils/AudioEngine';
import { GameStats } from '../types/game';

interface HomeScreenProps {
  username: string;
  avatar: string;
  gamesWon: number;
  isMuted: boolean;
  onPlayClick: () => void;
  onTutorialClick: () => void;
  onStatsClick: () => void;
  onMuteToggle: () => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  username,
  avatar,
  gamesWon,
  isMuted,
  onPlayClick,
  onTutorialClick,
  onStatsClick,
  onMuteToggle,
  onOpenProfile,
}) => {
  return (
    <div className="screen">
      {/* User Profile Widget */}
      <div className="home-profile-widget" onClick={onOpenProfile} title="Edit Profile">
        <span className="profile-widget-avatar">{avatar}</span>
        <div className="profile-widget-details">
          <span className="profile-widget-name">{username}</span>
          <span className="profile-widget-rank">🐾 Cat Scout ({gamesWon} Wins)</span>
        </div>
        <span className="profile-widget-edit">✏️</span>
      </div>

      <div className="title-container">
        <div className="logo-cat">🐱</div>
        <h1 className="app-title">
          <span>Mew</span>
          <span>Doku</span>
        </h1>
        <p className="app-subtitle">Cozy Cat Logic Puzzles</p>
      </div>

      <div className="menu-options">
        <button className="btn-primary" onClick={onPlayClick}>
          Play Game 🐾
        </button>
        <button className="btn-secondary" onClick={onTutorialClick}>
          How to Play
        </button>
        <button className="btn-secondary" onClick={onStatsClick}>
          Statistics
        </button>
        <button 
          className="btn-action" 
          onClick={onMuteToggle} 
          style={{ marginTop: '8px', fontSize: '15px' }}
        >
          {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
        </button>
      </div>
    </div>
  );
};

interface DifficultySelectScreenProps {
  onMenuClick: () => void;
  onSelectDifficulty: (size: number) => void;
}

export const DifficultySelectScreen: React.FC<DifficultySelectScreenProps> = ({
  onMenuClick,
  onSelectDifficulty,
}) => {
  return (
    <div className="screen" style={{ padding: '20px 0' }}>
      <div style={{ width: '100%' }}>
        <button className="header-btn" onClick={onMenuClick}>
          🏠 Menu
        </button>
        <h2 className="app-title" style={{ fontSize: '32px', margin: '20px 0 10px 0' }}>Select Board</h2>
      </div>

      <div className="difficulty-selector">
        <div className="difficulty-card" onClick={() => onSelectDifficulty(5)}>
          <div className="difficulty-info">
            <span className="difficulty-name">Easy 🐾</span>
            <span className="difficulty-desc">5x5 grid - perfect for beginners</span>
          </div>
          <span className="difficulty-star">⭐</span>
        </div>
        
        <div className="difficulty-card" onClick={() => onSelectDifficulty(6)}>
          <div className="difficulty-info">
            <span className="difficulty-name">Medium 🐾</span>
            <span className="difficulty-desc">6x6 grid - casual logic fun</span>
          </div>
          <span className="difficulty-star">⭐⭐</span>
        </div>

        <div className="difficulty-card" onClick={() => onSelectDifficulty(7)}>
          <div className="difficulty-info">
            <span className="difficulty-name">Hard 🐾</span>
            <span className="difficulty-desc">7x7 grid - deeper logic required</span>
          </div>
          <span className="difficulty-star">⭐⭐⭐</span>
        </div>

        <div className="difficulty-card" onClick={() => onSelectDifficulty(8)}>
          <div className="difficulty-info">
            <span className="difficulty-name">Expert 🐾</span>
            <span className="difficulty-desc">8x8 grid - a purr-fect challenge</span>
          </div>
          <span className="difficulty-star">⭐⭐⭐⭐</span>
        </div>

        <div className="difficulty-card" onClick={() => onSelectDifficulty(9)}>
          <div className="difficulty-info">
            <span className="difficulty-name">Master 🐾</span>
            <span className="difficulty-desc">9x9 grid - true cat master class</span>
          </div>
          <span className="difficulty-star">👑</span>
        </div>
      </div>

      <div style={{ height: '40px' }}></div>
    </div>
  );
};

interface StatisticsScreenProps {
  stats: GameStats;
  onMenuClick: () => void;
  onResetStats: () => void;
  formatTime: (s: number) => string;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  stats,
  onMenuClick,
  onResetStats,
  formatTime,
}) => {
  return (
    <div className="screen" style={{ padding: '20px 0' }}>
      <div style={{ width: '100%' }}>
        <button className="header-btn" onClick={onMenuClick}>
          🏠 Menu
        </button>
        <h2 className="app-title" style={{ fontSize: '32px', margin: '20px 0 10px 0' }}>Statistics</h2>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-val">{stats.gamesPlayed}</span>
            <span className="stat-lbl">Played</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">{stats.gamesWon}</span>
            <span className="stat-lbl">Won</span>
          </div>
        </div>

        <div style={{ background: 'var(--panel-bg)', border: '2px solid var(--border-color)', borderRadius: '24px', padding: '16px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '12px', textAlign: 'center' }}>🏆 Best Completion Times</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #efebe9', paddingBottom: '4px' }}>
              <strong>Easy (5-6x)</strong>
              <span>{stats.bestTimes.easy ? formatTime(stats.bestTimes.easy) : '--:--'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #efebe9', paddingBottom: '4px' }}>
              <strong>Medium (7x)</strong>
              <span>{stats.bestTimes.medium ? formatTime(stats.bestTimes.medium) : '--:--'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #efebe9', paddingBottom: '4px' }}>
              <strong>Hard (8x)</strong>
              <span>{stats.bestTimes.hard ? formatTime(stats.bestTimes.hard) : '--:--'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #efebe9', paddingBottom: '4px' }}>
              <strong>Expert (9x)</strong>
              <span>{stats.bestTimes.expert ? formatTime(stats.bestTimes.expert) : '--:--'}</span>
            </div>
          </div>
        </div>

        <button 
          className="btn-secondary"
          style={{ fontSize: '14px', padding: '8px' }}
          onClick={() => {
            if (window.confirm("Are you sure you want to reset your statistics?")) {
              audio.playClick();
              onResetStats();
            }
          }}
        >
          Reset Statistics
        </button>
      </div>

      <div style={{ height: '40px' }}></div>
    </div>
  );
};
