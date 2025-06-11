import { GameStats, UserPreferences } from '../types';

const STORAGE_KEYS = {
  WORDLE_STATS: 'gamehub_wordle_stats',
  HANGMAN_STATS: 'gamehub_hangman_stats',
  DINO_STATS: 'gamehub_dino_stats',
  USER_PREFERENCES: 'gamehub_preferences',
  WORDLE_GAME: 'gamehub_wordle_game',
  WORDLE_LAST_PLAYED: 'gamehub_wordle_last_played'
} as const;

export const storage = {
  // Game statistics
  getGameStats: (game: 'wordle' | 'hangman' | 'dino'): GameStats => {
    const key = game === 'wordle' ? STORAGE_KEYS.WORDLE_STATS :
                game === 'hangman' ? STORAGE_KEYS.HANGMAN_STATS :
                STORAGE_KEYS.DINO_STATS;
    
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      averageGuesses: 0,
      bestTime: 0,
      highScore: 0
    };
  },

  setGameStats: (game: 'wordle' | 'hangman' | 'dino', stats: GameStats): void => {
    const key = game === 'wordle' ? STORAGE_KEYS.WORDLE_STATS :
                game === 'hangman' ? STORAGE_KEYS.HANGMAN_STATS :
                STORAGE_KEYS.DINO_STATS;
    
    localStorage.setItem(key, JSON.stringify(stats));
  },

  // User preferences
  getPreferences: (): UserPreferences => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return stored ? JSON.parse(stored) : {
      theme: 'system',
      soundEnabled: true,
      language: 'en'
    };
  },

  setPreferences: (preferences: UserPreferences): void => {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  },

  // Wordle specific
  getWordleGame: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.WORDLE_GAME);
    return stored ? JSON.parse(stored) : null;
  },

  setWordleGame: (game: any) => {
    localStorage.setItem(STORAGE_KEYS.WORDLE_GAME, JSON.stringify(game));
  },

  getWordleLastPlayed: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.WORDLE_LAST_PLAYED);
  },

  setWordleLastPlayed: (date: string): void => {
    localStorage.setItem(STORAGE_KEYS.WORDLE_LAST_PLAYED, date);
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};