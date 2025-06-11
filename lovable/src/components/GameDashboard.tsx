
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Trophy, Target, Zap, User } from 'lucide-react';

interface GameDashboardProps {
  onSelectGame: (game: string) => void;
}

const GameDashboard: React.FC<GameDashboardProps> = ({ onSelectGame }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const games = [
    {
      id: 'wordle',
      title: 'Wordle',
      description: 'Guess the 5-letter word in 6 tries',
      icon: Target,
      stats: `${user.progress.wordle.gamesWon}/${user.progress.wordle.gamesPlayed} wins`,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      id: 'hangman',
      title: 'Hangman',
      description: 'Guess the word before the drawing is complete',
      icon: Trophy,
      stats: `Level ${user.progress.hangman.currentLevel}`,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'dino',
      title: 'Dino Jump',
      description: 'Jump over obstacles and set a high score',
      icon: Zap,
      stats: `High Score: ${user.progress.dino.highScore}`,
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="border-border/50 hover:border-destructive hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card 
                key={game.id} 
                className="bg-card/95 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => onSelectGame(game.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${game.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{game.stats}</p>
                  <div className="mt-4">
                    <Button className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90 transition-opacity`}>
                      Play Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;
