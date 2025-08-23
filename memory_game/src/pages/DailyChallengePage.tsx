import React, { useEffect, useState } from 'react';
import { Button } from '../shared/components/Button';
import { Grid } from '../shared/components/Grid';
import { Card } from '../shared/components/Card';
import { dailyChallengeService } from '../services/dailyChallengeService';
import { useGameStore } from '../state/store';
import { DailyChallenge } from '../types';

export default function DailyChallengePage() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDeck, setPreviewDeck] = useState<any[]>([]);
  
  const { startChallenge, challengeProgress } = useGameStore();

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const todayChallenge = await dailyChallengeService.getToday();
      setChallenge(todayChallenge);
      
      // Get preview deck for challenge
      if (todayChallenge) {
        const deck = await dailyChallengeService.getChallengeDeck(
          todayChallenge.seed,
          todayChallenge.difficulty
        );
        setPreviewDeck(deck.slice(0, 8)); // Show first 8 cards as preview
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    if (!challenge) return;

    try {
      const challengeDeck = await dailyChallengeService.getChallengeDeck(
        challenge.seed,
        challenge.difficulty
      );
      
      startChallenge({
        seed: challenge.seed,
        difficulty: challenge.difficulty,
        theme: challenge.theme,
        deck: challengeDeck
      });

      // Navigate to game page (simple hash navigation)
      window.location.hash = '#/game';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start challenge');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading daily challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Error Loading Challenge
              </h2>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <Button
                onClick={loadDailyChallenge}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">No daily challenge available</p>
          </div>
        </div>
      </div>
    );
  }

  const gridSize = challenge.difficulty === 'easy' ? 4 : challenge.difficulty === 'medium' ? 6 : 8;
  const isCompleted = challengeProgress?.completed;
  const inProgress = challengeProgress?.inProgress;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Challenge
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete today's unique puzzle and earn special rewards!
          </p>
        </div>

        {/* Challenge Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Today's Challenge #{challenge.seed}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)} ({gridSize}×{gridSize})
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                  Theme: {challenge.theme.charAt(0).toUpperCase() + challenge.theme.slice(1)}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                    ✓ Completed
                  </span>
                )}
                {inProgress && !isCompleted && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              {inProgress && !isCompleted ? (
                <Button
                  onClick={() => window.location.hash = '#/game'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Continue Challenge
                </Button>
              ) : (
                <Button
                  onClick={handleStartChallenge}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isCompleted 
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCompleted ? 'Play Again' : 'Start Challenge'}
                </Button>
              )}
            </div>
          </div>

          {/* Challenge Description */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              {challenge.description || `Match all pairs in this ${gridSize}×${gridSize} grid using the ${challenge.theme} theme. This challenge uses a unique seed that creates a special card arrangement just for today!`}
            </p>
          </div>

          {/* Rewards/Stats Section */}
          {challenge.rewards && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Today's Rewards
              </h3>
              <div className="flex flex-wrap gap-2">
                {challenge.rewards.map((reward, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300 rounded text-sm"
                  >
                    {reward}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Card Preview
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Here's a preview of some cards you'll see in today's challenge:
          </p>
          
          <div className="flex justify-center">
            <Grid rows={2} cols={4} className="max-w-md">
              {previewDeck.map((card, index) => (
                <Card
                  key={index}
                  id={card.id}
                  content={card.content}
                  isFlipped={true}
                  isMatched={false}
                  onFlip={() => {}} // No interaction in preview
                />
              ))}
            </Grid>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Button
            onClick={() => window.location.hash = '#/'}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
