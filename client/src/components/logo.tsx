
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

  return (
    <img 
      src="/images/logo.png" 
      alt="EndoDiary Logo" 
      className={`${sizeClasses[size]} ${className}`} 
    />
  );
}
