'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';

interface ParticipantBadgeProps {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  qrCode?: string;
  eventName: string;
  eventBanner?: string;
  showActions?: boolean;
}

const ParticipantBadge = ({
  firstName,
  lastName,
  jobTitle,
  company,
  qrCode,
  eventName,
  eventBanner,
  showActions = true
}: ParticipantBadgeProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const handleDownloadBadge = async () => {
    if (!badgeRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Créer un conteneur temporaire avec plus d'espace
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        background: white;
        padding: 40px;
        z-index: -1;
      `;
      
      // Cloner l'élément badge
      const clonedBadge = badgeRef.current.cloneNode(true) as HTMLElement;
      clonedBadge.style.margin = '0';
      clonedBadge.style.transform = 'none';
      
      tempContainer.appendChild(clonedBadge);
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(clonedBadge, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        foreignObjectRendering: false,
        width: clonedBadge.scrollWidth,
        height: clonedBadge.scrollHeight,
      });
      
      // Nettoyer le conteneur temporaire
      document.body.removeChild(tempContainer);
      
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `badge-${firstName}-${lastName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Erreur lors de la génération du badge:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintBadge = () => {
    if (!badgeRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Badge de ${firstName} ${lastName}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .badge-container { 
                  width: 100%; 
                  max-width: none; 
                  page-break-inside: avoid; 
                }
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                background: white;
              }
              .badge-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 16px;
                background: linear-gradient(to bottom right, #eff6ff, #f0f9ff);
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                margin: 0 auto;
                width: 9cm;
                height: 13cm;
                max-width: 9cm;
                max-height: 13cm;
                box-sizing: border-box;
              }
              .badge-header {
                text-align: center;
                margin-bottom: 16px;
                width: 100%;
              }
              .badge-header .banner-container {
                width: 100%;
                height: 3.5cm;
                background: #f3f4f6;
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 8px;
              }
              .badge-header img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .badge-header h3 {
                font-size: 20px;
                font-weight: bold;
                color: #81B441;
                margin: 0 0 4px 0;
              }
              .badge-content {
                width: 100%;
                text-align: center;
                margin-bottom: 20px;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              .badge-name {
                font-size: 22px;
                font-weight: bold;
                color: #111827;
                margin: 0 0 6px 0;
                line-height: 1.3;
              }
              .badge-info {
                margin-top: 8px;
              }
              .badge-info p {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 4px 0;
                line-height: 1.3;
              }
              .badge-info .company {
                font-size: 15px;
                color: #374151;
                font-weight: 500;
                margin: 4px 0 0 0;
                line-height: 1.3;
              }
              .badge-qr {
                background: white;
                border-radius: 8px;
                padding: 12px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto;
              }
              .badge-footer {
                text-align: center;
                margin-top: 8px;
                padding-top: 8px;
                width: 100%;
              }
              .powered-by {
                font-size: 10px;
                color: #9ca3af;
                font-weight: 400;
              }
            </style>
          </head>
          <body>
            <div class="badge-container">
              <div class="badge-header">
                ${eventBanner ? `
                  <div class="banner-container">
                    <img src="${eventBanner}" alt="${eventName}" />
                  </div>
                ` : `
                  <h3>${eventName}</h3>
                `}
              </div>
              
              <div class="badge-content">
                <h2 class="badge-name">${firstName} ${lastName}</h2>
                <div class="badge-info">
                  ${jobTitle ? `<p>${jobTitle}</p>` : ''}
                  ${company ? `<p class="company">${company}</p>` : ''}
                </div>
              </div>
              
              <div class="badge-qr">
                ${qrCode ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrCode)}" width="120" height="120" alt="QR Code" />` : '<div style="width:120px;height:120px;background:#f3f4f6;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;">QR Code</div>'}
              </div>
              
              <div class="badge-footer">
                <p class="powered-by">Powered by InEvent</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <div 
          ref={badgeRef}
          id="participant-badge" 
          className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-gray-200"
          style={{ 
            width: '9cm', 
            height: '13cm',
            minWidth: '9cm',
            minHeight: '13cm',
            maxWidth: '9cm',
            maxHeight: '13cm',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <div className="text-center mb-4 w-full">
            {eventBanner ? (
              <div className="w-full bg-gray-100 rounded-md overflow-hidden" style={{ height: '3.5cm' }}>
                <img 
                  src={eventBanner} 
                  alt={eventName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <h3 className="text-xl font-bold text-[#81B441] mb-2">{eventName}</h3>
            )}
          </div>
          
          <div className="w-full text-center mb-4 flex-1 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
              {firstName} {lastName}
            </h2>
            
            <div className="mt-2 space-y-1">
              {jobTitle && (
                <p className="text-sm text-gray-600 leading-tight">
                  {jobTitle}
                </p>
              )}
              {company && (
                <p className="text-sm text-gray-700 font-medium leading-tight">
                  {company}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm mx-auto flex justify-center items-center">
            {qrCode ? (
              <QRCodeSVG 
                value={qrCode}
                size={120}
                level="M"
                className="block"
              />
            ) : (
              <div className="w-[120px] h-[120px] bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">QR Code</span>
              </div>
            )}
          </div>
          
          <div className="text-center mt-2 pt-2 w-full border-t border-gray-200/50">
            <p className="text-xs text-gray-400 font-light">Powered by InEvent</p>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={handlePrintBadge}
            className="flex-1"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </Button>
          <Button 
            variant="outline"
            onClick={handleDownloadBadge}
            disabled={isDownloading}
            className="flex-1"
          >
            {isDownloading ? (
              <span className="inline-block animate-spin mr-2">⟳</span>
            ) : (
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            )}
            {isDownloading ? "Téléchargement..." : "Télécharger"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParticipantBadge; 