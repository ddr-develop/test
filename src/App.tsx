import React, { useState } from 'react';
import { Bee } from './components/Bee';
import { Heart } from './components/Heart';
import { Enemy } from './components/Enemy';
import { useGameLoop } from './hooks/useGameLoop';
import type { Heart as HeartType, Enemy as EnemyType } from './types';

function App() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [beePosition, setBeePosition] = useState({ x: 300, y: 400 });
  const [hearts, setHearts] = useState<HeartType[]>([]);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);

  const gameState = { score, gameOver, beePosition, hearts, enemies };
  const actions = { setScore, setGameOver, setBeePosition, setHearts, setEnemies };

  const { GAME_WIDTH, GAME_HEIGHT } = useGameLoop(gameState, actions);

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setBeePosition({ x: 300, y: 400 });
    setHearts([]);
    setEnemies([]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-400">
      <div className="relative" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden border-4 border-yellow-400 rounded-lg bg-gradient-to-b from-sky-100 to-sky-200">
          {/* Score */}
          <div className="absolute text-2xl font-bold text-yellow-600 top-4 left-4">
            Score: {score}
          </div>

          <Bee position={beePosition} />

          {hearts.map((heart, index) => (
            <Heart key={index} heart={heart} />
          ))}

          {enemies.map((enemy, index) => (
            <Enemy key={index} enemy={enemy} />
          ))}

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="p-8 text-center bg-white rounded-lg">
                <h2 className="mb-4 text-3xl font-bold text-red-600">Game Over!</h2>
                <p className="mb-4 text-xl">Final Score: {score}</p>
                <button
                  onClick={restartGame}
                  className="px-4 py-2 font-bold text-white bg-yellow-400 rounded hover:bg-yellow-500"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute left-0 w-full text-center text-white -bottom-24">
          <p className="text-lg">
            Use arrow keys to move • Space to shoot hearts • Save the flowers!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;