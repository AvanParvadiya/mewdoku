export type ScreenType = 'home' | 'difficulty' | 'game' | 'stats' | 'tutorial';
export type CellValue = null | 'X' | 'CAT';

export interface GameStats {
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
