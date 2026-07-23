import React, { useState } from 'react';
import { audio } from '../utils/AudioEngine';

interface TutorialProps {
  onClose: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      title: "🐾 Welcome to MewDoku!",
      text: "The cozy logic puzzle game about cats. The goal is to place exactly one cat in each row, column, and colored territory. Let's learn the rules!",
      grid: [
        [0, 0, 1, 1],
        [0, 2, 2, 1],
        [3, 2, 2, 4],
        [3, 3, 4, 4]
      ],
      highlightRegion: 2,
      cats: [],
      xMarks: []
    },
    {
      title: "🎨 1. Exclusive Territories",
      text: "Look at the colored sections on the board. You must place exactly ONE cat in each colored territory. No region can have zero or multiple cats.",
      grid: [
        [0, 0, 1, 1],
        [0, 2, 2, 1],
        [3, 2, 2, 4],
        [3, 3, 4, 4]
      ],
      highlightRegion: 0,
      cats: [{ r: 0, c: 1, label: "🐱" }],
      xMarks: [{ r: 0, c: 0 }, { r: 1, c: 0 }]
    },
    {
      title: "↔️ 2. Rows & Columns",
      text: "Cats need their space! Each horizontal row and each vertical column must contain exactly ONE cat. Placing a cat blocks the rest of its row and column.",
      grid: [
        [0, 0, 1, 1],
        [0, 2, 2, 1],
        [3, 2, 2, 4],
        [3, 3, 4, 4]
      ],
      highlightRow: 0,
      highlightCol: 1,
      cats: [{ r: 0, c: 1, label: "🐱" }],
      xMarks: [
        { r: 0, c: 0 }, { r: 0, c: 2 }, { r: 0, c: 3 }, // row
        { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }  // col
      ]
    },
    {
      title: "🚫 3. The 'Aloof' Rule",
      text: "Cats cannot touch each other, not even diagonally! If you place a cat, all 8 surrounding cells are blocked. You cannot place another cat there.",
      grid: [
        [0, 0, 1, 1],
        [0, 2, 2, 1],
        [3, 2, 2, 4],
        [3, 3, 4, 4]
      ],
      cats: [{ r: 1, c: 2, label: "🐱" }],
      xMarks: [
        { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
        { r: 1, c: 1 },                  { r: 1, c: 3 },
        { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }
      ]
    },
    {
      title: "❌ 4. Mark Your Board",
      text: "Since a cat blocks adjacent cells and its row/column, use 'X' to mark squares where a cat CANNOT go. Once you cross out all impossible cells, the answer becomes obvious!",
      grid: [
        [0, 0, 1, 1],
        [0, 2, 2, 1],
        [3, 2, 2, 4],
        [3, 3, 4, 4]
      ],
      cats: [
        { r: 0, c: 1, label: "🐱" },
        { r: 1, c: 3, label: "🐱" }
      ],
      xMarks: [
        { r: 0, c: 0 }, { r: 0, c: 2 }, { r: 0, c: 3 },
        { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 },
        { r: 2, c: 0 }, { r: 2, c: 2 }, { r: 2, c: 3 },
        { r: 3, c: 2 }
      ]
    }
  ];

  const currentStepData = tutorialSteps[step];

  const handleNext = () => {
    audio.playClick();
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    audio.playClick();
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Helper to determine border styles for cell (4x4)
  const getCellBorders = (r: number, c: number) => {
    const grid = currentStepData.grid;
    const region = grid[r][c];
    let borderClass = '';

    // Top border
    if (r === 0) borderClass += ' border-t';
    else if (grid[r - 1][c] !== region) borderClass += ' border-t';
    else borderClass += ' border-t-thin';

    // Bottom border
    if (r === 3) borderClass += ' border-b';
    else if (grid[r + 1][c] !== region) borderClass += ' border-b';
    else borderClass += ' border-b-thin';

    // Left border
    if (c === 0) borderClass += ' border-l';
    else if (grid[r][c - 1] !== region) borderClass += ' border-l';
    else borderClass += ' border-l-thin';

    // Right border
    if (c === 3) borderClass += ' border-r';
    else if (grid[r][c + 1] !== region) borderClass += ' border-r';
    else borderClass += ' border-r-thin';

    return borderClass;
  };

  return (
    <div className="screen" style={{ padding: '20px 0' }}>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <h2 className="modal-title" style={{ color: 'var(--text-main)' }}>{currentStepData.title}</h2>
      </div>

      <div className="board-container" style={{ width: '100%', maxWidth: '280px' }}>
        <div className="board" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' }}>
          {currentStepData.grid.map((rowArr, r) =>
            rowArr.map((regionId, c) => {
              const borderClass = getCellBorders(r, c);
              const isRegionHighlighted = currentStepData.highlightRegion === regionId;
              const isRowHighlighted = currentStepData.highlightRow === r;
              const isColHighlighted = currentStepData.highlightCol === c;

              // Check if contains cat or X
              const cat = currentStepData.cats.find(item => item.r === r && item.c === c);
              const xMark = currentStepData.xMarks.find(item => item.r === r && item.c === c);

              let style: React.CSSProperties = {};
              if (isRegionHighlighted) {
                style = { filter: 'brightness(1.08) saturate(1.2)', transform: 'scale(1.02)', zIndex: 1 };
              } else if (isRowHighlighted || isColHighlighted) {
                style = { filter: 'brightness(0.95)' };
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`cell cell-region-${regionId} ${borderClass}`}
                  style={style}
                >
                  {cat && <span className="cell-content cell-cat">{cat.label}</span>}
                  {xMark && <span className="cell-content cell-x">❌</span>}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="tutorial-instruction-box">
        <p>{currentStepData.text}</p>
        <div className="tutorial-step-dots">
          {tutorialSteps.map((_, idx) => (
            <div
              key={idx}
              className={`step-dot ${idx === step ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="modal-buttons" style={{ width: '100%', maxWidth: '280px' }}>
        <button className="btn-primary" onClick={handleNext}>
          {step === tutorialSteps.length - 1 ? "Let's Play! 🐾" : "Next Rule 🐾"}
        </button>
        {step > 0 && (
          <button className="btn-secondary" onClick={handlePrev}>
            Previous
          </button>
        )}
        <button
          className="btn-action"
          style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
          onClick={() => {
            audio.playClick();
            onClose();
          }}
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
};
