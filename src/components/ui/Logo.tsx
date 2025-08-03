import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  color?: 'white' | 'black' | 'green';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 120, height = 25, color = 'green', className = '' }) => {
  // Choix du logo selon la couleur demandée
  const getLogoSrc = () => {
    switch (color) {
      case 'white':
        return '/evenzi_logo_white.png';
      case 'black':
        return '/evenzi_logo.png';
      case 'green':
      default:
        return '/evenzi_logo.png';
    }
  };

  return (
    <Image
      src={getLogoSrc()}
      alt="Evenzi"
      width={width}
      height={height}
      className={className}
      priority
      style={{
        width: 'auto',
        height: 'auto',
        maxWidth: width,
        maxHeight: height,
      }}
    />
  );
};

export default Logo; 