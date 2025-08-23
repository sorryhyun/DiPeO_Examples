import React from 'react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  onShare?: (id: string) => void;
  onView?: (id: string) => void;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  entries,
  onShare,
  onView,
}) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No leaderboard entries yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              {entry.avatar ? (
                <img
                  src={entry.avatar}
                  alt={`${entry.playerName} avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-semibold">
                    {entry.playerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {entry.playerName}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Score: {entry.score.toLocaleString()}</span>
                <span>Time: {Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, '0')}</span>
                <span>Moves: {entry.moves}</span>
              </div>
              {entry.date && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onView && (
              <button
                onClick={() => onView(entry.id)}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View ${entry.playerName}'s profile`}
              >
                View
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(entry.id)}
                className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label={`Share ${entry.playerName}'s score`}
              >
                Share
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
