
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import GameDashboard from '../components/GameDashboard';
import WordleGame from '../components/games/WordleGame';
import HangmanGame from '../components/games/HangmanGame';
import DinoGame from '../components/games/DinoGame';

const GameApp: React.FC = () => {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  if (!user) {
    return <LoginForm />;
  }

  if (currentGame === 'wordle') {
    return <WordleGame onBack={() => setCurrentGame(null)} />;
  }

  if (currentGame === 'hangman') {
    return <HangmanGame onBack={() => setCurrentGame(null)} />;
  }

  if (currentGame === 'dino') {
    return <DinoGame onBack={() => setCurrentGame(null)} />;
  }

  return <GameDashboard onSelectGame={setCurrentGame} />;
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <GameApp />
    </AuthProvider>
  );
};

export default Index;
