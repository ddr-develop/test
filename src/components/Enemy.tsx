import React from 'react';

interface EnemyProps {
  enemy: {
    x: number;
    y: number;
    active: boolean;
    speed: number;
  };
}

export function Enemy({ enemy }: EnemyProps) {
  if (!enemy.active) return null;

  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${enemy.x}px, ${enemy.y}px)`,
      }}
    >
      <div className="relative w-10 h-10">
        {/* Flower */}
        <div className="absolute inset-0">
          {/* Petals */}
          <div className="absolute w-4 h-4 bg-pink-400 rounded-full left-3 top-0 animate-pulse"></div>
          <div className="absolute w-4 h-4 bg-pink-400 rounded-full left-0 top-3"></div>
          <div className="absolute w-4 h-4 bg-pink-400 rounded-full right-0 top-3"></div>
          <div className="absolute w-4 h-4 bg-pink-400 rounded-full left-3 bottom-0"></div>
          {/* Center */}
          <div className="absolute w-4 h-4 bg-yellow-400 rounded-full left-3 top-3"></div>
        </div>
      </div>
    </div>
  );
}