import React from 'react';
import { Heart as HeartIcon } from 'lucide-react';
import { GameObject } from '../types';

interface HeartProps {
  heart: GameObject & { active: boolean };
}

export function Heart({ heart }: HeartProps) {
  if (!heart.active) return null;

  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${heart.x}px, ${heart.y}px)`,
      }}
    >
      <HeartIcon className="w-5 h-5 text-red-500" fill="red" />
    </div>
  );
}