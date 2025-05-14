"use client";

import { QRCodeSVG } from "qrcode.react";

type EventBadgeProps = {
  firstName: string;
  lastName: string;
  eventName: string;
  type: string;
  shortCode?: string;
  qrCode?: string;
  company?: string;
  jobTitle?: string;
};

export function EventBadge({ firstName, lastName, eventName, type, shortCode, qrCode, company, jobTitle }: EventBadgeProps) {
  // Utiliser qrCode s'il est disponible, sinon fallback sur shortCode
  const qrCodeValue = qrCode || shortCode || '';
  
  return (
    <div className="w-[85mm] h-[54mm] bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#81B441]"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#81B441]/10 rounded-full -mr-10 -mb-10"></div>
      <div className="absolute top-0 right-0 w-12 h-12 bg-[#81B441]/5 rounded-full -mr-6 -mt-6"></div>
      
      <div className="flex h-full">
        {/* Left section - Event info */}
        <div className="w-1/3 bg-gradient-to-b from-[#81B441] to-[#6a9834] text-white p-4 flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 w-20 h-full opacity-10">
            <svg viewBox="0 0 80 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 0C17.9086 0 0 17.9086 0 40V120C0 142.091 17.9086 160 40 160H80V0H40Z" fill="white"/>
            </svg>
          </div>
          
          <div>
            <div className="font-bold text-xl mb-2 drop-shadow-sm">{eventName}</div>
            <div className="text-white/80 text-sm">{new Date().toLocaleDateString()}</div>
          </div>
          
          <div className="text-xs text-white/90 backdrop-blur-sm bg-white/10 py-1 px-2 rounded">
            <div className="font-medium">{type}</div>
            {company && <div className="mt-1 opacity-90">{company}</div>}
          </div>
        </div>
        
        {/* Right section - Attendee info */}
        <div className="w-2/3 p-4 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
              <div className="text-[#81B441] font-bold text-xl flex items-center">
                <span className="text-[#81B441]">In</span>
                <span className="text-gray-700">event</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-2">
            <h2 className="text-xl font-bold tracking-tight truncate text-gray-800">
              {firstName} {lastName}
            </h2>
            {jobTitle && (
              <p className="text-gray-700 text-sm mt-1 truncate">{jobTitle}</p>
            )}
            {company && (
              <p className="text-[#81B441] text-sm font-semibold mt-1 truncate">{company}</p>
            )}
          </div>

          {/* QR Code au bas du badge - style comparable à la barre latérale */}
          <div className="mt-3 flex justify-center">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
              <QRCodeSVG 
                value={qrCodeValue} 
                size={75}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 