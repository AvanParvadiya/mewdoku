import React from 'react';
import { Puzzle, Position } from '../utils/gameLogic';
import { CellValue } from '../types/game';

interface GameBoardProps {
  puzzle: Puzzle;
  boardSize: number;
  grid: CellValue[][];
  errorCell: Position | null;
  onCellClick: (r: number, c: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  puzzle,
  boardSize,
  grid,
  errorCell,
  onCellClick,
}) => {
  // Get thick borders for cells separating regions
  const getCellBorders = (r: number, c: number) => {
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

  return (
    <div className="board-container">
      <div 
        className="board" 
        style={{ 
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`
        }}
      >
        {puzzle.regions.map((rowArr, r) =>
          rowArr.map((regionId, c) => {
            const borderClass = getCellBorders(r, c);
            const isError = errorCell?.row === r && errorCell?.col === c;
            const value = grid[r] ? grid[r][c] : null;

            return (
              <div
                key={`${r}-${c}`}
                className={`cell cell-region-${regionId} ${borderClass} ${isError ? 'cell-error' : ''}`}
                onClick={() => onCellClick(r, c)}
              >
                {isError && <span className="cell-content cell-crying">😭</span>}
                {!isError && value === 'CAT' && <span className="cell-content cell-cat">🐱</span>}
                {!isError && value === 'X' && <span className="cell-content cell-x">❌</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
