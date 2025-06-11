import React, { useState, useEffect, useCallback } from 'react';
import { Share, RotateCcw, HelpCircle } from 'lucide-react';
import { storage } from '../../utils/storage';
import { getTodaysWord, isValidWord } from '../../utils/words';

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface LetterTile {
  letter: string;
  state: LetterState;
}

export const Wordle: React.FC = () => {
  const [solution] = useState(() => getTodaysWord());
  const [guesses, setGuesses] = useState<LetterTile[][]>(() => 
    Array(6).fill(null).map(() => Array(5).fill({ letter: '', state: 'empty' }))
  );
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [keyboardState, setKeyboardState] = useState<Record<string, LetterState>>({});
  const [showInstructions, setShowInstructions] = useState(false);
  const [invalidWord, setInvalidWord] = useState(false);

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  // Check if it's a new day and reset game if needed
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = storage.getWordleLastPlayed();
    
    if (lastPlayed !== today) {
      // Reset for new day
      setCurrentRow(0);
      setCurrentGuess('');
      setGameState('playing');
      setGuesses(Array(6).fill(null).map(() => Array(5).fill({ letter: '', state: 'empty' })));
      setKeyboardState({});
    }
  }, []);

  const evaluateGuess = useCallback((guess: string): LetterTile[] => {
    const result: LetterTile[] = [];
    const solutionArray = solution.split('');
    const guessArray = guess.split('');
    
    // First pass: mark correct letters
    const used = new Array(5).fill(false);
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === solutionArray[i]) {
        result[i] = { letter: guessArray[i], state: 'correct' };
        used[i] = true;
      } else {
        result[i] = { letter: guessArray[i], state: 'absent' };
      }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
      if (result[i].state === 'absent') {
        for (let j = 0; j < 5; j++) {
          if (!used[j] && guessArray[i] === solutionArray[j]) {
            result[i].state = 'present';
            used[j] = true;
            break;
          }
        }
      }
    }
    
    return result;
  }, [solution]);

  const updateKeyboardState = useCallback((guess: LetterTile[]) => {
    setKeyboardState(prev => {
      const newState = { ...prev };
      guess.forEach(({ letter, state }) => {
        if (!newState[letter] || 
            (newState[letter] === 'absent' && state !== 'absent') ||
            (newState[letter] === 'present' && state === 'correct')) {
          newState[letter] = state;
        }
      });
      return newState;
    });
  }, []);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) return;
    if (!isValidWord(currentGuess)) {
      setInvalidWord(true);
      setTimeout(() => setInvalidWord(false), 1000);
      return;
    }

    const evaluatedGuess = evaluateGuess(currentGuess);
    
    setGuesses(prev => {
      const newGuesses = [...prev];
      newGuesses[currentRow] = evaluatedGuess;
      return newGuesses;
    });

    updateKeyboardState(evaluatedGuess);

    if (currentGuess === solution) {
      setGameState('won');
      const stats = storage.getGameStats('wordle');
      const newStats = {
        ...stats,
        played: stats.played + 1,
        won: stats.won + 1,
        currentStreak: stats.currentStreak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        averageGuesses: ((stats.averageGuesses * stats.won) + (currentRow + 1)) / (stats.won + 1)
      };
      storage.setGameStats('wordle', newStats);
      storage.setWordleLastPlayed(new Date().toISOString().split('T')[0]);
    } else if (currentRow === 5) {
      setGameState('lost');
      const stats = storage.getGameStats('wordle');
      const newStats = {
        ...stats,
        played: stats.played + 1,
        currentStreak: 0
      };
      storage.setGameStats('wordle', newStats);
      storage.setWordleLastPlayed(new Date().toISOString().split('T')[0]);
    } else {
      setCurrentRow(prev => prev + 1);
    }

    setCurrentGuess('');
  }, [currentGuess, currentRow, solution, evaluateGuess, updateKeyboardState]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key.match(/[A-Z]/)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
      }
    }
  }, [gameState, currentGuess, submitGuess]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || (key.length === 1 && key.match(/[A-Z]/))) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const shareResults = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const attempts = gameState === 'won' ? currentRow + 1 : 'X';
    
    let result = `Wordle ${today} ${attempts}/6\n\n`;
    
    for (let i = 0; i <= (gameState === 'won' ? currentRow : 5); i++) {
      for (let j = 0; j < 5; j++) {
        const state = guesses[i][j].state;
        if (state === 'correct') result += '🟩';
        else if (state === 'present') result += '🟨';
        else result += '⬛';
      }
      result += '\n';
    }

    if (navigator.share) {
      navigator.share({ text: result });
    } else {
      navigator.clipboard.writeText(result);
      // Could show a toast notification here
    }
  }, [gameState, currentRow, guesses]);

  const resetGame = useCallback(() => {
    // Only allow reset if game is over or it's a new day
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = storage.getWordleLastPlayed();
    
    if (gameState !== 'playing' || lastPlayed !== today) {
      window.location.reload(); // Simple way to reset with new word
    }
  }, [gameState]);

  const stats = storage.getGameStats('wordle');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Wordle
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Guess the WORDLE in 6 tries. Each guess must be a valid 5-letter word.
          </p>

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
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.maxStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Max Streak</div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <div className="grid grid-rows-6 gap-2 mb-6">
            {guesses.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-2">
                {row.map((tile, colIndex) => {
                  const isCurrentRow = rowIndex === currentRow;
                  const hasLetter = isCurrentRow && colIndex < currentGuess.length;
                  const letter = isCurrentRow ? 
                    (colIndex < currentGuess.length ? currentGuess[colIndex] : '') : 
                    tile.letter;
                  
                  return (
                    <div
                      key={colIndex}
                      className={`wordle-tile ${tile.state} ${
                        isCurrentRow && hasLetter ? 'border-gray-500' : ''
                      } ${invalidWord && isCurrentRow ? 'animate-bounce' : ''}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Game Over Message */}
          {gameState === 'won' && (
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-green-600 mb-2">Congratulations!</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You solved it in {currentRow + 1} {currentRow === 0 ? 'try' : 'tries'}!
              </p>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-red-600 mb-2">Game Over!</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The word was: <span className="font-bold text-green-600">{solution}</span>
              </p>
            </div>
          )}

          {invalidWord && (
            <div className="text-center mb-4">
              <p className="text-red-600 font-medium">Not a valid word!</p>
            </div>
          )}
        </div>

        {/* Virtual Keyboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              className={`flex gap-1 mb-2 ${rowIndex === 1 ? 'ml-4' : ''}`}
            >
              {row.map((key) => {
                const state = keyboardState[key] || 'empty';
                const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
                
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    disabled={gameState !== 'playing'}
                    className={`
                      px-2 py-3 rounded font-medium text-sm transition-colors
                      ${isSpecial ? 'px-4' : 'flex-1 max-w-10'}
                      ${state === 'correct' ? 'bg-green-500 text-white' :
                        state === 'present' ? 'bg-yellow-500 text-white' :
                        state === 'absent' ? 'bg-gray-500 text-white' :
                        'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}
                      ${gameState !== 'playing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {key === 'BACKSPACE' ? '⌫' : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {gameState !== 'playing' && (
            <button
              onClick={shareResults}
              className="button-primary flex items-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>Share Results</span>
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="button-secondary flex items-center space-x-2"
            disabled={gameState === 'playing'}
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

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                How to Play Wordle
              </h3>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Guess the WORDLE in 6 tries.</p>
                <p>Each guess must be a valid 5-letter word. Hit the enter button to submit.</p>
                <p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">
                      W
                    </div>
                    <span>The letter W is in the word and in the correct spot.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold">
                      I
                    </div>
                    <span>The letter I is in the word but in the wrong spot.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center text-white font-bold">
                      U
                    </div>
                    <span>The letter U is not in the word in any spot.</span>
                  </div>
                </div>
                
                <p className="font-medium">A new WORDLE will be available each day!</p>
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