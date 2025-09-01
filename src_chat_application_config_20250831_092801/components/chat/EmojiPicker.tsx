import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { appConfig } from '@/app/config';

// Basic emoji data structure
export interface Emoji {
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
  skinTones?: string[];
}

// Emoji categories
export type EmojiCategory = 
  | 'people' 
  | 'nature' 
  | 'food' 
  | 'activity' 
  | 'travel' 
  | 'objects' 
  | 'symbols' 
  | 'flags'
  | 'recent';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
  searchQuery?: string;
  className?: string;
  maxRecent?: number;
  showSkinTones?: boolean;
}

// Basic emoji dataset - in a real app this might come from a larger emoji library
const EMOJI_DATA: Record<EmojiCategory, Emoji[]> = {
  recent: [], // Will be populated from localStorage
  people: [
    { emoji: '😀', name: 'grinning face', category: 'people', keywords: ['smile', 'happy'] },
    { emoji: '😃', name: 'grinning face with big eyes', category: 'people', keywords: ['smile', 'happy', 'joy'] },
    { emoji: '😄', name: 'grinning face with smiling eyes', category: 'people', keywords: ['smile', 'happy', 'joy'] },
    { emoji: '😁', name: 'beaming face with smiling eyes', category: 'people', keywords: ['smile', 'happy', 'joy'] },
    { emoji: '😆', name: 'grinning squinting face', category: 'people', keywords: ['happy', 'joy', 'laugh'] },
    { emoji: '😅', name: 'grinning face with sweat', category: 'people', keywords: ['happy', 'sweat', 'relief'] },
    { emoji: '🤣', name: 'rolling on the floor laughing', category: 'people', keywords: ['laugh', 'joy'] },
    { emoji: '😂', name: 'face with tears of joy', category: 'people', keywords: ['laugh', 'cry', 'joy'] },
    { emoji: '🙂', name: 'slightly smiling face', category: 'people', keywords: ['smile', 'happy'] },
    { emoji: '😊', name: 'smiling face with smiling eyes', category: 'people', keywords: ['smile', 'happy', 'blush'] },
    { emoji: '😇', name: 'smiling face with halo', category: 'people', keywords: ['smile', 'angel', 'innocent'] },
    { emoji: '👍', name: 'thumbs up', category: 'people', keywords: ['like', 'approve', 'good'], skinTones: ['👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'] },
    { emoji: '👎', name: 'thumbs down', category: 'people', keywords: ['dislike', 'bad'], skinTones: ['👎🏻', '👎🏼', '👎🏽', '👎🏾', '👎🏿'] },
    { emoji: '👏', name: 'clapping hands', category: 'people', keywords: ['clap', 'applause'], skinTones: ['👏🏻', '👏🏼', '👏🏽', '👏🏾', '👏🏿'] },
    { emoji: '🙌', name: 'raising hands', category: 'people', keywords: ['celebration', 'praise'], skinTones: ['🙌🏻', '🙌🏼', '🙌🏽', '🙌🏾', '🙌🏿'] },
  ],
  nature: [
    { emoji: '🌱', name: 'seedling', category: 'nature', keywords: ['plant', 'growth'] },
    { emoji: '🌿', name: 'herb', category: 'nature', keywords: ['plant', 'green'] },
    { emoji: '🍃', name: 'leaf fluttering in wind', category: 'nature', keywords: ['leaf', 'wind'] },
    { emoji: '🌳', name: 'deciduous tree', category: 'nature', keywords: ['tree', 'nature'] },
    { emoji: '🌲', name: 'evergreen tree', category: 'nature', keywords: ['tree', 'pine'] },
    { emoji: '🌴', name: 'palm tree', category: 'nature', keywords: ['tree', 'tropical'] },
    { emoji: '🌸', name: 'cherry blossom', category: 'nature', keywords: ['flower', 'spring'] },
    { emoji: '🌺', name: 'hibiscus', category: 'nature', keywords: ['flower', 'tropical'] },
    { emoji: '🌻', name: 'sunflower', category: 'nature', keywords: ['flower', 'yellow'] },
    { emoji: '🌹', name: 'rose', category: 'nature', keywords: ['flower', 'love'] },
  ],
  food: [
    { emoji: '🍎', name: 'red apple', category: 'food', keywords: ['fruit', 'healthy'] },
    { emoji: '🍕', name:'pizza', category: 'food', keywords: ['food', 'cheese'] },
    { emoji: '🍔', name: 'hamburger', category: 'food', keywords: ['burger', 'fast food'] },
    { emoji: '🍟', name: 'french fries', category: 'food', keywords: ['fries', 'fast food'] },
    { emoji: '🍦', name: 'soft ice cream', category: 'food', keywords: ['ice cream', 'dessert'] },
    { emoji: '🍰', name: 'shortcake', category: 'food', keywords: ['cake', 'dessert'] },
    { emoji: '🎂', name: 'birthday cake', category: 'food', keywords: ['cake', 'birthday'] },
    { emoji: '🍪', name: 'cookie', category: 'food', keywords: ['cookie', 'dessert'] },
    { emoji: '☕', name: 'hot beverage', category: 'food', keywords: ['coffee', 'tea', 'hot'] },
    { emoji: '🍺', name: 'beer mug', category: 'food', keywords: ['beer', 'drink'] },
  ],
  activity: [
    { emoji: '⚽', name: 'soccer ball', category: 'activity', keywords: ['football', 'sport'] },
    { emoji: '🏀', name: 'basketball', category: 'activity', keywords: ['sport', 'ball'] },
    { emoji: '🏈', name: 'american football', category: 'activity', keywords: ['football', 'sport'] },
    { emoji: '⚾', name: 'baseball', category: 'activity', keywords: ['sport', 'ball'] },
    { emoji: '🎮', name: 'video game', category: 'activity', keywords: ['game', 'controller'] },
    { emoji: '🎯', name: 'direct hit', category: 'activity', keywords: ['target', 'bullseye'] },
    { emoji: '🎲', name: 'game die', category: 'activity', keywords: ['dice', 'game'] },
    { emoji: '🎸', name: 'guitar', category: 'activity', keywords: ['music', 'instrument'] },
    { emoji: '🎤', name: 'microphone', category: 'activity', keywords: ['music', 'singing'] },
    { emoji: '🎧', name: 'headphone', category: 'activity', keywords: ['music', 'audio'] },
  ],
  travel: [
    { emoji: '🚗', name: 'automobile', category: 'travel', keywords: ['car', 'vehicle'] },
    { emoji: '🚕', name: 'taxi', category: 'travel', keywords: ['taxi', 'car'] },
    { emoji: '🚙', name: 'sport utility vehicle', category: 'travel', keywords: ['suv', 'car'] },
    { emoji: '🚌', name: 'bus', category: 'travel', keywords: ['bus', 'transport'] },
    { emoji: '🚎', name: 'trolleybus', category: 'travel', keywords: ['bus', 'electric'] },
    { emoji: '🏠', name: 'house', category: 'travel', keywords: ['home', 'building'] },
    { emoji: '🏡', name: 'house with garden', category: 'travel', keywords: ['home', 'house'] },
    { emoji: '🏢', name: 'office building', category: 'travel', keywords: ['building', 'work'] },
    { emoji: '🏣', name: 'japanese post office', category: 'travel', keywords: ['building', 'post'] },
    { emoji: '🏤', name: 'post office', category: 'travel', keywords: ['building', 'mail'] },
  ],
  objects: [
    { emoji: '📱', name: 'mobile phone', category: 'objects', keywords: ['phone', 'mobile'] },
    { emoji: '💻', name: 'laptop computer', category: 'objects', keywords: ['computer', 'laptop'] },
    { emoji: '🖥️', name: 'desktop computer', category: 'objects', keywords: ['computer', 'desktop'] },
    { emoji: '⌚', name: 'watch', category: 'objects', keywords: ['time', 'watch'] },
    { emoji: '📷', name: 'camera', category: 'objects', keywords: ['photo', 'camera'] },
    { emoji: '📺', name: 'television', category: 'objects', keywords: ['tv', 'screen'] },
    { emoji: '🎁', name: 'wrapped gift', category: 'objects', keywords: ['gift', 'present'] },
    { emoji: '💡', name: 'light bulb', category: 'objects', keywords: ['idea', 'light'] },
    { emoji: '🔑', name: 'key', category: 'objects', keywords: ['key', 'unlock'] },
    { emoji: '🔒', name: 'locked', category: 'objects', keywords: ['lock', 'secure'] },
  ],
  symbols: [
    { emoji: '❤️', name: 'red heart', category: 'symbols', keywords: ['love', 'heart'] },
    { emoji: '💛', name: 'yellow heart', category: 'symbols', keywords: ['love', 'heart'] },
    { emoji: '💚', name: 'green heart', category: 'symbols', keywords: ['love', 'heart'] },
    { emoji: '💙', name: 'blue heart', category: 'symbols', keywords: ['love', 'heart'] },
    { emoji: '💜', name: 'purple heart', category: 'symbols', keywords: ['love', 'heart'] },
    { emoji: '✨', name: 'sparkles', category: 'symbols', keywords: ['stars', 'sparkle'] },
    { emoji: '⭐', name: 'star', category: 'symbols', keywords: ['star', 'favorite'] },
    { emoji: '🌟', name: 'glowing star', category: 'symbols', keywords: ['star', 'glowing'] },
    { emoji: '✅', name: 'check mark button', category: 'symbols', keywords: ['check', 'done'] },
    { emoji: '❌', name: 'cross mark', category: 'symbols', keywords: ['x', 'wrong'] },
  ],
  flags: [
    { emoji: '🏁', name: 'chequered flag', category: 'flags', keywords: ['flag', 'race'] },
    { emoji: '🚩', name: 'triangular flag', category: 'flags', keywords: ['flag', 'warning'] },
    { emoji: '🏳️', name: 'white flag', category: 'flags', keywords: ['flag', 'surrender'] },
    { emoji: '🏴', name: 'black flag', category: 'flags', keywords: ['flag', 'pirate'] },
    { emoji: '🇺🇸', name: 'flag: United States', category: 'flags', keywords: ['flag', 'us', 'america'] },
    { emoji: '🇬🇧', name: 'flag: United Kingdom', category: 'flags', keywords: ['flag', 'uk', 'britain'] },
    { emoji: '🇨🇦', name: 'flag: Canada', category: 'flags', keywords: ['flag', 'canada'] },
    { emoji: '🇫🇷', name: 'flag: France', category: 'flags', keywords: ['flag', 'france'] },
    { emoji: '🇩🇪', name: 'flag: Germany', category: 'flags', keywords: ['flag', 'germany'] },
    { emoji: '🇯🇵', name: 'flag: Japan', category: 'flags', keywords: ['flag', 'japan'] },
  ],
};

const CATEGORY_ICONS: Record<EmojiCategory, string> = {
  recent: '🕐',
  people: '😀',
  nature: '🌱',
  food: '🍎',
  activity: '⚽',
  travel: '🚗',
  objects: '💻',
  symbols: '❤️',
  flags: '🏁',
};

const CATEGORY_LABELS: Record<EmojiCategory, string> = {
  recent: 'Recently Used',
  people: 'People & Body',
  nature: 'Animals & Nature',
  food: 'Food & Drink',
  activity: 'Activities',
  travel: 'Travel & Places',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

const STORAGE_KEY = 'emoji_picker_recent';

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  onClose,
  searchQuery = '',
  className = '',
  maxRecent = 21,
  showSkinTones = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>('recent');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [selectedSkinTone, setSelectedSkinTone] = useState<number>(0); // 0 = default, 1-5 = skin tones
  const [focusedEmojiIndex, setFocusedEmojiIndex] = useState<number>(-1);
  const [showingSkinTones, setShowingSkinTones] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const emojiGridRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<EmojiCategory, HTMLDivElement | null>>({} as Record<EmojiCategory, HTMLDivElement | null>);

  // Load recent emojis from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentEmojis(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent emojis:', error);
    }
  }, []);

  // Save recent emojis to localStorage
  const saveRecentEmojis = useCallback((emojis: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emojis.slice(0, maxRecent)));
    } catch (error) {
      console.warn('Failed to save recent emojis:', error);
    }
  }, [maxRecent]);

  // Add emoji to recent list
  const addToRecent = useCallback((emoji: string) => {
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      const updated = [emoji, ...filtered].slice(0, maxRecent);
      saveRecentEmojis(updated);
      return updated;
    });
  }, [maxRecent, saveRecentEmojis]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    addToRecent(emoji);
    onEmojiSelect(emoji);
    onClose?.();
  }, [addToRecent, onEmojiSelect, onClose]);

  // Get all emojis with recent data
  const allEmojiData = useMemo(() => {
    const data = { ...EMOJI_DATA };
    data.recent = recentEmojis.map(emoji => ({
      emoji,
      name: 'recent emoji',
      category: 'recent' as const,
      keywords: [],
    }));
    return data;
  }, [recentEmojis]);

  // Filter emojis based on search query
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return allEmojiData;

    const query = searchQuery.toLowerCase().trim();
    const filtered: Record<EmojiCategory, Emoji[]> = {} as Record<EmojiCategory, Emoji[]>;

    Object.entries(allEmojiData).forEach(([category, emojis]) => {
      filtered[category as EmojiCategory] = emojis.filter(emoji =>
        emoji.name.toLowerCase().includes(query) ||
        emoji.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    });

    return filtered;
  }, [allEmojiData, searchQuery]);

  // Get flat list of visible emojis for keyboard navigation
  const visibleEmojis = useMemo(() => {
    const categories: EmojiCategory[] = searchQuery ? 
      Object.keys(filteredEmojis).filter(cat => filteredEmojis[cat as EmojiCategory].length > 0) as EmojiCategory[] :
      [activeCategory];

    return categories.flatMap(category => 
      filteredEmojis[category].map((emoji, index) => ({
        ...emoji,
        category,
        globalIndex: index,
      }))
    );
  }, [filteredEmojis, activeCategory, searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!visibleEmojis.length) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedEmojiIndex(prev => (prev + 1) % visibleEmojis.length);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedEmojiIndex(prev => (prev - 1 + visibleEmojis.length) % visibleEmojis.length);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedEmojiIndex(prev => {
          const cols = 8; // Assuming 8 emojis per row
          return Math.min(prev + cols, visibleEmojis.length - 1);
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedEmojiIndex(prev => {
          const cols = 8;
          return Math.max(prev - cols, 0);
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedEmojiIndex >= 0 && focusedEmojiIndex < visibleEmojis.length) {
          const emoji = visibleEmojis[focusedEmojiIndex];
          handleEmojiSelect(emoji.emoji);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose?.();
        break;
    }
  }, [visibleEmojis, focusedEmojiIndex, handleEmojiSelect, onClose]);

  // Auto-focus container for keyboard navigation
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  // Handle skin tone selection
  const handleSkinToneSelect = useCallback((emoji: Emoji, toneIndex: number) => {
    if (emoji.skinTones && toneIndex > 0 && toneIndex <= emoji.skinTones.length) {
      handleEmojiSelect(emoji.skinTones[toneIndex - 1]);
    } else {
      handleEmojiSelect(emoji.emoji);
    }
    setShowingSkinTones(null);
  }, [handleEmojiSelect]);

  // Render emoji button
  const renderEmoji = useCallback((emoji: Emoji, index: number, globalIndex: number) => {
    const isFocused = globalIndex === focusedEmojiIndex;
    const showTones = showingSkinTones === `${emoji.category}-${index}`;

    return (
      <div key={`${emoji.category}-${index}`} className="relative">
        <button
          className={`
            relative w-8 h-8 flex items-center justify-center rounded text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${isFocused ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : ''}
          `}
          title={emoji.name}
          onClick={() => {
            if (showSkinTones && emoji.skinTones?.length) {
              setShowingSkinTones(`${emoji.category}-${index}`);
            } else {
              handleEmojiSelect(emoji.emoji);
            }
          }}
          onContextMenu={(e) => {
            if (emoji.skinTones?.length) {
              e.preventDefault();
              setShowingSkinTones(showTones ? null : `${emoji.category}-${index}`);
            }
          }}
          aria-label={emoji.name}
        >
          {emoji.emoji}
        </button>

        {/* Skin tone picker */}
        {showTones && emoji.skinTones && (
          <div className="absolute top-full left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 flex gap-1">
            <button
              className="w-6 h-6 flex items-center justify-center rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleSkinToneSelect(emoji, 0)}
              title="Default skin tone"
            >
              {emoji.emoji}
            </button>
            {emoji.skinTones.map((toneEmoji, toneIndex) => (
              <button
                key={toneIndex}
                className="w-6 h-6 flex items-center justify-center rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSkinToneSelect(emoji, toneIndex + 1)}
                title={`Skin tone ${toneIndex + 1}`}
              >
                {toneEmoji}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [focusedEmojiIndex, showingSkinTones, handleEmojiSelect, handleSkinToneSelect, showSkinTones]);

  return (
    <div
      ref={containerRef}
      className={`emoji-picker bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}
      style={{ width: '320px', height: '400px' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label="Emoji picker"
    >
      {/* Categories */}
      {!searchQuery && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          {Object.entries(CATEGORY_ICONS).map(([category, icon]) => {
            const categoryKey = category as EmojiCategory;
            const isActive = activeCategory === categoryKey;
            const hasEmojis = allEmojiData[categoryKey]?.length > 0;
            
            if (!hasEmojis && categoryKey !== 'recent') return null;

            return (
              <button
                key={category}
                className={`
                  flex-1 p-3 text-lg transition-colors border-b-2
                  ${isActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                  }
                `}
                onClick={() => setActiveCategory(categoryKey)}
                title={CATEGORY_LABELS[categoryKey]}
                aria-label={CATEGORY_LABELS[categoryKey]}
                disabled={!hasEmojis}
              >
                {icon}
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto p-3" ref={emojiGridRef}>
        {searchQuery ? (
          // Search results
          <div className="space-y-4">
            {Object.entries(filteredEmojis).map(([category, emojis]) => {
              if (emojis.length === 0) return null;
              
              return (
                <div key={category} ref={el => categoryRefs.current[category as EmojiCategory] = el}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    {CATEGORY_LABELS[category as EmojiCategory]}
                  </h3>
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => 
                      renderEmoji(emoji, index, visibleEmojis.findIndex(e => e === emoji))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Category view
          <div>
            {activeCategory === 'recent' && recentEmojis.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm">
                No recently used emojis
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis[activeCategory]?.map((emoji, index) => 
                  renderEmoji(emoji, index, index)
                )}
              </div>
            )}
          </div>
        )}

        {visibleEmojis.length === 0 && searchQuery && (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm">
            No emojis found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;
