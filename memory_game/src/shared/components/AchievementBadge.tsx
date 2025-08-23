import React from 'react';
import { Achievement } from '../../../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  className?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  className = '' 
}) => {
  const isCompleted = achievement.progress >= achievement.target;
  const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'games_played':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'perfect_games':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        );
      case 'streak':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.28 2.56-.08 3.83-.5 1.79-1.73 3.49-4.13 5.01z"/>
          </svg>
        );
      case 'speed':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44z"/>
            <path d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/>
          </svg>
        );
      case 'daily_challenge':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19v2h-1.5v17H6.5V4H5V2h2.5L8 1h8l.5 1H19v2h-1.5v17z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
    }
  };

  return (
    <div 
      className={`
        relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200
        ${isCompleted 
          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:border-yellow-600' 
          : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
        }
        ${className}
      `}
      aria-label={`Achievement: ${achievement.title}. ${achievement.description}. Progress: ${achievement.progress} of ${achievement.target}`}
      title={achievement.description}
    >
      {/* Icon */}
      <div 
        className={`
          flex-shrink-0 p-2 rounded-full transition-colors duration-200
          ${isCompleted 
            ? 'bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100' 
            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }
        `}
      >
        {getAchievementIcon(achievement.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`
          font-semibold text-sm mb-1 truncate
          ${isCompleted 
            ? 'text-yellow-900 dark:text-yellow-100' 
            : 'text-gray-900 dark:text-gray-100'
          }
        `}>
          {achievement.title}
        </h3>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {achievement.description}
        </p>

        {/* Progress */}
        {!isCompleted ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {achievement.progress}/{achievement.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Completed!
            </span>
          </div>
        )}
      </div>

      {/* Completion Glow Effect */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-lg animate-pulse" />
      )}
    </div>
  );
};

export default AchievementBadge;
