import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { DinoRunner } from './components/games/DinoRunner';
import { Wordle } from './components/games/Wordle';
import { Hangman } from './components/games/Hangman';
import { themeManager } from './utils/theme';

export type GameType = 'home' | 'dino' | 'wordle' | 'hangman';

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('home');

  useEffect(() => {
    // Initialize theme
    themeManager.init();

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const handleGameSelect = (game: string) => {
    setCurrentGame(game as GameType);
  };

  const handleHomeClick = () => {
    setCurrentGame('home');
  };

  const handleSettingsClick = () => {
    // Future: implement settings modal
    console.log('Settings clicked');
  };

  const getGameTitle = (game: GameType): string => {
    switch (game) {
      case 'dino': return 'Dinosaur Runner';
      case 'wordle': return 'Wordle';
      case 'hangman': return 'Hangman';
      default: return '';
    }
  };

  const renderCurrentGame = () => {
    switch (currentGame) {
      case 'dino':
        return <DinoRunner />;
      case 'wordle':
        return <Wordle />;
      case 'hangman':
        return <Hangman />;
      default:
        return <Home onGameSelect={handleGameSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        currentGame={currentGame !== 'home' ? getGameTitle(currentGame) : undefined}
        onHomeClick={handleHomeClick}
        onSettingsClick={handleSettingsClick}
      />
      <main>
        {renderCurrentGame()}
      </main>
    </div>
  );
}

export default App;