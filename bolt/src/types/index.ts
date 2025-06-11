export interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  averageGuesses?: number;
  bestTime?: number;
  highScore?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  language: string;
}

export interface WordleGame {
  solution: string;
  guesses: string[];
  currentGuess: string;
  gameState: 'playing' | 'won' | 'lost';
  gameNumber: number;
}

export interface HangmanGame {
  word: string;
  category: string;
  guessedLetters: string[];
  wrongGuesses: number;
  gameState: 'playing' | 'won' | 'lost';
  hintsUsed: number;
}

export interface DinoGame {
  score: number;
  highScore: number;
  gameState: 'playing' | 'paused' | 'gameOver';
  speed: number;
  obstacles: Obstacle[];
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
}