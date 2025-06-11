import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { GameStats } from '../types';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: GameStats;
  onClick: () => void;
  color: string;
}

export const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  stats, 
  onClick, 
  color 
}) => {
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div 
      className="game-card p-6 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Play ${title}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
          <div>Played: {stats.played}</div>
          <div>Win Rate: {winRate}%</div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {description}
      </p>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex space-x-4">
          {stats.currentStreak > 0 && (
            <span className="text-green-600 dark:text-green-400">
              🔥 {stats.currentStreak}
            </span>
          )}
          {stats.highScore && stats.highScore > 0 && (
            <span className="text-blue-600 dark:text-blue-400">
              🏆 {stats.highScore}
            </span>
          )}
        </div>
        
        <div className="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
          Play →
        </div>
      </div>
    </div>
  );
};