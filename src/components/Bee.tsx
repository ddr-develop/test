import React from 'react';

interface BeeProps {
  position: { x: number; y: number };
}

export function Bee({ position }: BeeProps) {
  return (
    <div 
      className="absolute"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div className="relative w-12 h-12">
        {/* Body */}
        <div className="absolute w-10 h-10 bg-yellow-300 rounded-full left-1 top-1">
          {/* Stripes */}
          <div className="absolute w-full h-2 bg-black top-2 opacity-60"></div>
          <div className="absolute w-full h-2 bg-black top-5 opacity-60"></div>
          {/* Wings */}
          <div className="absolute -left-2 -top-1 w-6 h-6 bg-white rounded-full opacity-70 animate-[pulse_0.5s_ease-in-out_infinite]"></div>
          <div className="absolute -right-2 -top-1 w-6 h-6 bg-white rounded-full opacity-70 animate-[pulse_0.5s_ease-in-out_infinite]"></div>
          {/* Eyes */}
          <div className="absolute left-2 top-1 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute right-2 top-1 w-2 h-2 bg-black rounded-full"></div>
          {/* Smile */}
          <div className="absolute w-4 h-2 border-b-2 border-black rounded-full left-3 top-3"></div>
        </div>
      </div>
    </div>
  );
}