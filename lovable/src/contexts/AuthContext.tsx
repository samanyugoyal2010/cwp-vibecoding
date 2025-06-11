
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  progress: {
    wordle: {
      currentStreak: number;
      maxStreak: number;
      gamesPlayed: number;
      gamesWon: number;
      lastPlayed: string;
    };
    hangman: {
      gamesPlayed: number;
      gamesWon: number;
      currentLevel: number;
    };
    dino: {
      highScore: number;
      gamesPlayed: number;
    };
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  updateProgress: (game: string, progress: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('gameUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string) => {
    const savedUsers = JSON.parse(localStorage.getItem('gameUsers') || '{}');
    
    const newUser: User = savedUsers[email] || {
      email,
      progress: {
        wordle: {
          currentStreak: 0,
          maxStreak: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          lastPlayed: '',
        },
        hangman: {
          gamesPlayed: 0,
          gamesWon: 0,
          currentLevel: 1,
        },
        dino: {
          highScore: 0,
          gamesPlayed: 0,
        },
      },
    };

    setUser(newUser);
    localStorage.setItem('gameUser', JSON.stringify(newUser));
    savedUsers[email] = newUser;
    localStorage.setItem('gameUsers', JSON.stringify(savedUsers));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gameUser');
  };

  const updateProgress = (game: string, progress: any) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      progress: {
        ...user.progress,
        [game]: { ...user.progress[game as keyof typeof user.progress], ...progress },
      },
    };

    setUser(updatedUser);
    localStorage.setItem('gameUser', JSON.stringify(updatedUser));
    
    const savedUsers = JSON.parse(localStorage.getItem('gameUsers') || '{}');
    savedUsers[user.email] = updatedUser;
    localStorage.setItem('gameUsers', JSON.stringify(savedUsers));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProgress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
