"use client";

import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

interface SponsorLogoProps {
  src?: string | null;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showFallback?: boolean;
}

export function SponsorLogo({ 
  src, 
  alt, 
  className = "", 
  size = "md",
  showFallback = true 
}: SponsorLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-14 h-14"
  };

  const containerSizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8"
  };

  // Si pas de src ou erreur de chargement, afficher le fallback
  if (!src || hasError) {
    if (!showFallback) return null;
    
    return (
      <div className={`${containerSizeClasses[size]} bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 ${className}`}>
        <div className="flex flex-col items-center">
          <PhotoIcon className={`${iconSizeClasses[size]} text-gray-400`} />
          {size === "lg" && (
            <span className="text-xs text-gray-400 mt-1">Logo</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerSizeClasses[size]} bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#81B441] rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} object-contain rounded ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => {
          setIsLoading(false);
          console.log('✅ Logo sponsor chargé avec succès:', alt, src);
        }}
        onError={(e) => {
          console.error('❌ Erreur chargement logo sponsor:', alt, src);
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
