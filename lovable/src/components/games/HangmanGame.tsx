
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

interface HangmanGameProps {
  onBack: () => void;
}

const WORD_LISTS = {
  1: ['CAT', 'DOG', 'SUN', 'CAR', 'HAT'],
  2: ['HOUSE', 'MUSIC', 'WATER', 'HAPPY', 'LIGHT'],
  3: ['COMPUTER', 'ELEPHANT', 'RAINBOW', 'MOUNTAIN', 'KITCHEN'],
};

const HangmanGame: React.FC<HangmanGameProps> = ({ onBack }) => {
  const { user, updateProgress } = useAuth();
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [level, setLevel] = useState(1);

  const maxWrongGuesses = 6;

  useEffect(() => {
    setLevel(user?.progress.hangman.currentLevel || 1);
    newGame();
  }, [user]);

  const newGame = () => {
    const currentLevel = Math.min(level, 3) as keyof typeof WORD_LISTS;
    const words = WORD_LISTS[currentLevel];
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        updateProgress('hangman', {
          gamesPlayed: user!.progress.hangman.gamesPlayed + 1,
        });
      }
    } else {
      const isWordComplete = currentWord.split('').every(char => newGuessedLetters.includes(char));
      if (isWordComplete) {
        setGameStatus('won');
        const newLevel = level < 3 ? level + 1 : level;
        updateProgress('hangman', {
          gamesPlayed: user!.progress.hangman.gamesPlayed + 1,
          gamesWon: user!.progress.hangman.gamesWon + 1,
          currentLevel: newLevel,
        });
        setLevel(newLevel);
      }
    }
  };

  const getDisplayWord = () => {
    return currentWord.split('').map(letter => 
      guessedLetters.includes(letter) ? letter : '_'
    ).join(' ');
  };

  const drawHangman = () => {
    const parts = [
      '   ┌─────┐',
      '   │     │',
      wrongGuesses >= 1 ? '   O     │' : '         │',
      wrongGuesses >= 3 ? '  /|\\    │' : wrongGuesses >= 2 ? '  /|     │' : '         │',
      wrongGuesses >= 5 ? '  / \\    │' : wrongGuesses >= 4 ? '  /      │' : '         │',
      '         │',
      '═══════════'
    ];
    return parts.join('\n');
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-100 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Trophy className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">
              Hangman
            </h1>
          </div>
          
          <Button 
            onClick={newGame} 
            variant="outline" 
            className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-100 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Card */}
          <Card className="lg:col-span-2 bg-card/90 backdrop-blur-md border-blue-500/20 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-blue-200">Level {level}</div>
                <div className="text-sm text-muted-foreground bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                  Wrong: {wrongGuesses}/{maxWrongGuesses}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Hangman Drawing */}
              <div className="text-center">
                <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20">
                  <pre className="font-mono text-2xl text-blue-300 leading-tight select-none">
                    {drawHangman()}
                  </pre>
                </div>
              </div>

              {/* Word Display */}
              <div className="text-center">
                <div className="text-4xl font-bold tracking-[0.3em] text-foreground bg-blue-500/10 py-4 px-6 rounded-lg border border-blue-500/20">
                  {getDisplayWord()}
                </div>
              </div>

              {/* Game Status Messages */}
              {gameStatus === 'won' && (
                <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="text-green-300 font-bold text-2xl mb-2">🎉 Congratulations!</div>
                  <div className="text-green-200">You saved them and unlocked the next level!</div>
                </div>
              )}

              {gameStatus === 'lost' && (
                <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="text-red-300 font-bold text-2xl mb-2">💀 Game Over</div>
                  <div className="text-red-200">The word was: <span className="font-bold">{currentWord}</span></div>
                </div>
              )}

              {/* Alphabet Grid */}
              <div className="grid grid-cols-6 gap-2">
                {alphabet.map(letter => (
                  <Button
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
                    className={`h-12 w-12 text-lg font-bold transition-all duration-200 ${
                      guessedLetters.includes(letter)
                        ? currentWord.includes(letter)
                          ? 'bg-green-500 hover:bg-green-500 border-green-400 shadow-lg'
                          : 'bg-red-500 hover:bg-red-500 border-red-400 shadow-lg'
                        : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 hover:scale-105'
                    } border disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-card/90 backdrop-blur-md border-blue-500/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-blue-200 flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 text-center">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-400">{user?.progress.hangman.gamesWon}</div>
                  <div className="text-sm text-blue-200 mt-1">Games Won</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-3xl font-bold text-green-400">{level}</div>
                  <div className="text-sm text-green-200 mt-1">Current Level</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-200">Level Guide:</h3>
                <div className="space-y-3 text-sm">
                  <div className={`p-3 rounded-lg border transition-all ${level >= 1 ? 'bg-green-500/10 border-green-500/30 text-green-200' : 'bg-muted/10 border-border/20 text-muted-foreground'}`}>
                    <div className="font-medium">Level 1: Beginner</div>
                    <div className="text-xs mt-1">3-letter words</div>
                  </div>
                  <div className={`p-3 rounded-lg border transition-all ${level >= 2 ? 'bg-green-500/10 border-green-500/30 text-green-200' : 'bg-muted/10 border-border/20 text-muted-foreground'}`}>
                    <div className="font-medium">Level 2: Intermediate</div>
                    <div className="text-xs mt-1">5-letter words</div>
                  </div>
                  <div className={`p-3 rounded-lg border transition-all ${level >= 3 ? 'bg-green-500/10 border-green-500/30 text-green-200' : 'bg-muted/10 border-border/20 text-muted-foreground'}`}>
                    <div className="font-medium">Level 3: Expert</div>
                    <div className="text-xs mt-1">7+ letter words</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HangmanGame;
