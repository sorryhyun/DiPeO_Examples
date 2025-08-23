import React, { useState } from 'react';

interface AvatarProps {
  name?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ 
  name = '', 
  src, 
  alt,
  size = 'md' 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const getInitials = (name: string): string => {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full 
    border-2 
    border-gray-200 
    dark:border-gray-700
    flex 
    items-center 
    justify-center 
    font-semibold 
    text-gray-700 
    dark:text-gray-300
    bg-gradient-to-br 
    from-gray-100 
    to-gray-200 
    dark:from-gray-700 
    dark:to-gray-800
    overflow-hidden
    flex-shrink-0
  `.replace(/\s+/g, ' ').trim();

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || (name ? `${name}'s avatar` : 'User avatar')}
        className={baseClasses}
        onError={handleImageError}
        loading="lazy"
      />
    );
  }

  return (
    <div 
      className={baseClasses}
      title={name ? `${name}'s avatar` : 'User avatar'}
      role="img"
      aria-label={name ? `${name}'s avatar` : 'User avatar'}
    >
      {getInitials(name)}
    </div>
  );
};
