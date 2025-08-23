import React, { useState, useRef, useEffect } from 'react';

interface EmojiPickerProps {
  onSelect?: (emoji: string) => void;
  onEmojiSelect?: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
}

const EMOJI_LIST = [
  { emoji: '👍', label: 'thumbs up' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '😂', label: 'laughing' },
  { emoji: '🎉', label: 'party' },
  { emoji: '😮', label: 'surprised' },
  { emoji: '😢', label: 'sad' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '👏', label: 'clapping' },
  { emoji: '🤔', label: 'thinking' },
  { emoji: '💯', label: 'hundred' },
  { emoji: '👀', label: 'eyes' },
  { emoji: '🚀', label: 'rocket' }
];

export default function EmojiPicker({ onSelect, onEmojiSelect, className = '' }: EmojiPickerProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, EMOJI_LIST.length);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (index + 1) % EMOJI_LIST.length;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = index === 0 ? EMOJI_LIST.length - 1 : index - 1;
        break;
      case 'ArrowDown':
        event.preventDefault();
        newIndex = index + 4 >= EMOJI_LIST.length ? index % 4 : index + 4;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = index - 4 < 0 ? Math.floor(EMOJI_LIST.length / 4) * 4 + (index % 4) : index - 4;
        if (newIndex >= EMOJI_LIST.length) {
          newIndex = newIndex - 4;
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(EMOJI_LIST[index].emoji);
        onEmojiSelect?.(EMOJI_LIST[index].emoji);
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    buttonRefs.current[newIndex]?.focus();
  };

  const handleClick = (emoji: string) => {
    onSelect?.(emoji);
    onEmojiSelect?.(emoji);
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <div 
      className={`grid grid-cols-4 gap-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}
      role="grid"
      aria-label="Emoji picker"
    >
      {EMOJI_LIST.map((item, index) => (
        <button
          key={item.emoji}
          ref={(el) => (buttonRefs.current[index] = el)}
          onClick={() => handleClick(item.emoji)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${item.emoji} ${item.label}`}
          tabIndex={index === focusedIndex ? 0 : -1}
          role="gridcell"
        >
          <span className="text-lg" role="img" aria-label={item.label}>
            {item.emoji}
          </span>
        </button>
      ))}
    </div>
  );
}
