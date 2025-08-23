import React from 'react';
import { formatDate } from '../../utils/formatDate';

interface PresenceState {
  online: boolean;
  lastSeen?: Date;
}

interface PresenceIndicatorProps {
  presence: PresenceState;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  presence,
  className = '',
}) => {
  const tooltipText = presence.online 
    ? 'Online' 
    : presence.lastSeen 
      ? `Last seen ${formatDate(presence.lastSeen)}`
      : 'Offline';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      title={tooltipText}
      role="status"
      aria-label={tooltipText}
      tabIndex={0}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          presence.online ? 'bg-green-400' : 'bg-gray-400'
        }`}
      />
      <span className="sr-only">
        {presence.online ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default PresenceIndicator;
