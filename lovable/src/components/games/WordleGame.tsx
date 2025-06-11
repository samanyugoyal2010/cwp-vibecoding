
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Target } from 'lucide-react';

interface WordleGameProps {
  onBack: () => void;
}

const WORDS = ['REACT', 'WORLD', 'GAMES', 'HAPPY', 'MUSIC', 'LIGHT', 'POWER', 'CLOUD', 'DREAM', 'PEACE'];

const WordleGame: React.FC<WordleGameProps> = ({ onBack }) => {
  const { user, updateProgress } = useAuth();
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    newGame();
  }, []);

  const newGame = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
  };

  const submitGuess = () => {
    if (currentGuess.length !== 5 || gameStatus !== 'playing') return;

    const newGuesses = [...guesses, currentGuess.toUpperCase()];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess.toUpperCase() === targetWord) {
      setGameStatus('won');
      updateProgress('wordle', {
        gamesPlayed: user!.progress.wordle.gamesPlayed + 1,
        gamesWon: user!.progress.wordle.gamesWon + 1,
        currentStreak: user!.progress.wordle.currentStreak + 1,
        maxStreak: Math.max(user!.progress.wordle.maxStreak, user!.progress.wordle.currentStreak + 1),
        lastPlayed: new Date().toISOString(),
      });
    } else if (newGuesses.length >= 6) {
      setGameStatus('lost');
      updateProgress('wordle', {
        gamesPlayed: user!.progress.wordle.gamesPlayed + 1,
        currentStreak: 0,
        lastPlayed: new Date().toISOString(),
      });
    }
  };

  const getLetterColor = (letter: string, index: number, word: string): string => {
    if (targetWord[index] === letter) return 'bg-green-500 border-green-400 text-white shadow-lg';
    if (targetWord.includes(letter)) return 'bg-yellow-500 border-yellow-400 text-white shadow-lg';
    return 'bg-gray-600 border-gray-500 text-white shadow-lg';
  };

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && /[A-Z]/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyPress(e.key.toUpperCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameStatus]);

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-100 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-full">
              <Target className="h-6 w-6 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              Wordle
            </h1>
          </div>
          
          <Button 
            onClick={newGame} 
            variant="outline" 
            className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-100 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
        </div>

        {/* Game Board */}
        <Card className="bg-card/90 backdrop-blur-md border-green-500/20 shadow-2xl">
          <CardContent className="p-8">
            {/* Game Grid */}
            <div className="grid gap-3 mb-8 justify-center">
              {Array.from({ length: 6 }, (_, rowIndex) => (
                <div key={rowIndex} className="flex gap-3 justify-center">
                  {Array.from({ length: 5 }, (_, colIndex) => {
                    const guess = guesses[rowIndex];
                    const isCurrentRow = rowIndex === guesses.length && gameStatus === 'playing';
                    const letter = guess ? guess[colIndex] : (isCurrentRow ? currentGuess[colIndex] || '' : '');
                    const bgColor = guess ? getLetterColor(letter, colIndex, guess) : 'bg-background/50 border-border/50';
                    
                    return (
                      <div
                        key={colIndex}
                        className={`w-14 h-14 border-2 flex items-center justify-center text-white font-bold text-xl rounded-lg transition-all duration-300 transform ${bgColor} ${isCurrentRow && currentGuess[colIndex] ? 'scale-105' : ''}`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Game Status Messages */}
            {gameStatus === 'won' && (
              <div className="text-center mb-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <div className="text-green-300 font-bold text-2xl mb-2">🎉 Congratulations!</div>
                <div className="text-green-200">You guessed the word!</div>
              </div>
            )}

            {gameStatus === 'lost' && (
              <div className="text-center mb-6 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                <div className="text-red-300 font-bold text-2xl mb-2">Game Over</div>
                <div className="text-red-200">The word was: <span className="font-bold">{targetWord}</span></div>
              </div>
            )}

            {/* Keyboard */}
            <div className="space-y-2">
              {keyboard.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                  {row.map((key) => (
                    <Button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      disabled={gameStatus !== 'playing'}
                      className={`h-12 min-w-[42px] text-sm font-bold transition-all duration-200 ${
                        key === 'ENTER' || key === 'BACKSPACE' ? 'px-4' : 'px-3'
                      } bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
                    >
                      {key === 'BACKSPACE' ? '⌫' : key}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-card/90 backdrop-blur-md border-green-500/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-green-200 flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Your Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-3xl font-bold text-green-400">{user?.progress.wordle.gamesWon}</div>
                <div className="text-sm text-green-200 mt-1">Games Won</div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-400">{user?.progress.wordle.currentStreak}</div>
                <div className="text-sm text-blue-200 mt-1">Current Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WordleGame;
