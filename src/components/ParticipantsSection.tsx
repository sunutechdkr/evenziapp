'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  avatar?: string;
  checkedIn: boolean;
  type?: string;
  bio?: string;
  expertise?: string[];
  sessions?: Array<{id: string, title: string}>;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
};

interface ParticipantsSectionProps {
  participants: Participant[];
  loadingParticipants: boolean;
}

export default function ParticipantsSection({ 
  participants, 
  loadingParticipants 
}: ParticipantsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtrage uniquement côté client après montage
  const participantsToShow = useMemo(() => {
    if (!mounted) return participants;
    if (!searchTerm) return participants;
    
    return participants.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.jobTitle && p.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [participants, searchTerm, mounted]);

  if (loadingParticipants) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#81B441] border-t-transparent"></div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
        Aucun participant inscrit pour le moment.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {participants.length} participant{participants.length > 1 ? 's' : ''} 
          <span className="ml-2 text-[#81B441]">
            ({participants.filter(p => p.checkedIn).length} présent{participants.filter(p => p.checkedIn).length > 1 ? 's' : ''})
          </span>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Rechercher un participant..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#81B441] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-3">
        {participantsToShow.map(participant => (
          <div key={participant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {participant.avatar ? (
                  <img src={participant.avatar} alt={`${participant.firstName} ${participant.lastName}`} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {participant.firstName} {participant.lastName}
                </h3>
                {participant.jobTitle && (
                  <p className="text-sm text-gray-600 truncate">
                    {participant.jobTitle} {participant.company && `· ${participant.company}`}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0">
                {participant.checkedIn ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Présent
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    En attente
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {participantsToShow.length === 0 && searchTerm && mounted && (
        <div className="py-8 text-center text-gray-500">
          Aucun participant ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
} 