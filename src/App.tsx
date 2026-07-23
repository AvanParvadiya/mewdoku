import React, { useState, useEffect, useRef } from 'react';
import { generatePuzzle, solvePuzzle, Position, Puzzle } from './utils/gameLogic';
import { audio } from './utils/AudioEngine';
import { Tutorial } from './components/Tutorial';
import { Board3D } from './components/Board3D';

// Capacitor orientation locking
import { ScreenOrientation } from '@capacitor/screen-orientation';

type ScreenType = 'home' | 'difficulty' | 'game' | 'stats' | 'tutorial';
type CellValue = null | 'X' | 'CAT';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTimes: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
    expert: number | null;
    master: number | null;
  };
}

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('home');
  const [difficulty, setDifficulty] = useState<Puzzle['difficulty']>('medium');
  const [boardSize, setBoardSize] = useState<number>(6);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  
  // Game state
  const [grid, setGrid] = useState<CellValue[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [inputMode, setInputMode] = useState<'CAT' | 'X'>('CAT');
  const [history, setHistory] = useState<CellValue[][][]>([]);
  
  // Modals
  const [isPaused, setIsPaused] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Sound settings
  const [isMuted, setIsMuted] = useState(false);

  // Animations/Visuals
  const [errorCell, setErrorCell] = useState<Position | null>(null);
  const [hintUsedCount, setHintUsedCount] = useState(0);

  // Statistics
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    bestTimes: { easy: null, medium: null, hard: null, expert: null, master: null }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load stats on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('mewdoku_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error(e);
      }
    }

    const savedMuted = localStorage.getItem('mewdoku_muted');
    if (savedMuted === 'true') {
      setIsMuted(true);
      audio.setMuted(true);
    }

    // Try locking screen orientation to portrait using Capacitor
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
        console.log("Screen orientation locked to Portrait");
      } catch (err) {
        // Fallback/No-op: screen-orientation plugin is only active inside device container
        console.log("Capacitor ScreenOrientation lock not available (Web browser/non-device environment)");
      }
    };
    lockOrientation();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && !isPaused && !isVictory && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, isPaused, isVictory, isGameOver]);

  // Save stats helper
  const saveStats = (updatedStats: GameStats) => {
    setStats(updatedStats);
    localStorage.setItem('mewdoku_stats', JSON.stringify(updatedStats));
  };

  // Start new game
  const startNewGame = (size: number) => {
    audio.playClick();
    setBoardSize(size);
    
    // Determine difficulty label
    let diff: Puzzle['difficulty'] = 'medium';
    if (size === 5 || size === 6) diff = 'easy';
    else if (size === 7) diff = 'medium';
    else if (size === 8) diff = 'hard';
    else if (size === 9) diff = 'expert';
    setDifficulty(diff);

    // Generate puzzle
    const generated = generatePuzzle(size);
    setPuzzle(generated);

    // Initialize grid
    const emptyGrid = Array.from({ length: size }, () => Array(size).fill(null));
    setGrid(emptyGrid);
    
    // Reset state
    setMistakes(0);
    setTimer(0);
    setHistory([]);
    setHintUsedCount(0);
    setIsPaused(false);
    setIsVictory(false);
    setIsGameOver(false);
    setIsTimerActive(true);
    setInputMode('CAT');
    
    // Play meow when starting a game
    audio.playMeow();
    setScreen('game');

    // Increment games played
    const updatedStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1
    };
    saveStats(updatedStats);
  };

  // Click handler for grid cells
  const handleCellClick = (r: number, c: number) => {
    if (isVictory || isGameOver || isPaused || !puzzle) return;
    
    // Audio feedback
    audio.playClick();

    const currentValue = grid[r][c];

    // Push current to history for undo
    const gridCopy = grid.map(row => [...row]);
    setHistory(prev => [...prev, gridCopy]);

    // Perform action based on mode
    if (inputMode === 'CAT') {
      if (currentValue === 'CAT') {
        // Clear cat
        const newGrid = grid.map((rowArr, ri) => 
          rowArr.map((cellVal, ci) => (ri === r && ci === c ? null : cellVal))
        );
        setGrid(newGrid);
      } else {
        // User is placing a cat. Verify against unique solution.
        const isSolutionCat = puzzle.solution.some(pos => pos.row === r && pos.col === c);
        
        if (isSolutionCat) {
          // CORRECT Placement
          const newGrid = grid.map((rowArr, ri) => 
            rowArr.map((cellVal, ci) => (ri === r && ci === c ? 'CAT' : cellVal))
          );
          
          // Auto-fill X in the same row, col, and surrounding cells
          // since a cat blocks row, column, and adjacent cells!
          // This is a premium UX helper.
          const autoFilledGrid = newGrid.map((rowArr, ri) => 
            rowArr.map((cellVal, ci) => {
              if (ri === r && ci === c) return 'CAT';
              
              // If cell already has something, keep it
              if (cellVal !== null) return cellVal;

              // Row or Col matches
              const inRowCol = (ri === r || ci === c);
              // Surrounding 8 cells touch
              const touches = (Math.abs(ri - r) <= 1 && Math.abs(ci - c) <= 1);
              
              if (inRowCol || touches) {
                return 'X';
              }
              return cellVal;
            })
          );

          setGrid(autoFilledGrid);
          audio.playCorrect();
          
          // Check win condition
          checkWinCondition(autoFilledGrid);
        } else {
          // INCORRECT Placement (Mistake)
          setErrorCell({ row: r, col: c });
          audio.playError();
          
          // Shake animation active for 350ms, then deduct heart and place X
          setTimeout(() => {
            setErrorCell(null);
            setMistakes(prev => {
              const nextMistakes = prev + 1;
              if (nextMistakes >= 3) {
                setIsGameOver(true);
                setIsTimerActive(false);
              }
              return nextMistakes;
            });
            
            // Mark cell with X since there cannot be a cat there
            setGrid(prevGrid => 
              prevGrid.map((rowArr, ri) => 
                rowArr.map((cellVal, ci) => (ri === r && ci === c ? 'X' : cellVal))
              )
            );
          }, 350);
        }
      }
    } else {
      // X-MARK MODE
      if (currentValue === 'CAT') {
        // Cannot overwrite correct cats directly unless intentional, but let's clear it
        const newGrid = grid.map((rowArr, ri) => 
          rowArr.map((cellVal, ci) => (ri === r && ci === c ? null : cellVal))
        );
        setGrid(newGrid);
      } else if (currentValue === 'X') {
        // Clear X
        const newGrid = grid.map((rowArr, ri) => 
          rowArr.map((cellVal, ci) => (ri === r && ci === c ? null : cellVal))
        );
        setGrid(newGrid);
      } else {
        // Place X
        const newGrid = grid.map((rowArr, ri) => 
          rowArr.map((cellVal, ci) => (ri === r && ci === c ? 'X' : cellVal))
        );
        setGrid(newGrid);
      }
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0 || isVictory || isGameOver || isPaused) return;
    audio.playClick();
    const prevGrid = history[history.length - 1];
    setGrid(prevGrid);
    setHistory(prev => prev.slice(0, -1));
  };

  // Hint helper
  const handleUseHint = () => {
    if (isVictory || isGameOver || isPaused || !puzzle) return;
    audio.playClick();

    // Find a cat in the solution that is not currently placed in the grid
    const unplacedCats = puzzle.solution.filter(pos => grid[pos.row][pos.col] !== 'CAT');
    
    if (unplacedCats.length > 0) {
      // Pick a random unplaced cat and place it
      const randomCat = unplacedCats[Math.floor(Math.random() * unplacedCats.length)];
      const r = randomCat.row;
      const c = randomCat.col;

      // Push history
      const gridCopy = grid.map(row => [...row]);
      setHistory(prev => [...prev, gridCopy]);

      const newGrid = grid.map((rowArr, ri) => 
        rowArr.map((cellVal, ci) => (ri === r && ci === c ? 'CAT' : cellVal))
      );

      // Auto-fill X around this cat as well
      const autoFilledGrid = newGrid.map((rowArr, ri) => 
        rowArr.map((cellVal, ci) => {
          if (ri === r && ci === c) return 'CAT';
          if (cellVal !== null) return cellVal;
          const inRowCol = (ri === r || ci === c);
          const touches = (Math.abs(ri - r) <= 1 && Math.abs(ci - c) <= 1);
          if (inRowCol || touches) return 'X';
          return cellVal;
        })
      );

      setGrid(autoFilledGrid);
      setHintUsedCount(prev => prev + 1);
      audio.playCorrect();
      checkWinCondition(autoFilledGrid);
    }
  };

  // Check if grid matches victory state
  const checkWinCondition = (currentGrid: CellValue[][]) => {
    if (!puzzle) return;
    
    // Count placed cats
    let placedCatCount = 0;
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (currentGrid[r][c] === 'CAT') {
          placedCatCount++;
        }
      }
    }

    // Since we validate instantly, if placedCatCount matches boardSize, they won!
    if (placedCatCount === boardSize) {
      setIsVictory(true);
      setIsTimerActive(false);
      audio.playWin();

      // Update statistics
      const diffKey = difficulty;
      const currentBest = stats.bestTimes[diffKey];
      const isNewBest = currentBest === null || timer < currentBest;
      
      const newBestTimes = { ...stats.bestTimes };
      if (isNewBest) {
        newBestTimes[diffKey] = timer;
      }

      const updatedStats = {
        ...stats,
        gamesWon: stats.gamesWon + 1,
        bestTimes: newBestTimes
      };
      saveStats(updatedStats);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.setMuted(nextMuted);
    localStorage.setItem('mewdoku_muted', String(nextMuted));
    audio.playClick();
  };

  // Get thick borders for cells separating regions
  const getCellBorders = (r: number, c: number) => {
    if (!puzzle) return '';
    const size = boardSize;
    const currentRegion = puzzle.regions[r][c];
    let borderClass = '';

    // Top
    if (r === 0) borderClass += ' border-t';
    else if (puzzle.regions[r - 1][c] !== currentRegion) borderClass += ' border-t';
    else borderClass += ' border-t-thin';

    // Bottom
    if (r === size - 1) borderClass += ' border-b';
    else if (puzzle.regions[r + 1][c] !== currentRegion) borderClass += ' border-b';
    else borderClass += ' border-b-thin';

    // Left
    if (c === 0) borderClass += ' border-l';
    else if (puzzle.regions[r][c - 1] !== currentRegion) borderClass += ' border-l';
    else borderClass += ' border-l-thin';

    // Right
    if (c === size - 1) borderClass += ' border-r';
    else if (puzzle.regions[r][c + 1] !== currentRegion) borderClass += ' border-r';
    else borderClass += ' border-r-thin';

    return borderClass;
  };

  // Format timer into MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset current puzzle board to start over
  const resetCurrentGame = () => {
    audio.playClick();
    if (!puzzle) return;
    const emptyGrid = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    setGrid(emptyGrid);
    setMistakes(0);
    setTimer(0);
    setHistory([]);
    setIsPaused(false);
    setIsVictory(false);
    setIsGameOver(false);
    setIsTimerActive(true);
  };

  return (
    <div className="app-container">
      {/* Decorative sakura petals */}
      <div className="decorations">
        <div className="petal" style={{ left: '10%', animationDelay: '0s', animationDuration: '8s' }}></div>
        <div className="petal" style={{ left: '30%', animationDelay: '2s', animationDuration: '11s' }}></div>
        <div className="petal" style={{ left: '55%', animationDelay: '1s', animationDuration: '9s' }}></div>
        <div className="petal" style={{ left: '75%', animationDelay: '4s', animationDuration: '12s' }}></div>
        <div className="petal" style={{ left: '90%', animationDelay: '3s', animationDuration: '10s' }}></div>
      </div>

      {/* 1. HOME SCREEN */}
      {screen === 'home' && (
        <div className="screen">
          <div className="title-container">
            <div className="logo-cat">🐱</div>
            <h1 className="app-title">
              <span>Mew</span>
              <span>Doku</span>
            </h1>
            <p className="app-subtitle">Cozy Cat Logic Puzzles</p>
          </div>

          <div className="menu-options">
            <button className="btn-primary" onClick={() => setScreen('difficulty')}>
              Play Game 🐾
            </button>
            <button className="btn-secondary" onClick={() => setScreen('tutorial')}>
              How to Play
            </button>
            <button className="btn-secondary" onClick={() => setScreen('stats')}>
              Statistics
            </button>
            <button 
              className="btn-action" 
              onClick={toggleMute} 
              style={{ marginTop: '8px', fontSize: '15px' }}
            >
              {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
            </button>
          </div>
        </div>
      )}

      {/* 2. DIFFICULTY SELECT SCREEN */}
      {screen === 'difficulty' && (
        <div className="screen" style={{ padding: '20px 0' }}>
          <div style={{ width: '100%' }}>
            <button className="header-btn" onClick={() => { audio.playClick(); setScreen('home'); }}>
              🏠 Menu
            </button>
            <h2 className="app-title" style={{ fontSize: '32px', margin: '20px 0 10px 0' }}>Select Board</h2>
          </div>

          <div className="difficulty-selector">
            <div className="difficulty-card" onClick={() => startNewGame(5)}>
              <div className="difficulty-info">
                <span className="difficulty-name">Easy 🐾</span>
                <span className="difficulty-desc">5x5 grid - perfect for beginners</span>
              </div>
              <span className="difficulty-star">⭐</span>
            </div>
            
            <div className="difficulty-card" onClick={() => startNewGame(6)}>
              <div className="difficulty-info">
                <span className="difficulty-name">Medium 🐾</span>
                <span className="difficulty-desc">6x6 grid - casual logic fun</span>
              </div>
              <span className="difficulty-star">⭐⭐</span>
            </div>

            <div className="difficulty-card" onClick={() => startNewGame(7)}>
              <div className="difficulty-info">
                <span className="difficulty-name">Hard 🐾</span>
                <span className="difficulty-desc">7x7 grid - deeper logic required</span>
              </div>
              <span className="difficulty-star">⭐⭐⭐</span>
            </div>

            <div className="difficulty-card" onClick={() => startNewGame(8)}>
              <div className="difficulty-info">
                <span className="difficulty-name">Expert 🐾</span>
                <span className="difficulty-desc">8x8 grid - a purr-fect challenge</span>
              </div>
              <span className="difficulty-star">⭐⭐⭐⭐</span>
            </div>

            <div className="difficulty-card" onClick={() => startNewGame(9)}>
              <div className="difficulty-info">
                <span className="difficulty-name">Master 🐾</span>
                <span className="difficulty-desc">9x9 grid - true cat master class</span>
              </div>
              <span className="difficulty-star">👑</span>
            </div>
          </div>

          <div style={{ height: '40px' }}></div>
        </div>
      )}

      {/* 3. GAME SCREEN */}
      {screen === 'game' && puzzle && (
        <div className="screen">
          <div className="game-header">
            <button className="header-btn" onClick={() => { audio.playClick(); setScreen('home'); }}>
              🏠 Menu
            </button>
            
            <div className="timer-badge">
              ⏱️ {formatTime(timer)}
            </div>

            <div className="hearts-container">
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

          {/* Grid Board (3D WebGL rendered via PlayCanvas) */}
          <div className="board-container">
            <Board3D
              size={boardSize}
              regions={puzzle.regions}
              grid={grid}
              onCellClick={handleCellClick}
              errorCell={errorCell}
            />
          </div>

          {/* Footer UI: Mode Switch & Undo/Hint Buttons */}
          <div className="game-footer">
            <div className="input-modes">
              <button 
                className={`mode-btn ${inputMode === 'CAT' ? 'active' : ''}`}
                onClick={() => { audio.playClick(); setInputMode('CAT'); }}
              >
                🐱 Place Cat
              </button>
              <button 
                className={`mode-btn ${inputMode === 'X' ? 'active' : ''}`}
                onClick={() => { audio.playClick(); setInputMode('X'); }}
              >
                ❌ Mark 'X'
              </button>
            </div>

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
          {isPaused && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 className="modal-title">Game Paused 💤</h3>
                <p className="modal-body">Take your time. The cats are napping.</p>
                <div className="modal-buttons">
                  <button className="btn-primary" onClick={() => { audio.playClick(); setIsPaused(false); }}>
                    Resume Game
                  </button>
                  <button className="btn-secondary" onClick={resetCurrentGame}>
                    Restart Puzzle
                  </button>
                  <button 
                    className="btn-action" 
                    onClick={() => { audio.playClick(); setScreen('home'); }}
                    style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                  >
                    Exit to Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Victory Modal */}
          {isVictory && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 className="modal-title" style={{ fontSize: '32px' }}>Purr-fect! 🎉</h3>
                <p className="modal-body" style={{ fontSize: '16px' }}>
                  You solved the puzzle in <strong>{formatTime(timer)}</strong>!<br />
                  {hintUsedCount > 0 && <span>(Used {hintUsedCount} hint{hintUsedCount > 1 ? 's' : ''})</span>}
                </p>
                <div className="modal-buttons">
                  <button className="btn-primary" onClick={() => startNewGame(boardSize)}>
                    Next Puzzle 🐾
                  </button>
                  <button className="btn-secondary" onClick={() => setScreen('home')}>
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {isGameOver && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 className="modal-title">No More Hearts 💔</h3>
                <p className="modal-body">Don't worry, even cats make mistakes. Want to try again?</p>
                <div className="modal-buttons">
                  <button className="btn-primary" onClick={resetCurrentGame}>
                    Retry Puzzle
                  </button>
                  <button className="btn-secondary" onClick={() => startNewGame(boardSize)}>
                    New Board
                  </button>
                  <button 
                    className="btn-action" 
                    onClick={() => setScreen('home')}
                    style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                  >
                    Exit to Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. STATISTICS SCREEN */}
      {screen === 'stats' && (
        <div className="screen" style={{ padding: '20px 0' }}>
          <div style={{ width: '100%' }}>
            <button className="header-btn" onClick={() => { audio.playClick(); setScreen('home'); }}>
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
                  saveStats({
                    gamesPlayed: 0,
                    gamesWon: 0,
                    bestTimes: { easy: null, medium: null, hard: null, expert: null, master: null }
                  });
                }
              }}
            >
              Reset Statistics
            </button>
          </div>

          <div style={{ height: '40px' }}></div>
        </div>
      )}

      {/* 5. INTERACTIVE TUTORIAL SCREEN */}
      {screen === 'tutorial' && (
        <Tutorial onClose={() => setScreen('home')} />
      )}
    </div>
  );
}
