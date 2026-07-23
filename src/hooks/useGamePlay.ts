import { useState, useEffect, useRef } from 'react';
import { generatePuzzle, Puzzle, Position } from '../utils/gameLogic';
import { audio } from '../utils/AudioEngine';
import { ScreenType, CellValue, GameStats } from '../types/game';

export function useGamePlay() {
  const [screen, setScreen] = useState<ScreenType>('home');
  const [difficulty, setDifficulty] = useState<Puzzle['difficulty']>('medium');
  const [boardSize, setBoardSize] = useState<number>(6);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  
  // Game state
  const [grid, setGrid] = useState<CellValue[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
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

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickRef = useRef<{ row: number; col: number; timestamp: number } | null>(null);

  // Timer state & refs
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Tick Effect
  useEffect(() => {
    if (isTimerActive && !isPaused && !isVictory && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerActive, isPaused, isVictory, isGameOver]);

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

    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const saveStats = (updatedStats: GameStats) => {
    setStats(updatedStats);
    localStorage.setItem('mewdoku_stats', JSON.stringify(updatedStats));
  };

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
    
    audio.playMeow();
    setScreen('game');

    // Increment games played
    const updatedStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1
    };
    saveStats(updatedStats);
  };

  // Click handler for grid cells: Decides between single click (X) and double click (CAT)
  const handleCellClick = (r: number, c: number) => {
    if (isVictory || isGameOver || isPaused || !puzzle) return;

    const now = Date.now();
    const lastClick = lastClickRef.current;

    // Detect double click (within 260ms on the same cell)
    if (lastClick && lastClick.row === r && lastClick.col === c && (now - lastClick.timestamp) < 260) {
      // Clear active single click timer
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickRef.current = null;
      handleCellDoubleClick(r, c);
    } else {
      // Record this click and schedule single click check
      lastClickRef.current = { row: r, col: c, timestamp: now };
      
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      clickTimeoutRef.current = setTimeout(() => {
        handleCellSingleClick(r, c);
        lastClickRef.current = null;
        clickTimeoutRef.current = null;
      }, 260);
    }
  };

  // Single Click: Place/Toggle "X"
  const handleCellSingleClick = (r: number, c: number) => {
    if (isVictory || isGameOver || isPaused || !puzzle) return;
    
    audio.playClick();
    const currentValue = grid[r][c];

    // Push current grid to history for undo
    const gridCopy = grid.map(row => [...row]);
    setHistory(prev => [...prev, gridCopy]);

    let newGrid;
    if (currentValue === 'X' || currentValue === 'CAT') {
      // Clear cell if already marked
      newGrid = grid.map((rowArr, ri) => 
        rowArr.map((cellVal, ci) => (ri === r && ci === c ? null : cellVal))
      );
    } else {
      // Mark as X
      newGrid = grid.map((rowArr, ri) => 
        rowArr.map((cellVal, ci) => (ri === r && ci === c ? 'X' : cellVal))
      );
    }
    setGrid(newGrid);
  };

  // Double Click: Place/Toggle "CAT" (validates against the unique solution)
  const handleCellDoubleClick = (r: number, c: number) => {
    if (isVictory || isGameOver || isPaused || !puzzle) return;

    audio.playClick();
    const currentValue = grid[r][c];

    // Push current grid to history for undo
    const gridCopy = grid.map(row => [...row]);
    setHistory(prev => [...prev, gridCopy]);

    if (currentValue === 'CAT') {
      // Clear cat
      const newGrid = grid.map((rowArr, ri) => 
        rowArr.map((cellVal, ci) => (ri === r && ci === c ? null : cellVal))
      );
      setGrid(newGrid);
    } else {
      // Verify placement against the solution
      const isSolutionCat = puzzle.solution.some(pos => pos.row === r && pos.col === c);
      
      if (isSolutionCat) {
        // Correct placement
        const newGrid = grid.map((rowArr, ri) => 
          rowArr.map((cellVal, ci) => (ri === r && ci === c ? 'CAT' : cellVal))
        );

        setGrid(newGrid);
        audio.playCorrect();
        checkWinCondition(newGrid);
      } else {
        // Incorrect placement (Mistake)
        setErrorCell({ row: r, col: c });
        audio.playError();
        
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
          
          // Mark with X since a cat is impossible here
          setGrid(prevGrid => 
            prevGrid.map((rowArr, ri) => 
              rowArr.map((cellVal, ci) => (ri === r && ci === c ? 'X' : cellVal))
            )
          );
        }, 350);
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

      setGrid(newGrid);
      setHintUsedCount(prev => prev + 1);
      audio.playCorrect();
      checkWinCondition(newGrid);
    }
  };

  // Check if grid matches victory state
  const checkWinCondition = (currentGrid: CellValue[][]) => {
    if (!puzzle) return;
    
    // Check if every solution cat is placed in the grid
    const allCatsPlaced = puzzle.solution.every(pos => currentGrid[pos.row] && currentGrid[pos.row][pos.col] === 'CAT');

    if (allCatsPlaced) {
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

  // Helper to count placed cats
  const getPlacedCatsCount = () => {
    let count = 0;
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (grid[r] && grid[r][c] === 'CAT') count++;
      }
    }
    return count;
  };

  // Helper to check completed rows/columns/regions count
  const getGameProgress = () => {
    const catsCount = getPlacedCatsCount();
    
    // Rows completed
    let rowsDone = 0;
    for (let r = 0; r < boardSize; r++) {
      if (grid[r] && grid[r].includes('CAT')) rowsDone++;
    }

    // Columns completed
    let colsDone = 0;
    for (let c = 0; c < boardSize; c++) {
      let hasCat = false;
      for (let r = 0; r < boardSize; r++) {
        if (grid[r] && grid[r][c] === 'CAT') {
          hasCat = true;
          break;
        }
      }
      if (hasCat) colsDone++;
    }

    return {
      catsCount,
      rowsDone,
      colsDone,
      regionsDone: catsCount,
    };
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
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
  };
}
