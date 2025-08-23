import React from 'react';
import { motion } from 'framer-motion';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export interface CardProps {
  id: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  onFlip: (id: string) => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  id,
  content,
  isFlipped,
  isMatched,
  onFlip,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onFlip(id);
    }
  };

  useKeyboardShortcuts({
    ' ': handleClick,
    Enter: handleClick
  });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      className={`
        relative w-full h-24 cursor-pointer
        ${disabled || isFlipped || isMatched ? 'cursor-not-allowed' : 'hover:scale-105'}
        transition-transform duration-200
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Memory card ${id}${isFlipped ? ', flipped' : ''}${isMatched ? ', matched' : ''}`}
      aria-pressed={isFlipped}
      whileHover={!disabled && !isFlipped && !isMatched ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isFlipped && !isMatched ? { scale: 0.95 } : {}}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Back face (default state) */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-lg shadow-md
            flex items-center justify-center text-2xl font-bold
            backface-hidden
            ${isMatched 
              ? 'bg-green-500 text-white' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            }
            border-2 border-white/20
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="select-none">?</span>
        </div>

        {/* Front face (content) */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-lg shadow-md
            flex items-center justify-center text-3xl
            backface-hidden rotate-y-180
            ${isMatched 
              ? 'bg-green-100 text-green-800 border-green-300' 
              : 'bg-white text-gray-800 border-gray-200'
            }
            border-2
          `}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <span className="select-none">{content}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Card;
