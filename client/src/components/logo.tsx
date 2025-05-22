import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Logo({ className = '', size = 'medium' }: LogoProps) {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-32'
  };

  // Utilizziamo uno stato per gestire il percorso dell'immagine
  const [imageSrc, setImageSrc] = useState('/images/logo.png');

  // Prova percorsi alternativi se l'immagine principale non si carica
  const handleImageError = () => {
    if (imageSrc === '/images/logo.png') {
      setImageSrc('/client/public/images/logo.png');
    } else if (imageSrc === '/client/public/images/logo.png') {
      setImageSrc('./images/logo.png');
    } else if (imageSrc === './images/logo.png') {
      setImageSrc('../images/logo.png');
    } else if (imageSrc === '../images/logo.png') {
      setImageSrc('/public/images/logo.png');
    } else if (imageSrc === '/public/images/logo.png') {
      // Ultimo tentativo - mostra un testo alternativo se tutte le opzioni falliscono
      setImageSrc(''); // Imposta a vuoto per mostrare testo alternativo
    }
  };

  return imageSrc ? (
    <img 
      src={imageSrc} 
      alt="EndoDiary Logo" 
      className={`${sizeClasses[size]} ${className}`}
      onError={handleImageError}
    />
  ) : (
    // Fallback quando nessuna immagine può essere caricata
    <div className={`${sizeClasses[size]} ${className} bg-primary-100 flex items-center justify-center rounded-md`}>
      <span className="font-semibold text-primary">EndoDiary</span>
    </div>
  );
}

// Esporta il componente come default per compatibilità
export default Logo;