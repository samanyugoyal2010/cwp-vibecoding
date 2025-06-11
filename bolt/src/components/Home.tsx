import React from 'react';
import { Zap, Type, Users } from 'lucide-react';
import { GameCard } from './GameCard';
import { storage } from '../utils/storage';

interface HomeProps {
  onGameSelect: (game: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onGameSelect }) => {
  const wordleStats = storage.getGameStats('wordle');
  const hangmanStats = storage.getGameStats('hangman');
  const dinoStats = storage.getGameStats('dino');

  const games = [
    {
      id: 'dino',
      title: 'Dinosaur Runner',
      description: 'Jump over obstacles in this endless runner inspired by Chrome\'s offline game. Progressive difficulty keeps you on your toes!',
      icon: Zap,
      stats: dinoStats,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    {
      id: 'wordle',
      title: 'Wordle',
      description: 'Guess the daily five-letter word in six attempts. Use color clues to solve the puzzle and share your results!',
      icon: Type,
      stats: wordleStats,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    },
    {
      id: 'hangman',
      title: 'Hangman',
      description: 'Classic word guessing game with multiple categories and difficulty levels. Use hints strategically to save the day!',
      icon: Users,
      stats: hangmanStats,
      color: 'bg-gradient-to-r from-red-500 to-pink-600'
    }
  ];

  const totalGamesPlayed = wordleStats.played + hangmanStats.played + dinoStats.played;
  const totalGamesWon = wordleStats.won + hangmanStats.won + dinoStats.won;
  const overallWinRate = totalGamesPlayed > 0 ? Math.round((totalGamesWon / totalGamesPlayed) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to <span className="text-gradient">GameHub</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Play classic games offline. Challenge yourself with Dinosaur Runner, solve daily Wordle puzzles, 
            or test your vocabulary with Hangman.
          </p>
          
          {totalGamesPlayed > 0 && (
            <div className="flex justify-center space-x-8 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-purple-600">{totalGamesPlayed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Games Played</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-green-600">{overallWinRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-blue-600">{Math.max(wordleStats.currentStreak, hangmanStats.currentStreak)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
              </div>
            </div>
          )}
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className="fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <GameCard
                title={game.title}
                description={game.description}
                icon={game.icon}
                stats={game.stats}
                onClick={() => onGameSelect(game.id)}
                color={game.color}
              />
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Choose GameHub?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Offline Play</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Play all games offline with our service worker technology. No internet required!
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Type className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Progress Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your statistics and achievements are saved locally and persist across sessions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accessible</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Fully accessible with keyboard navigation and screen reader support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};