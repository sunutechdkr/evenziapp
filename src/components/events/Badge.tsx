'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

interface BadgeProps {
  firstName: string;
  lastName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  registrationType: string;
  shortCode?: string;
}

const Badge = ({
  firstName,
  lastName,
  eventName,
  eventDate,
  eventLocation,
  registrationType,
  shortCode,
}: BadgeProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const downloadBadge = async () => {
    if (!badgeRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(badgeRef.current, {
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `badge-${firstName}-${lastName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating badge:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ID du participant à afficher
  const displayCode = shortCode || "";

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={badgeRef}
        className="w-[85mm] h-[54mm] bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 relative font-sans"
      >
        {/* Decorative elements */}
        <div className="absolute w-40 h-40 -right-20 -top-20 rounded-full bg-[#81B441]/10"></div>
        <div className="absolute w-24 h-24 -left-12 -bottom-12 rounded-full bg-[#81B441]/10"></div>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#81B441] via-[#9aca65] to-[#81B441]"></div>
        
        <div className="flex h-full">
          {/* Left column */}
          <div className="w-2/5 bg-gradient-to-br from-[#81B441] to-[#6a9834] text-white p-4 relative flex flex-col justify-between">
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5 mix-blend-overlay"></div>
            
            <div>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2 backdrop-blur-sm">
                  <span className="text-white font-bold">In</span>
                </div>
                <h1 className="text-lg font-bold tracking-tight">event</h1>
              </div>
              
              <h2 className="text-white font-bold mb-1 text-lg drop-shadow-sm line-clamp-2">{eventName}</h2>
              <p className="text-white/80 text-xs mb-1">{eventDate}</p>
              <p className="text-white/80 text-xs">{eventLocation}</p>
            </div>
            
            <div className="bg-white/10 text-white backdrop-blur-sm rounded px-2 py-1 text-xs mt-2 inline-block">
              {registrationType}
            </div>
          </div>
          
          {/* Right column */}
          <div className="w-3/5 p-4 bg-gradient-to-br from-white to-gray-50 flex flex-col justify-between">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                {firstName} {lastName}
              </h3>
              <p className="text-sm text-gray-500 italic line-clamp-1">
                {registrationType === "Exposant" ? "Booth Representative" : "Attendee"}
              </p>
            </div>
            
            <div className="flex justify-center mt-2">
              <div className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100 text-center">
                <div className="text-xl font-mono font-bold tracking-wider text-gray-800">
                  {displayCode}
                </div>
                <div className="text-xs text-gray-500 mt-1">Identifiant</div>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <div className="border-t border-gray-100 pt-1 text-gray-400 text-[0.6rem]">
                ID: {displayCode}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={downloadBadge}
        disabled={isDownloading}
        className="mt-4 px-4 py-2 bg-[#81B441] hover:bg-[#6a9834] text-white rounded-md transition-colors shadow-md flex items-center gap-2 disabled:opacity-70"
      >
        {isDownloading ? (
          <span className="inline-block animate-spin mr-2">⟳</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {isDownloading ? "Processing..." : "Download Badge"}
      </button>
    </div>
  );
};

export default Badge; 