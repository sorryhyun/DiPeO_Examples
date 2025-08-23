import React from 'react';
import { Button } from '../shared/components/Button';
import { ThemeSelector } from '../shared/components/ThemeSelector';
import { useGameStore } from '../state/store';

export default function HomePage() {
  const { startGame } = useGameStore();

  const handleStartGame = (difficulty: '4x4' | '6x6' | '8x8') => {
    const gridSizes = {
      '4x4': { rows: 4, cols: 4 },
      '6x6': { rows: 6, cols: 6 },
      '8x8': { rows: 8, cols: 8 }
    };
    
    startGame(gridSizes[difficulty]);
    window.location.hash = '#/game';
  };

  const handleNavigate = (route: string) => {
    window.location.hash = route;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Memory Game
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test your memory with this classic card matching game. Choose your difficulty and start playing!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Theme Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Choose Your Theme
            </h2>
            <ThemeSelector />
          </div>

          {/* Difficulty Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Select Difficulty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Button
                  onClick={() => handleStartGame('4x4')}
                  className="w-full py-6 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 mb-3"
                  ariaLabel="Start easy 4x4 game"
                >
                  Easy
                </Button>
                <p className="text-gray-600 dark:text-gray-400">4×4 Grid • 8 Pairs</p>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => handleStartGame('6x6')}
                  className="w-full py-6 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200 mb-3"
                  ariaLabel="Start medium 6x6 game"
                >
                  Medium
                </Button>
                <p className="text-gray-600 dark:text-gray-400">6×6 Grid • 18 Pairs</p>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => handleStartGame('8x8')}
                  className="w-full py-6 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 mb-3"
                  ariaLabel="Start hard 8x8 game"
                >
                  Hard
                </Button>
                <p className="text-gray-600 dark:text-gray-400">8×8 Grid • 32 Pairs</p>
              </div>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Daily Challenge
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Take on today's special challenge with unique cards and compete for the daily leaderboard!
              </p>
              <Button
                onClick={() => handleNavigate('#/daily')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                ariaLabel="Go to daily challenge"
              >
                Play Daily Challenge
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Multiplayer
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Challenge your friends in real-time multiplayer matches and see who has the better memory!
              </p>
              <Button
                onClick={() => handleNavigate('#/multiplayer')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                ariaLabel="Go to multiplayer"
              >
                Play Multiplayer
              </Button>
            </div>
          </div>

          {/* Additional Navigation */}
          <div className="text-center mt-8">
            <div className="space-x-4">
              <Button
                onClick={() => handleNavigate('#/leaderboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                ariaLabel="View leaderboard"
              >
                Leaderboard
              </Button>
              <Button
                onClick={() => handleNavigate('#/settings')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                ariaLabel="Go to settings"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
