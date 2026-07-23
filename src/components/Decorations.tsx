import React from 'react';

const petalConfigs = [
  { left: '10%', delay: '0s', duration: '8s' },
  { left: '30%', delay: '2s', duration: '11s' },
  { left: '55%', delay: '1s', duration: '9s' },
  { left: '75%', delay: '4s', duration: '12s' },
  { left: '90%', delay: '3s', duration: '10s' },
];

export const Decorations: React.FC = () => {
  return (
    <div className="decorations">
      {petalConfigs.map((cfg, idx) => (
        <div
          key={idx}
          className="petal"
          style={{
            left: cfg.left,
            animationDelay: cfg.delay,
            animationDuration: cfg.duration
          }}
        ></div>
      ))}
    </div>
  );
};
