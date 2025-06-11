
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause } from 'lucide-react';

interface DinoGameProps {
  onBack: () => void;
}

const DinoGame: React.FC<DinoGameProps> = ({ onBack }) => {
  const { user, updateProgress } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(user?.progress.dino.highScore || 0);

  const gameRef = useRef({
    dino: { x: 50, y: 200, width: 30, height: 30, velocityY: 0, isJumping: false },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number }>,
    ground: 230,
    gravity: 0.6,
    jumpPower: -12,
    gameSpeed: 5,
    obstacleSpawnRate: 0.02,
    score: 0,
  });

  const drawDino = useCallback((ctx: CanvasRenderingContext2D, dino: any) => {
    ctx.fillStyle = '#10b981';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Simple dino shape
    ctx.fillStyle = '#059669';
    ctx.fillRect(dino.x + 5, dino.y + 5, 20, 20);
    
    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dino.x + 20, dino.y + 8, 4, 4);
  }, []);

  const drawObstacle = useCallback((ctx: CanvasRenderingContext2D, obstacle: any) => {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }, []);

  const drawGround = useCallback((ctx: CanvasRenderingContext2D, width: number, ground: number) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, ground, width, 2);
  }, []);

  const checkCollision = useCallback((rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update dino physics
    if (game.dino.isJumping) {
      game.dino.velocityY += game.gravity;
      game.dino.y += game.dino.velocityY;

      if (game.dino.y >= game.ground - game.dino.height) {
        game.dino.y = game.ground - game.dino.height;
        game.dino.velocityY = 0;
        game.dino.isJumping = false;
      }
    }

    // Spawn obstacles
    if (Math.random() < game.obstacleSpawnRate) {
      game.obstacles.push({
        x: canvas.width,
        y: game.ground - 25,
        width: 15,
        height: 25,
      });
    }

    // Update obstacles
    game.obstacles = game.obstacles.filter(obstacle => {
      obstacle.x -= game.gameSpeed;
      return obstacle.x > -obstacle.width;
    });

    // Check collisions
    for (const obstacle of game.obstacles) {
      if (checkCollision(game.dino, obstacle)) {
        setGameState('gameOver');
        if (game.score > highScore) {
          setHighScore(game.score);
          updateProgress('dino', {
            highScore: game.score,
            gamesPlayed: user!.progress.dino.gamesPlayed + 1,
          });
        } else {
          updateProgress('dino', {
            gamesPlayed: user!.progress.dino.gamesPlayed + 1,
          });
        }
        return;
      }
    }

    // Update score
    game.score += 1;
    setScore(game.score);

    // Increase difficulty
    if (game.score % 500 === 0) {
      game.gameSpeed += 0.5;
      game.obstacleSpawnRate += 0.001;
    }

    // Draw everything
    drawGround(ctx, canvas.width, game.ground);
    drawDino(ctx, game.dino);
    game.obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));

    // Draw score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText(`Score: ${game.score}`, 10, 30);
    ctx.fillText(`High: ${highScore}`, 10, 55);

    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, highScore, user, updateProgress, checkCollision, drawDino, drawObstacle, drawGround]);

  const startGame = () => {
    const game = gameRef.current;
    game.dino = { x: 50, y: 200, width: 30, height: 30, velocityY: 0, isJumping: false };
    game.obstacles = [];
    game.gameSpeed = 5;
    game.obstacleSpawnRate = 0.02;
    game.score = 0;
    setScore(0);
    setGameState('playing');
  };

  const jump = useCallback(() => {
    if (gameState === 'playing' && !gameRef.current.dino.isJumping) {
      gameRef.current.dino.velocityY = gameRef.current.jumpPower;
      gameRef.current.dino.isJumping = true;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    setHighScore(user?.progress.dino.highScore || 0);
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={onBack} variant="outline" className="border-border/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Dino Jump
          </h1>
          <div className="w-20" />
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={300}
                className="border border-border/50 bg-gradient-to-b from-sky-200 to-sky-100 mx-auto rounded-lg"
                onClick={jump}
              />
            </div>

            <div className="flex justify-center space-x-4">
              {gameState === 'idle' && (
                <Button onClick={startGame} className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              )}

              {gameState === 'gameOver' && (
                <div className="text-center">
                  <div className="text-red-400 font-bold text-xl mb-4">Game Over!</div>
                  <Button onClick={startGame} className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90">
                    <Play className="h-4 w-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">Press SPACE or click to jump!</div>
                  <Button onClick={jump} className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90">
                    Jump
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-400">{score}</div>
                <div className="text-sm text-muted-foreground">Current Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{highScore}</div>
                <div className="text-sm text-muted-foreground">High Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{user?.progress.dino.gamesPlayed || 0}</div>
                <div className="text-sm text-muted-foreground">Games Played</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DinoGame;
