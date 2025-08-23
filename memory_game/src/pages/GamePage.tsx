import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import Grid from '../shared/components/Grid';
import Card from '../shared/components/Card';
import Timer from '../shared/components/Timer';
import MoveCounter from '../shared/components/MoveCounter';
import SoundToggle from '../shared/components/SoundToggle';
import Confetti from '../shared/components/Confetti';
import { leaderboardService } from '../services/leaderboardService';
import type { Card as CardType } from '../types';

const GamePage: React.FC = () => {
  const {
    cardDeck,
    flippedCards,
    matchedCards,
    moves,
    timer,
    victory,
    gameStarted,
    currentTheme,
    difficulty,
    playerName,
    gridSize,
    startGame,
    flipCard,
    startTimer,
    stopTimer,
    resetGame
  } = useStore();

  // Start timer when game begins
  useEffect(() => {
    if (gameStarted && !victory) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [gameStarted, victory, startTimer, stopTimer]);

  // Handle victory state
  useEffect(() => {
    if (victory && gameStarted) {
      const submitScore = async () => {
        try {
          const score = {
            playerName: playerName || 'Anonymous',
            moves,
            time: timer,
            difficulty,
            timestamp: Date.now()
          };
          await leaderboardService.submitScore(score);
        } catch (error) {
          console.error('Failed to submit score:', error);
        }
      };
      
      submitScore();
      stopTimer();
    }
  }, [victory, gameStarted, playerName, moves, timer, difficulty, stopTimer]);

  const handleCardClick = (cardId: string) => {
    if (!gameStarted || victory || flippedCards.length >= 2) return;
    
    const card = cardDeck.find((c: CardType) => c.id === cardId);
    if (!card || card.isMatched || flippedCards.includes(cardId)) return;

    flipCard(cardId);
  };

  const handleStartGame = () => {
    resetGame();
    startGame();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 dark:from-purple-900 dark:via-blue-900 dark:to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Memory Game
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Click cards to find matching pairs!
          </p>
          <button
            onClick={handleStartGame}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 dark:from-purple-900 dark:via-blue-900 dark:to-teal-800 p-4">
      {victory && <Confetti />}
      
      <div className="max-w-6xl mx-auto">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Timer />
            <MoveCounter />
          </div>
          <div className="flex items-center space-x-4">
            <SoundToggle />
            <button
              onClick={handleStartGame}
              className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              New Game
            </button>
          </div>
        </div>

        {/* Victory message */}
        {victory && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 text-center">
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You completed the game in {moves} moves and {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, '0')}!
            </p>
          </div>
        )}

        {/* Game grid */}
        <div className="flex justify-center">
          <Grid gridSize={gridSize}>
            {cardDeck.map((card: CardType) => (
              <Card
                key={card.id}
                card={card}
                isFlipped={flippedCards.includes(card.id) || matchedCards.includes(card.id)}
                isMatched={matchedCards.includes(card.id)}
                onClick={() => handleCardClick(card.id)}
                disabled={victory || flippedCards.length >= 2}
              />
            ))}
          </Grid>
        </div>

        {/* Game info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-6 bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-3">
            <span className="text-white font-medium">
              Difficulty: <span className="capitalize">{difficulty}</span>
            </span>
            <span className="text-white font-medium">
              Theme: <span className="capitalize">{currentTheme}</span>
            </span>
            <span className="text-white font-medium">
              Cards: {matchedCards.length}/{Math.floor(cardDeck.length / 2)} pairs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
