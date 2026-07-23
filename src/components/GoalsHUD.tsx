import React from 'react';

interface GoalsHUDProps {
  catsCount: number;
  rowsDone: number;
  colsDone: number;
  regionsDone: number;
  boardSize: number;
}

export const GoalsHUD: React.FC<GoalsHUDProps> = ({
  catsCount,
  rowsDone,
  colsDone,
  regionsDone,
  boardSize,
}) => {
  return (
    <div className="goals-hud-bar">
      <div className={`goal-hud-card ${catsCount === boardSize ? 'done' : ''}`}>
        <span className="goal-card-icon">🐱</span>
        <span className="goal-card-title">Cats</span>
        <span className="goal-card-value">{catsCount} / {boardSize}</span>
        <span className="goal-card-desc">Place all cats</span>
      </div>
      <div className={`goal-hud-card ${rowsDone === boardSize && colsDone === boardSize ? 'done' : ''}`}>
        <span className="goal-card-icon">↔️</span>
        <span className="goal-card-title">Rows & Cols</span>
        <span className="goal-card-value">{rowsDone} / {boardSize}</span>
        <span className="goal-card-desc">1 cat per line</span>
      </div>
      <div className={`goal-hud-card ${regionsDone === boardSize ? 'done' : ''}`}>
        <span className="goal-card-icon">🎨</span>
        <span className="goal-card-title">Colors</span>
        <span className="goal-card-value">{regionsDone} / {boardSize}</span>
        <span className="goal-card-desc">1 per territory</span>
      </div>
    </div>
  );
};
