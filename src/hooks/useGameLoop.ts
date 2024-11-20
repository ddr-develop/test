import { useEffect, useRef } from 'react';
import { GameObject, Heart, Enemy } from '../types';

interface GameState {
  score: number;
  gameOver: boolean;
  beePosition: { x: number; y: number };
  hearts: Heart[];
  enemies: Enemy[];
}

interface GameActions {
  setScore: (score: number) => void;
  setGameOver: (gameOver: boolean) => void;
  setBeePosition: (position: { x: number; y: number }) => void;
  setHearts: (hearts: Heart[]) => void;
  setEnemies: (enemies: Enemy[]) => void;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BEE_SPEED = 5;
const HEART_SPEED = 6;
const ENEMY_SPAWN_RATE = 1.5;

export function useGameLoop(gameState: GameState, actions: GameActions) {
  const gameLoopRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());
  const lastShot = useRef<number>(0);
  const frameCount = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.delete(e.key);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      // Disparar si toca en la parte superior de la pantalla
      if (touchY < GAME_HEIGHT / 3) {
        keysPressed.current.add(' ');
      } else {
        // Movimiento basado en la posición inicial del toque
        const beeX = gameState.beePosition.x;
        const beeY = gameState.beePosition.y;

        if (touchX < beeX) keysPressed.current.add('ArrowLeft');
        if (touchX > beeX + 48) keysPressed.current.add('ArrowRight');
        if (touchY < beeY) keysPressed.current.add('ArrowUp');
        if (touchY > beeY + 48) keysPressed.current.add('ArrowDown');
      }
    };

    const handleTouchEnd = () => {
      keysPressed.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState.beePosition]);

  useEffect(() => {
    const animate = () => {
      if (!gameState.gameOver) {
        frameCount.current += 1;
        updateBeePosition();
        updateHearts();
        updateEnemies();
        checkCollisions();

        if (frameCount.current % 60 === 0) {
          spawnEnemies();
        }

        gameLoopRef.current = requestAnimationFrame(animate);
      }
    };

    if (!gameState.gameOver) {
      gameLoopRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameOver]);

  const updateBeePosition = () => {
    let { x, y } = gameState.beePosition;

    if (keysPressed.current.has('ArrowLeft')) x -= BEE_SPEED;
    if (keysPressed.current.has('ArrowRight')) x += BEE_SPEED;
    if (keysPressed.current.has('ArrowUp')) y -= BEE_SPEED;
    if (keysPressed.current.has('ArrowDown')) y += BEE_SPEED;

    x = Math.max(0, Math.min(GAME_WIDTH - 48, x));
    y = Math.max(0, Math.min(GAME_HEIGHT - 48, y));

    if (x !== gameState.beePosition.x || y !== gameState.beePosition.y) {
      actions.setBeePosition({ x, y });
    }

    if (keysPressed.current.has(' ')) {
      const now = Date.now();
      if (now - lastShot.current > 250) {
        shootHeart();
        lastShot.current = now;
      }
    }
  };

  const shootHeart = () => {
    const newHeart: Heart = {
      x: gameState.beePosition.x + 24,
      y: gameState.beePosition.y,
      width: 20,
      height: 20,
      active: true,
    };
    actions.setHearts([...gameState.hearts, newHeart]);
  };

  const updateHearts = () => {
    const updatedHearts = gameState.hearts
      .map((heart) => ({
        ...heart,
        y: heart.y - HEART_SPEED,
      }))
      .filter((heart) => heart.y > -20);

    actions.setHearts(updatedHearts);
  };

  const spawnEnemies = () => {
    if (Math.random() < ENEMY_SPAWN_RATE) {
      const newEnemy: Enemy = {
        x: Math.random() * (GAME_WIDTH - 40),
        y: -40,
        width: 40,
        height: 40,
        active: true,
        speed: 2 + Math.random(),
      };
      actions.setEnemies([...gameState.enemies, newEnemy]);
    }
  };

  const updateEnemies = () => {
    const updatedEnemies = gameState.enemies
      .map((enemy) => ({
        ...enemy,
        y: enemy.y + enemy.speed,
      }))
      .filter((enemy) => {
        if (enemy.y > GAME_HEIGHT) {
          actions.setGameOver(true);
          return false;
        }
        return enemy.active;
      });

    actions.setEnemies(updatedEnemies);
  };

  const checkCollisions = () => {
    let scoreIncrease = 0;
    const updatedHearts = [...gameState.hearts];
    const updatedEnemies = [...gameState.enemies];

    updatedHearts.forEach((heart, heartIndex) => {
      if (heart.active) {
        updatedEnemies.forEach((enemy, enemyIndex) => {
          if (
            enemy.active &&
            heart.x < enemy.x + enemy.width &&
            heart.x + heart.width > enemy.x &&
            heart.y < enemy.y + enemy.height &&
            heart.y + heart.height > enemy.y
          ) {
            updatedHearts[heartIndex].active = false;
            updatedEnemies[enemyIndex].active = false;
            scoreIncrease += 100;
          }
        });
      }
    });

    if (scoreIncrease > 0) {
      actions.setScore(gameState.score + scoreIncrease);
      actions.setHearts(updatedHearts);
      actions.setEnemies(updatedEnemies);
    }
  };

  return { GAME_WIDTH, GAME_HEIGHT };
}
