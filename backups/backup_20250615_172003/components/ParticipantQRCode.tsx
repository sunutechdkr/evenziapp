"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  qrCode: string;
  shortCode?: string;
  checkedIn: boolean;
  checkInTime?: Date;
};

type ParticipantQRCodeProps = {
  participantId: string;
};

export default function ParticipantQRCode({ participantId }: ParticipantQRCodeProps) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipant = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/participant/${participantId}`);
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération du participant: ${response.status}`);
        }
        
        const data = await response.json();
        setParticipant(data.participant);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de récupérer les données du participant");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (participantId) {
      fetchParticipant();
    }
  }, [participantId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#81B441]"></div>
      </div>
    );
  }
  
  if (error || !participant) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error || "Participant non trouvé"}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-center">QR Code du participant</h2>
      
      <div className="mb-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg">{participant.firstName} {participant.lastName}</h3>
          <p className="text-gray-600">{participant.email}</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <QRCodeSVG 
              value={participant.qrCode} 
              size={250} 
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-700 mb-1">Valeur brute du QR code:</p>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
              {participant.qrCode}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm">
          <p className="mb-2 font-semibold">Information:</p>
          <p>Ce QR code contient exactement la valeur stockée dans la base de données pour ce participant.</p>
        </div>
      </div>
    </div>
  );
} 