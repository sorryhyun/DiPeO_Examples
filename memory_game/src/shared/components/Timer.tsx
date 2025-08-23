import React from 'react';
import { useStore } from '../../state/store';

interface TimerProps {
  seconds?: number;
  running?: boolean;
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ seconds: propSeconds, running: propRunning, className = '' }) => {
  // Use props if provided, otherwise fall back to store
  const storeSeconds = useStore((state) => state.timer.seconds);
  const storeRunning = useStore((state) => state.timer.running);
  
  const seconds = propSeconds ?? storeSeconds;
  const running = propRunning ?? storeRunning;

  // Format seconds into mm:ss
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`flex items-center justify-center font-mono text-lg font-semibold ${className}`}
      role="timer"
      aria-label={`Game timer: ${formatTime(seconds)}`}
      aria-live="polite"
    >
      <div className={`px-3 py-1 rounded-md ${
        running 
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      }`}>
        <span className="tabular-nums">
          {formatTime(seconds)}
        </span>
      </div>
    </div>
  );
};

export default Timer;
