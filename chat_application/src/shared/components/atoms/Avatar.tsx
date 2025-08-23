import React, { useState } from 'react';
import { generateId } from '../../../utils/generateId';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 40, 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const commonStyles = `
    inline-flex items-center justify-center
    rounded-full text-white font-medium
    ${className}
  `;

  const sizeStyles = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.max(12, size * 0.4)}px`
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        title={name}
        className={`${commonStyles} object-cover`}
        style={sizeStyles}
        onError={handleImageError}
        role="img"
        aria-label={`Avatar for ${name}`}
      />
    );
  }

  return (
    <div
      className={`${commonStyles} ${getBackgroundColor(name)}`}
      style={sizeStyles}
      role="img"
      aria-label={`Avatar for ${name}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
