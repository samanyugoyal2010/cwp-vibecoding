import React, { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Lightbulb, HelpCircle } from 'lucide-react';
import { storage } from '../../utils/storage';
import { getRandomWord, HANGMAN_CATEGORIES } from '../../utils/words';

type Difficulty = 'easy' | 'medium' | 'hard';
type Category = keyof typeof HANGMAN_CATEGORIES;

export const Hangman: React.FC = () => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState<Category>('animals');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const maxWrongGuesses = {
    easy: 8,
    medium: 6,
    hard: 4
  };

  const startNewGame = useCallback(() => {
    const newWord = getRandomWord(category);
    setWord(newWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setHintsUsed(0);
    setGameState('playing');
  }, [category]);

  const guessLetter = useCallback((letter: string) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses[difficulty]) {
        setGameState('lost');
        const stats = storage.getGameStats('hangman');
        storage.setGameStats('hangman', {
          ...stats,
          played: stats.played + 1,
          currentStreak: 0
        });
      }
    } else {
      // Check if word is complete
      const isComplete = word.split('').every(char => 
        char === ' ' || newGuessedLetters.includes(char)
      );
      
      if (isComplete) {
        setGameState('won');
        const stats = storage.getGameStats('hangman');
        storage.setGameStats('hangman', {
          ...stats,
          played: stats.played + 1,
          won: stats.won + 1,
          currentStreak: stats.currentStreak + 1,
          maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1)
        });
      }
    }
  }, [gameState, guessedLetters, word, wrongGuesses, difficulty]);

  const useHint = useCallback(() => {
    if (gameState !== 'playing' || hintsUsed >= 2) return;

    const unguessedLetters = word.split('')
      .filter(char => char !== ' ' && !guessedLetters.includes(char));
    
    if (unguessedLetters.length > 0) {
      const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
      guessLetter(randomLetter);
      setHintsUsed(prev => prev + 1);
    }
  }, [gameState, word, guessedLetters, hintsUsed, guessLetter]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase();
      if (letter.match(/[A-Z]/) && letter.length === 1) {
        guessLetter(letter);
      }
    };

    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState, guessLetter]);

  const displayWord = word.split('').map(char => 
    char === ' ' ? ' ' : (guessedLetters.includes(char) ? char : '_')
  ).join('');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const stats = storage.getGameStats('hangman');

  // Hangman drawing based on wrong guesses
  const HangmanDrawing: React.FC<{ wrongGuesses: number; maxWrong: number }> = ({ wrongGuesses, maxWrong }) => {
    const parts = [
      // Head
      <circle key="head" cx="100" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="2" />,
      // Body  
      <line key="body" x1="100" y1="48" x2="100" y2="120" stroke="currentColor" strokeWidth="2" />,
      // Left arm
      <line key="leftArm" x1="100" y1="70" x2="80" y2="90" stroke="currentColor" strokeWidth="2" />,
      // Right arm
      <line key="rightArm" x1="100" y1="70" x2="120" y2="90" stroke="currentColor" strokeWidth="2" />,
      // Left leg
      <line key="leftLeg" x1="100" y1="120" x2="80" y2="140" stroke="currentColor" strokeWidth="2" />,
      // Right leg
      <line key="rightLeg" x1="100" y1="120" x2="120" y2="140" stroke="currentColor" strokeWidth="2" />,
      // Face - eyes
      <g key="face">
        <circle cx="96" cy="36" r="1" fill="currentColor" />
        <circle cx="104" cy="36" r="1" fill="currentColor" />
        <path d="M 96 42 Q 100 46 104 42" stroke="currentColor" strokeWidth="1" fill="none" />
      </g>,
      // Hat (extra for easy mode)
      <path key="hat" d="M 88 32 L 112 32 L 110 28 L 90 28 Z" stroke="currentColor" strokeWidth="2" fill="none" />
    ];

    const gallows = (
      <g key="gallows">
        {/* Base */}
        <line x1="10" y1="160" x2="60" y2="160" stroke="currentColor" strokeWidth="3" />
        {/* Pole */}
        <line x1="30" y1="160" x2="30" y2="20" stroke="currentColor" strokeWidth="3" />
        {/* Top beam */}
        <line x1="30" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="3" />
        {/* Noose */}
        <line x1="100" y1="20" x2="100" y2="32" stroke="currentColor" strokeWidth="2" />
      </g>
    );

    const maxParts = maxWrong === 8 ? 8 : maxWrong === 6 ? 6 : 4;
    const partsToShow = Math.min(wrongGuesses, maxParts);

    return (
      <svg width="200" height="180" className="hangman-drawing">
        {gallows}
        {parts.slice(0, partsToShow)}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Hangman
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Guess the word before the drawing is complete!
          </p>

          {gameState !== 'setup' && (
            <div className="flex justify-center items-center space-x-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.played}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
              </div>
            </div>
          )}
        </div>

        {/* Game Setup */}
        {gameState === 'setup' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Game Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.keys(HANGMAN_CATEGORIES).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat as Category)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        category === cat
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        difficulty === diff
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      <div className="text-xs opacity-75 mt-1">
                        {diff === 'easy' && '8 guesses'}
                        {diff === 'medium' && '6 guesses'}
                        {diff === 'hard' && '4 guesses'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startNewGame}
                className="button-primary w-full"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Board */}
        {gameState !== 'setup' && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Hangman Drawing */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-center mb-4">
                  <HangmanDrawing wrongGuesses={wrongGuesses} maxWrong={maxWrongGuesses[difficulty]} />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Wrong guesses: {wrongGuesses} / {maxWrongGuesses[difficulty]}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Category: <span className="font-medium capitalize">{category}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Difficulty: <span className="font-medium capitalize">{difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Word Display */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="text-center mb-6">
                  <div className="text-3xl md:text-4xl font-mono font-bold text-gray-900 dark:text-white tracking-wider mb-4">
                    {displayWord}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {word.length} letters
                  </div>
                </div>

                {/* Game Status */}
                {gameState === 'won' && (
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-green-600 mb-2">Congratulations!</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      You guessed the word: <span className="font-bold">{word}</span>
                    </p>
                  </div>
                )}

                {gameState === 'lost' && (
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-red-600 mb-2">Game Over!</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      The word was: <span className="font-bold text-green-600">{word}</span>
                    </p>
                  </div>
                )}

                {/* Hints */}
                {gameState === 'playing' && (
                  <div className="text-center">
                    <button
                      onClick={useHint}
                      disabled={hintsUsed >= 2}
                      className={`button-secondary flex items-center space-x-2 mx-auto ${
                        hintsUsed >= 2 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Hint ({2 - hintsUsed} left)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Letter Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
              <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                {alphabet.map((letter) => {
                  const isGuessed = guessedLetters.includes(letter);
                  const isCorrect = isGuessed && word.includes(letter);
                  const isWrong = isGuessed && !word.includes(letter);

                  return (
                    <button
                      key={letter}
                      onClick={() => guessLetter(letter)}
                      disabled={gameState !== 'playing' || isGuessed}
                      className={`
                        p-3 rounded-lg font-medium text-sm transition-colors focus-ring
                        ${isCorrect ? 'bg-green-500 text-white' :
                          isWrong ? 'bg-red-500 text-white' :
                          isGuessed ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                        ${gameState !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setGameState('setup')}
                className="button-primary flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Game</span>
              </button>
              
              <button
                onClick={() => setShowInstructions(true)}
                className="button-secondary flex items-center space-x-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </button>
            </div>
          </>
        )}

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                How to Play Hangman
              </h3>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Guess the hidden word by selecting letters one at a time.</p>
                <p>Each wrong guess adds a part to the hangman drawing.</p>
                <p>Win by guessing the word before the drawing is complete!</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Difficulty Levels:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• <span className="font-medium">Easy:</span> 8 wrong guesses allowed</li>
                    <li>• <span className="font-medium">Medium:</span> 6 wrong guesses allowed</li>
                    <li>• <span className="font-medium">Hard:</span> 4 wrong guesses allowed</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Tips:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Start with common vowels (A, E, I, O, U)</li>
                    <li>• Try common consonants (R, S, T, L, N)</li>
                    <li>• Use hints strategically (2 per game)</li>
                    <li>• Consider the category for context clues</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={() => setShowInstructions(false)}
                className="button-primary w-full mt-6"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};