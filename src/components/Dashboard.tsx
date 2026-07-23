import React, { useState } from 'react';
import { audio } from '../utils/AudioEngine';
import { GameStats } from '../types/game';
import { Tutorial } from './Tutorial';

interface MainDashboardProps {
  username: string;
  avatar: string;
  gamesWon: number;
  isMuted: boolean;
  onPlayDifficulty: (size: number) => void;
  onMuteToggle: () => void;
  onOpenProfile: () => void;
  stats: GameStats;
  onResetStats: () => void;
  formatTime: (s: number) => string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  username,
  avatar,
  gamesWon,
  isMuted,
  onPlayDifficulty,
  onMuteToggle,
  onOpenProfile,
  stats,
  onResetStats,
  formatTime,
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'rules' | 'stats'>('play');

  const handleTabChange = (tab: 'play' | 'rules' | 'stats') => {
    audio.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Play Tab: Profile + Difficulty Cards */}
        {activeTab === 'play' && (
          <div className="screen" style={{ padding: '10px 0' }}>
            {/* User Profile Widget */}
            <div className="home-profile-widget" onClick={onOpenProfile} title="Edit Profile" style={{ marginBottom: '20px' }}>
              <span className="profile-widget-avatar">{avatar}</span>
              <div className="profile-widget-details">
                <span className="profile-widget-name">{username}</span>
                <span className="profile-widget-rank">🐾 Cat Scout ({gamesWon} Wins)</span>
              </div>
              <span className="profile-widget-edit">✏️</span>
            </div>

            <div className="title-container" style={{ margin: '10px 0 20px 0' }}>
              <div className="logo-cat" style={{ fontSize: '48px', margin: '0' }}>🐱</div>
              <h1 className="app-title" style={{ fontSize: '36px', margin: '5px 0' }}>
                <span>Mew</span><span>Doku</span>
              </h1>
              <p className="app-subtitle" style={{ fontSize: '14px' }}>Cozy Cat Logic Puzzles</p>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-main)', marginBottom: '12px', textAlign: 'left', width: '100%', paddingLeft: '4px' }}>
              🎮 Select Board Size:
            </h3>

            <div className="difficulty-selector" style={{ width: '100%' }}>
              <div className="difficulty-card" onClick={() => onPlayDifficulty(5)}>
                <div className="difficulty-info">
                  <span className="difficulty-name">Easy 5x5</span>
                  <span className="difficulty-desc">Perfect for beginners</span>
                </div>
                <span className="difficulty-star">⭐</span>
              </div>

              <div className="difficulty-card" onClick={() => onPlayDifficulty(6)}>
                <div className="difficulty-info">
                  <span className="difficulty-name">Medium 6x6</span>
                  <span className="difficulty-desc">Casual logic fun</span>
                </div>
                <span className="difficulty-star">⭐⭐</span>
              </div>

              <div className="difficulty-card" onClick={() => onPlayDifficulty(7)}>
                <div className="difficulty-info">
                  <span className="difficulty-name">Hard 7x7</span>
                  <span className="difficulty-desc">Deeper logic puzzle</span>
                </div>
                <span className="difficulty-star">⭐⭐⭐</span>
              </div>

              <div className="difficulty-card" onClick={() => onPlayDifficulty(8)}>
                <div className="difficulty-info">
                  <span className="difficulty-name">Expert 8x8</span>
                  <span className="difficulty-desc">A purr-fect challenge</span>
                </div>
                <span className="difficulty-star">⭐⭐⭐⭐</span>
              </div>

              <div className="difficulty-card" onClick={() => onPlayDifficulty(9)}>
                <div className="difficulty-info">
                  <span className="difficulty-name">Master 9x9</span>
                  <span className="difficulty-desc">True cat master class</span>
                </div>
                <span className="difficulty-star">👑</span>
              </div>
            </div>
          </div>
        )}

        {/* Rules Tab: Embedded Onboarding Guide */}
        {activeTab === 'rules' && (
          <Tutorial onClose={() => setActiveTab('play')} />
        )}

        {/* Stats Tab: Player Completion and Settings */}
        {activeTab === 'stats' && (
          <div className="screen" style={{ padding: '10px 0' }}>
            <div className="title-container" style={{ margin: '10px 0 20px 0' }}>
              <h2 className="app-title" style={{ fontSize: '32px', margin: '0' }}>Player Records</h2>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

              {/* Quick Settings */}
              <div style={{ background: 'var(--panel-bg)', border: '2px solid var(--border-color)', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', textAlign: 'center', margin: '0 0 6px 0' }}>⚙️ Audio Settings</h4>
                <button className="btn-secondary" onClick={onMuteToggle} style={{ width: '100%' }}>
                  {isMuted ? '🔇 Unmute Game Sounds' : '🔊 Mute Game Sounds'}
                </button>
              </div>

              <button 
                className="btn-action"
                style={{ fontSize: '14px', padding: '10px', color: '#c62828', background: '#ffebee', border: '2px solid #ef9a9a', borderRadius: '16px' }}
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
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bottom-nav">
        <button 
          className={`bottom-nav-item ${activeTab === 'play' ? 'active' : ''}`}
          onClick={() => handleTabChange('play')}
        >
          <span className="bottom-nav-icon">🎮</span>
          <span>Play</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => handleTabChange('rules')}
        >
          <span className="bottom-nav-icon">📖</span>
          <span>Rules</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => handleTabChange('stats')}
        >
          <span className="bottom-nav-icon">📊</span>
          <span>Stats</span>
        </button>
      </div>
    </div>
  );
};
