import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { storage } from '../../utils/storage';
import { Obstacle } from '../../types';

export const DinoRunner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => storage.getGameStats('dino').highScore || 0);
  const [soundEnabled, setSoundEnabled] = useState(() => storage.getPreferences().soundEnabled);

  // Game state
  const gameStateRef = useRef({
    dino: { x: 50, y: 150, velocityY: 0, isJumping: false },
    obstacles: [] as Obstacle[],
    score: 0,
    speed: 2,
    groundY: 180,
    lastObstacleX: 0
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 200;
  const DINO_WIDTH = 20;
  const DINO_HEIGHT = 20;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;

  // Sound effects (using Web Audio API)
  const playSound = useCallback((type: 'jump' | 'score' | 'gameOver') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'jump':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
        break;
      case 'score':
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        break;
      case 'gameOver':
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(75, audioContext.currentTime + 0.5);
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, [soundEnabled]);

  const jump = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.dino.isJumping && gameState === 'playing') {
      state.dino.velocityY = JUMP_FORCE;
      state.dino.isJumping = true;
      playSound('jump');
    }
  }, [gameState, playSound]);

  const generateObstacle = useCallback((): Obstacle => {
    const types: Array<'cactus' | 'bird'> = ['cactus', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      x: CANVAS_WIDTH + 100,
      y: type === 'bird' ? 130 : 160,
      width: type === 'bird' ? 15 : 10,
      height: type === 'bird' ? 10 : 20,
      type
    };
  }, []);

  const checkCollision = useCallback((dino: any, obstacle: Obstacle): boolean => {
    return (
      dino.x < obstacle.x + obstacle.width &&
      dino.x + DINO_WIDTH > obstacle.x &&
      dino.y < obstacle.y + obstacle.height &&
      dino.y + DINO_HEIGHT > obstacle.y
    );
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(0, state.groundY, CANVAS_WIDTH, 2);

    // Update dino physics
    if (state.dino.isJumping) {
      state.dino.velocityY += GRAVITY;
      state.dino.y += state.dino.velocityY;

      if (state.dino.y >= 150) {
        state.dino.y = 150;
        state.dino.velocityY = 0;
        state.dino.isJumping = false;
      }
    }

    // Draw dino
    ctx.fillStyle = '#059669';
    ctx.fillRect(state.dino.x, state.dino.y, DINO_WIDTH, DINO_HEIGHT);

    // Update obstacles
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x -= state.speed;
      return obstacle.x > -obstacle.width;
    });

    // Generate new obstacles
    if (state.obstacles.length === 0 || 
        (state.obstacles[state.obstacles.length - 1].x < CANVAS_WIDTH - 200 - Math.random() * 200)) {
      state.obstacles.push(generateObstacle());
    }

    // Draw obstacles
    state.obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.type === 'bird' ? '#dc2626' : '#16a34a';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Check collisions
    for (const obstacle of state.obstacles) {
      if (checkCollision(state.dino, obstacle)) {
        setGameState('gameOver');
        playSound('gameOver');
        
        // Update stats
        const stats = storage.getGameStats('dino');
        const newStats = {
          ...stats,
          played: stats.played + 1,
          highScore: Math.max(stats.highScore || 0, state.score)
        };
        storage.setGameStats('dino', newStats);
        setHighScore(newStats.highScore);
        return;
      }
    }

    // Update score and speed
    state.score += 1;
    if (state.score % 100 === 0) {
      state.speed += 0.2;
      playSound('score');
    }

    setScore(state.score);

    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, generateObstacle, checkCollision, playSound]);

  const startGame = useCallback(() => {
    gameStateRef.current = {
      dino: { x: 50, y: 150, velocityY: 0, isJumping: false },
      obstacles: [],
      score: 0,
      speed: 2,
      groundY: 180,
      lastObstacleX: 0
    };
    setScore(0);
    setGameState('playing');
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  }, [gameState]);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    setGameState('idle');
    setScore(0);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
        case 'ArrowUp':
          e.preventDefault();
          jump();
          break;
        case 'KeyP':
          if (gameState === 'playing' || gameState === 'paused') {
            pauseGame();
          }
          break;
        case 'KeyR':
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, pauseGame, resetGame, gameState]);

  // Game loop management
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Dinosaur Runner
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Jump over obstacles to survive. Press SPACE or ↑ to jump!
          </p>
          
          <div className="flex justify-center items-center space-x-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(score / 10)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(highScore / 10)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Score</div>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="dino-game-canvas max-w-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Game Over Overlay */}
          {gameState === 'gameOver' && (
            <div className="text-center">
              <h3 className="text-xl font-bold text-red-600 mb-2">Game Over!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Final Score: {Math.floor(score / 10)}
              </p>
            </div>
          )}

          {/* Pause Overlay */}
          {gameState === 'paused' && (
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-600 mb-2">Paused</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Press P to resume or click the play button
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {gameState === 'idle' || gameState === 'gameOver' ? (
            <button
              onClick={startGame}
              className="button-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{gameState === 'gameOver' ? 'Play Again' : 'Start Game'}</span>
            </button>
          ) : (
            <button
              onClick={pauseGame}
              className="button-primary flex items-center space-x-2"
            >
              {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{gameState === 'playing' ? 'Pause' : 'Resume'}</span>
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="button-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              const prefs = storage.getPreferences();
              storage.setPreferences({ ...prefs, soundEnabled: !soundEnabled });
            }}
            className="button-secondary flex items-center space-x-2"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to Play
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Controls:</h4>
              <ul className="space-y-1">
                <li>• SPACE or ↑ Arrow: Jump</li>
                <li>• P: Pause/Resume</li>
                <li>• R: Reset Game</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tips:</h4>
              <ul className="space-y-1">
                <li>• Speed increases every 100 points</li>
                <li>• Watch out for birds and cacti</li>
                <li>• Time your jumps carefully</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};