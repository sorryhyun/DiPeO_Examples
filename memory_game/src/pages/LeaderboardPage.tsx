import { useEffect, useState } from 'react';
import leaderboardService from '../services/leaderboardService';
import { LeaderboardList } from '../shared/components/LeaderboardList';
import Button from '../shared/components/Button';
import { LeaderboardEntry, GameDifficulty } from '../types';

interface LeaderboardPageState {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  selectedDifficulty: GameDifficulty | 'all';
}

export default function LeaderboardPage() {
  const [state, setState] = useState<LeaderboardPageState>({
    entries: [],
    loading: true,
    error: null,
    selectedDifficulty: 'all'
  });

  const fetchLeaderboard = async (difficulty?: GameDifficulty | 'all') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const entries = await leaderboardService.getTop({
        difficulty: difficulty === 'all' ? undefined : difficulty,
        limit: 50
      });
      setState(prev => ({ ...prev, entries, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load leaderboard'
      }));
    }
  };

  useEffect(() => {
    fetchLeaderboard(state.selectedDifficulty === 'all' ? undefined : state.selectedDifficulty);
  }, [state.selectedDifficulty]);

  const handleDifficultyChange = (difficulty: GameDifficulty | 'all') => {
    setState(prev => ({ ...prev, selectedDifficulty: difficulty }));
  };

  const handleRefresh = () => {
    fetchLeaderboard(state.selectedDifficulty === 'all' ? undefined : state.selectedDifficulty);
  };

  const handleShare = (entryId: string) => {
    const entry = state.entries.find(e => e.id === entryId);
    if (entry && navigator.share) {
      navigator.share({
        title: 'Memory Game High Score',
        text: `Check out this high score: ${entry.score} points by ${entry.playerName}!`,
        url: window.location.href
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard?.writeText(`${entry.playerName} scored ${entry.score} points in Memory Game!`);
      });
    } else if (entry && navigator.clipboard) {
      navigator.clipboard.writeText(`${entry.playerName} scored ${entry.score} points in Memory Game!`);
    }
  };

  const handleViewProfile = (entryId: string) => {
    // Profile viewing would navigate to a profile page
    console.log('View profile for entry:', entryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top players and their best scores
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleDifficultyChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.selectedDifficulty === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Difficulties
              </Button>
              {(['easy', 'medium', 'hard'] as GameDifficulty[]).map(difficulty => (
                <Button
                  key={difficulty}
                  onClick={() => handleDifficultyChange(difficulty)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    state.selectedDifficulty === difficulty
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={state.loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {state.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {state.loading && state.entries.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading leaderboard...</span>
            </div>
          ) : state.error ? (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L5.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-lg font-medium">Failed to load leaderboard</p>
                <p className="text-sm mt-1">{state.error}</p>
              </div>
              <Button
                onClick={handleRefresh}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          ) : state.entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-lg font-medium">No scores found</p>
                <p className="text-sm mt-1">
                  {state.selectedDifficulty === 'all' 
                    ? 'Be the first to set a high score!'
                    : `No scores found for ${state.selectedDifficulty} difficulty`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <LeaderboardList
                entries={state.entries}
                onShare={handleShare}
                onView={handleViewProfile}
              />
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {state.entries.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {state.entries.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Entries
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.max(...state.entries.map(e => e.score)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Highest Score
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(state.entries.reduce((acc, e) => acc + e.score, 0) / state.entries.length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Score
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
