import React, { useState, useEffect } from 'react';
import { useStore } from '../state/store';
import { multiplayerService } from '../services/multiplayerService';
import { useWebSocket } from '../providers/WebSocketProvider';
import { Grid } from '../shared/components/Grid';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { Timer } from '../shared/components/Timer';
import { MoveCounter } from '../shared/components/MoveCounter';
import { MultiplayerSession, Player } from '../types';

export const MultiplayerPage: React.FC = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    multiplayerSession,
    gameBoard,
    isGameActive,
    currentPlayer,
    timer,
    moveCount,
    setMultiplayerSession,
    resetGame
  } = useStore();

  const { isConnected, send } = useWebSocket();

  useEffect(() => {
    // Subscribe to multiplayer events
    const unsubscribe = multiplayerService.onSessionUpdate((session: MultiplayerSession) => {
      setMultiplayerSession(session);
    });

    return unsubscribe;
  }, [setMultiplayerSession]);

  const handleCreateSession = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const session = await multiplayerService.createSession(playerName.trim());
      setMultiplayerSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !playerName.trim()) {
      setError('Please enter both session code and your name');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const session = await multiplayerService.joinSession(sessionCode.trim(), playerName.trim());
      setMultiplayerSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartGame = async () => {
    if (!multiplayerSession) return;

    try {
      await multiplayerService.startGame(multiplayerSession.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  };

  const handleLeaveSession = () => {
    if (multiplayerSession) {
      multiplayerService.leaveSession(multiplayerSession.id);
      setMultiplayerSession(null);
      resetGame();
    }
  };

  const handleCardClick = (index: number) => {
    if (!multiplayerSession || !isGameActive) return;
    
    const isMyTurn = multiplayerSession.currentTurn === multiplayerSession.players.find(p => p.isCurrentUser)?.id;
    if (!isMyTurn) return;

    // Send move to multiplayer service
    multiplayerService.makeMove(multiplayerSession.id, index);
  };

  const getCurrentTurnPlayer = (): Player | undefined => {
    if (!multiplayerSession) return undefined;
    return multiplayerSession.players.find(p => p.id === multiplayerSession.currentTurn);
  };

  const isMyTurn = (): boolean => {
    if (!multiplayerSession) return false;
    const currentUser = multiplayerSession.players.find(p => p.isCurrentUser);
    return multiplayerSession.currentTurn === currentUser?.id;
  };

  // Lobby view - not in a session
  if (!multiplayerSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Multiplayer Memory
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Session */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                Create Session
              </h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreating || !isConnected}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Session'}
                </Button>
                
                {!isConnected && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Connecting to server...
                  </p>
                )}
              </div>
            </Card>

            {/* Join Session */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                Join Session
              </h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Session code"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                
                <input
                  type="text"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                
                <Button
                  onClick={handleJoinSession}
                  disabled={isJoining || !isConnected}
                  className="w-full"
                  variant="secondary"
                >
                  {isJoining ? 'Joining...' : 'Join Session'}
                </Button>
              </div>
            </Card>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // In session view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        {/* Session Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Session: {multiplayerSession.code}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {multiplayerSession.players.length} / {multiplayerSession.maxPlayers} players
              </p>
            </div>
            
            <Button onClick={handleLeaveSession} variant="secondary" size="sm">
              Leave Session
            </Button>
          </div>

          {/* Players List */}
          <Card className="p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Players</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {multiplayerSession.players.map((player) => (
                <div
                  key={player.id}
                  className={`p-2 rounded-md text-sm font-medium text-center ${
                    player.isCurrentUser
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } ${
                    multiplayerSession.currentTurn === player.id
                      ? 'ring-2 ring-green-500'
                      : ''
                  }`}
                >
                  {player.name}
                  {player.isCurrentUser && ' (You)'}
                  {multiplayerSession.currentTurn === player.id && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Current Turn
                    </div>
                  )}
                  <div className="text-xs mt-1">
                    Score: {player.score || 0}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Game Status */}
          {multiplayerSession.status === 'waiting' && (
            <Card className="p-4 mb-4 bg-amber-50 dark:bg-amber-900/20">
              <p className="text-amber-800 dark:text-amber-200 text-center">
                Waiting for more players...
                {multiplayerSession.players.length >= 2 && (
                  <Button onClick={handleStartGame} className="ml-4" size="sm">
                    Start Game
                  </Button>
                )}
              </p>
            </Card>
          )}

          {multiplayerSession.status === 'active' && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <Timer timeLeft={timer} />
                <MoveCounter moves={moveCount} />
              </div>
              
              <div className="text-right">
                {getCurrentTurnPlayer() && (
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {isMyTurn() ? "Your turn!" : `${getCurrentTurnPlayer()?.name}'s turn`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game Board */}
        {multiplayerSession.status === 'active' && gameBoard && (
          <div className="flex justify-center">
            <Grid 
              cards={gameBoard} 
              onCardClick={handleCardClick}
              disabled={!isMyTurn()}
            />
          </div>
        )}

        {multiplayerSession.status === 'finished' && (
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Game Finished!
            </h2>
            <div className="space-y-2">
              {multiplayerSession.players
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded-md ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {index === 0 ? '🏆' : `#${index + 1}`} {player.name}: {player.score || 0} points
                  </div>
                ))}
            </div>
          </Card>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
