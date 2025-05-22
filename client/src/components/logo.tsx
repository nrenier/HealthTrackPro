
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ className = '', size = 'medium' }: LogoProps) {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-32'
  };

  // Prova percorsi alternativi se l'immagine principale non si carica
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src.endsWith('/images/logo.png')) {
      img.src = '/client/public/images/logo.png';
    } else if (img.src.endsWith('/client/public/images/logo.png')) {
      img.src = '/logo.png'; // Ultimo tentativo
    }
  };

  return (
    <img 
      src="/images/logo.png" 
      alt="EndoDiary Logo" 
      className={`${sizeClasses[size]} ${className}`}
      onError={handleImageError}
    />
  );
}
