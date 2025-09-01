import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageReaction } from '@/core/contracts';
import { EmojiPicker } from './EmojiPicker';
import { reactionsService } from '@/services/reactions.service';
import { useAuth } from '@/providers/AuthProvider';
import { events } from '@/core/events';
import { debugLog } from '@/core/utils';

interface ReactionPickerProps {
  messageId: string;
  channelId?: string;
  existingReactions?: MessageReaction[];
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😠', '🎉', '👏'];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  channelId,
  existingReactions = [],
  onEmojiSelect,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const quickReactionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Load recent emojis on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reaction_picker_recent');
      if (stored) {
        setRecentEmojis(JSON.parse(stored));
      }
    } catch (error) {
      debugLog('warn', 'Failed to load recent reactions', error);
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(QUICK_REACTIONS.length - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < QUICK_REACTIONS.length) {
            handleQuickReactionClick(QUICK_REACTIONS[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, onClose]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && quickReactionRefs.current[focusedIndex]) {
      quickReactionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const addToRecent = useCallback((emoji: string) => {
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      const updated = [emoji, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('reaction_picker_recent', JSON.stringify(updated));
      } catch (error) {
        debugLog('warn', 'Failed to save recent reactions', error);
      }
      return updated;
    });
  }, []);

  const getUserReaction = useCallback((emoji: string) => {
    return user ? existingReactions.find(r => r.emoji === emoji && r.userId === user.id) : null;
  }, [existingReactions, user]);

  const getReactionCount = useCallback((emoji: string) => {
    return existingReactions.filter(r => r.emoji === emoji).length;
  }, [existingReactions]);

  const handleQuickReactionClick = useCallback(async (emoji: string) => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const existingReaction = getUserReaction(emoji);
      
      if (existingReaction) {
        // Remove reaction
        const result = await reactionsService.removeReaction(messageId, emoji);
        if (result.ok) {
          events.emit('reaction:removed', {
            messageId,
            emoji,
            userId: user.id
          });
        } else {
          debugLog('error', 'Failed to remove reaction', result.error);
        }
      } else {
        // Add reaction
        const result = await reactionsService.addReaction(messageId, emoji);
        if (result.ok) {
          addToRecent(emoji);
          events.emit('reaction:added', {
            messageId,
            emoji,
            userId: user.id
          });
        } else {
          debugLog('error', 'Failed to add reaction', result.error);
        }
      }
      
      onEmojiSelect(emoji);
      onClose?.();
    } catch (error) {
      debugLog('error', 'Error handling reaction', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, getUserReaction, messageId, addToRecent, onEmojiSelect, onClose]);

  const handleEmojiPickerSelect = useCallback((emoji: string) => {
    addToRecent(emoji);
    onEmojiSelect(emoji);
    setShowEmojiPicker(false);
  }, [addToRecent, onEmojiSelect]);

  const allQuickReactions = React.useMemo(() => {
    // Combine recent emojis with default quick reactions, removing duplicates
    const combined = [...recentEmojis, ...QUICK_REACTIONS];
    return Array.from(new Set(combined)).slice(0, 8);
  }, [recentEmojis]);

  return (
    <div
      ref={containerRef}
      className={`reaction-picker bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}
      role="dialog"
      aria-label="Add reaction"
    >
      {!showEmojiPicker ? (
        <div className="p-3">
          {/* Quick reactions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {allQuickReactions.map((emoji, index) => {
              const hasUserReaction = !!getUserReaction(emoji);
              const count = getReactionCount(emoji);
              
              return (
                <button
                  key={emoji}
                  ref={el => quickReactionRefs.current[index] = el}
                  onClick={() => handleQuickReactionClick(emoji)}
                  disabled={isLoading}
                  className={`
                    relative flex items-center justify-center min-w-[2.5rem] h-10 px-2 rounded-md text-lg
                    transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${hasUserReaction 
                      ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200' 
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }
                    ${focusedIndex === index ? 'ring-2 ring-blue-500' : ''}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={`${emoji} ${count > 0 ? `(${count})` : ''}`}
                  aria-label={`${hasUserReaction ? 'Remove' : 'Add'} ${emoji} reaction${count > 0 ? `, ${count} total` : ''}`}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(-1)}
                >
                  <span className="select-none">{emoji}</span>
{count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gray-500 dark:bg-gray-400 text-white dark:text-gray-900 text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-medium">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* More emojis button */}
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Show more emojis"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>More emojis</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Choose an emoji
            </h3>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Go back to quick reactions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <EmojiPicker
            onEmojiSelect={handleEmojiPickerSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ReactionPicker;
