import React from 'react';

interface IconProps {
  name: string;
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24
};

const iconPaths: Record<string, string> = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  emoji: 'M8 14s1.5 2 4 2 4-2 4-2m-6-4h.01M14 10h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
  attach: 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49',
  close: 'M6 18L18 6M6 6l12 12',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  call: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  video: 'M23 7l-7 5 7 5V7z M16 5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5z',
  'video-off': 'M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10 M1 1l22 22',
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8',
  'mic-off': 'M1 1l22 22 M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6 M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23 M12 19v4 M8 23h8',
  'phone-off': 'M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67m-2.67-3.34a19.79 19.79 0 01-3.07-8.63A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91 M23 1L1 23'
};

const Icon: React.FC<IconProps> = ({ name, size = 20, className = '' }) => {
  const path = iconPaths[name];
  
  if (!path) {
    return null;
  }

  const actualSize = typeof size === 'string' ? sizeMap[size] : size;

  return (
    <svg
      width={actualSize}
      height={actualSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
};

export default Icon;
