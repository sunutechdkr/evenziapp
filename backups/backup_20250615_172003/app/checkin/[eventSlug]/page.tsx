'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Logo from '@/components/ui/Logo';

// Import conditionnel du scanner HTML5QR pour éviter les erreurs côté serveur
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Html5QrcodeScanner: any = null;
if (typeof window !== 'undefined') {
  import('html5-qrcode').then(module => {
    Html5QrcodeScanner = module.Html5QrcodeScanner;
  });
}

// Énumération pour suivre les étapes du processus de check-in
enum CheckInStep {
  Intro,
  Scanning,
  TermsConditions,
  Confirmation,
  Success,
  Error,
  AlreadyCheckedIn
}

type Participant = {
  id: string;
    firstName: string;
    lastName: string;
  email: string;
    type: string;
  shortCode?: string;
  qrCode?: string;
  company?: string;
  jobTitle?: string;
  checkedIn: boolean;
  checkInTime?: Date;
};

export default function CheckInPage() {
  const params = useParams<{ eventSlug: string }>();
  const eventSlug = params.eventSlug;
  
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const scannerContainerId = "qr-reader";
  const [eventId, setEventId] = useState<string | null>(null);
  
  // État pour gérer le flux d'étapes de check-in
  const [currentStep, setCurrentStep] = useState<CheckInStep>(CheckInStep.Intro);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  
  // Référence pour stocker le nom de l'événement en cours
  const currentEventName = useRef<string>('');

  // Cleanup scanner when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
    }
    };
  }, []);

  // Detection côté client pour les API du navigateur
  useEffect(() => {
    // Chargement proactif de la bibliothèque HTML5QR
    if (typeof window !== 'undefined' && !Html5QrcodeScanner) {
      import('html5-qrcode').then(module => {
        Html5QrcodeScanner = module.Html5QrcodeScanner;
      });
    }
  }, []);

  useEffect(() => {
    const fetchEventId = async () => {
      try {
        console.log("Récupération de l'ID d'événement pour le slug:", eventSlug);
        const response = await fetch(`/api/events/slug/${eventSlug}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Event ID récupéré pour ${eventSlug} : ${data.id}`);
          setEventId(data.id);
          currentEventName.current = data.name;
          
          // Set page title
          if (typeof document !== 'undefined') {
            document.title = `Check-in | ${data.name || eventSlug}`;
          }
    } else {
          console.error(`Impossible de récupérer l'ID pour l'événement ${eventSlug}, status: ${response.status}`);
          setCheckInError(`Erreur lors de la récupération des informations de l'événement (${response.status})`);
          setCurrentStep(CheckInStep.Error);
        }
      } catch (error) {
        console.error("Error fetching event ID:", error);
        setCheckInError("Erreur lors de la récupération des informations de l'événement");
        setCurrentStep(CheckInStep.Error);
      }
    };

    if (eventSlug) {
      fetchEventId();
    } else {
      console.error("Slug d'événement manquant");
      setCheckInError("Informations de l'événement manquantes");
      setCurrentStep(CheckInStep.Error);
    }
  }, [eventSlug]);

  const initializeScanner = () => {
    // Vérifier que l'environnement est bien côté client et que la librairie est chargée
    if (scannerInitialized || !Html5QrcodeScanner || typeof window === 'undefined') return;

    // Vérifier que l'eventId est disponible
    if (!eventId) {
      console.error("Erreur: eventId n'est pas défini lors de l'initialisation du scanner");
      setCheckInError("L'ID de l'événement n'est pas disponible. Veuillez rafraîchir la page.");
      setCurrentStep(CheckInStep.Error);
      setShowOptions(true);
      return;
    }

    console.log("Initialisation du scanner avec eventId:", eventId);

    // Nettoyer les instances précédentes
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error("Erreur lors du nettoyage du scanner:", error);
      }
    }

    // S'assurer que l'élément DOM existe
    const scannerElement = document.getElementById(scannerContainerId);
    if (!scannerElement) {
      console.error(`Élément avec ID ${scannerContainerId} non trouvé`);
      return;
    }

    try {
      console.log("Création du scanner QR avec configuration optimisée...");
      
      // Configuration optimisée pour les Mac
      const qrcodeScanner = new Html5QrcodeScanner(
        scannerContainerId,
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          formatsToSupport: [0], // QR Code uniquement
          videoConstraints: {
            facingMode: "user", // Force la caméra frontale du MacBook
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        /* verbose */ true // Définir à true pour afficher plus de logs
      );

      qrcodeScanner.render(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (qrCodeMessage: any) => {
          console.log("QR Code détecté:", qrCodeMessage);
          processCheckIn(qrCodeMessage);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (errorMessage: any) => {
          console.log("Erreur de scan:", errorMessage);
        }
      );

      // Démarrer automatiquement le scanner après rendu
      setTimeout(() => {
        console.log("Tentative de démarrage automatique du scanner...");
        // Sélectionner et cliquer automatiquement sur le bouton de démarrage du scanner
        const startButton = document.getElementById("html5-qrcode-button-camera-start");
        if (startButton) {
          console.log("Bouton de démarrage trouvé, clic automatique.");
          startButton.click();
        } else {
          console.error("Bouton de démarrage non trouvé.");
        }
        
        // Personnaliser l'interface du scanner
        customizeQrScannerUI();
      }, 800);

      scannerRef.current = qrcodeScanner;
      setScannerInitialized(true);
    } catch (error) {
      console.error("Erreur d'initialisation du scanner:", error);
      setCheckInError("Erreur lors de l'initialisation du scanner. Vérifiez l'accès à la caméra.");
      setCurrentStep(CheckInStep.Error);
    }
  };

  const startQrScanner = async () => {
    setShowOptions(false);
    setShowManualForm(false);
    
    // Reset any error state
    setCheckInError(null);
    
    try {
      // Vérifier si la librairie HTML5QR est chargée
      if (!Html5QrcodeScanner) {
        // Tenter de charger la librairie
        await import('html5-qrcode').then(module => {
          Html5QrcodeScanner = module.Html5QrcodeScanner;
        });
      }
      
      // Check if camera permission is granted
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const hasPermission = await navigator.mediaDevices.getUserMedia({ video: true })
          .then(() => true)
          .catch(() => false);
        
        if (!hasPermission) {
          console.error("Permission de caméra refusée");
          toast.error("Accès à la caméra refusé. Veuillez vérifier les permissions de votre navigateur.", {
            duration: 5000,
            position: 'top-center',
          });
          setShowOptions(true);
          return;
        }
        
        console.log("Initialisation du scanner QR...");
        initializeScanner();
      } else {
        console.error("MediaDevices API non disponible");
        toast.error("Votre navigateur ne supporte pas l'accès à la caméra.", {
          duration: 4000,
          position: 'top-center',
        });
        setShowOptions(true);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du scanner:", error);
      setShowOptions(true);
      toast.error("Impossible d'initialiser le scanner. Veuillez vérifier les permissions de caméra.", {
        duration: 4000,
        position: 'top-center',
      });
    }
  };

  const backToOptions = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setScannerInitialized(false);
    }
    setShowManualForm(false);
    setShowOptions(true);
  };

  const processCheckIn = async (qrData: string) => {
    if (!eventId) {
      console.error("EventId manquant lors du processCheckIn");
      setCheckInError("Informations de l'événement manquantes");
      setCurrentStep(CheckInStep.Error);
      return;
    }
    
    // Nettoyer les données du code participant
    const cleanIdData = qrData.trim();
    console.log(`Code participant saisi (brut): "${qrData}"`);
    console.log(`Code participant nettoyé: "${cleanIdData}"`);
    
    try {
      setLoading(true);
      console.log(`Recherche du participant avec code: "${cleanIdData}" pour l'événement: ${eventId}`);
      
      // 1. D'abord, trouver l'ID du participant à partir du code
      const lookupResponse = await fetch('/api/checkin/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode: cleanIdData,
          eventId: eventId
        }),
      });

      const lookupData = await lookupResponse.json();
      console.log("Résultat de la recherche:", lookupData);

      if (!lookupResponse.ok || !lookupData.participant) {
        const errorMsg = lookupData.message || "Participant non trouvé";
        console.error("Erreur de recherche participant:", errorMsg);
        
        // Notification utilisateur
        if (typeof window !== 'undefined') {
          const audioError = new Audio('/sounds/error.mp3');
          try {
            audioError.play().catch(e => console.log('Impossible de jouer le son d\'erreur:', e));
          } catch (soundError) {
            console.error('Erreur lors de la lecture du son:', soundError);
          }
        }
        
        toast.error(errorMsg, {
          duration: 4000,
          position: 'top-center',
          className: 'toast-error',
          icon: '❌',
        });
        
        setCheckInError(`Code "${cleanIdData}" non reconnu: ${errorMsg}`);
        setCurrentStep(CheckInStep.Error);
        return;
      }
      
      // Participant trouvé, on enregistre ses informations
      const participant = lookupData.participant;
      console.log("Participant trouvé:", participant);
      setSelectedParticipant(participant);
      
      // Si le participant est déjà enregistré, aller directement à l'étape AlreadyCheckedIn
      if (participant.checkedIn) {
        console.log("Participant déjà enregistré, affichage des informations");
        setCurrentStep(CheckInStep.AlreadyCheckedIn);
      } else {
        // Sinon, passer par les conditions d'utilisation
        setCurrentStep(CheckInStep.TermsConditions);
      }
      
    } catch (error) {
      console.error('Error processing check-in:', error);
      setCheckInError(`Erreur lors du traitement du code: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setCurrentStep(CheckInStep.Error);
    } finally {
      setLoading(false);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (clearError) {
          console.error("Error cleaning up scanner:", clearError);
        }
        setScannerInitialized(false);
      }
    }
  };

  const startManualSearch = () => {
    setShowOptions(false);
    setShowManualForm(true);
    
    // Afficher directement l'interface de recherche par nom sans passer par la saisie manuelle d'ID
    setManualEmail(''); // Réinitialiser le champ de recherche
  };

  // Fonction pour gérer la sélection d'un participant
  const handleParticipantSelect = async (participant: Participant) => {
    setSelectedParticipant(participant);
    
    // Si le participant est déjà enregistré, aller directement à l'étape AlreadyCheckedIn
    if (participant.checkedIn) {
      setCurrentStep(CheckInStep.AlreadyCheckedIn);
    } else {
      // Sinon, passer par les conditions d'utilisation
      setCurrentStep(CheckInStep.TermsConditions);
    }
  };

  // Fonction pour accepter les CGU et passer à l'étape suivante
  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setCurrentStep(CheckInStep.Confirmation);
  };

  // Fonction pour confirmer et finaliser le check-in
  const handleConfirmCheckIn = async () => {
    if (!selectedParticipant || !eventId) {
      setCheckInError("Informations de l'événement ou du participant manquantes");
      setCurrentStep(CheckInStep.Error);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Tentative de check-in pour participant=${selectedParticipant.id}, eventId=${eventId}`);
      
      // Utiliser l'API dédiée pour le check-in
      const response = await fetch(`/api/events/${eventId}/registrations/${selectedParticipant.id}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log("Réponse du check-in:", data);
      
      if (response.ok) {
        // Notification de succès
        if (typeof window !== 'undefined') {
          const audioSuccess = new Audio('/sounds/success.mp3');
          try {
            audioSuccess.play().catch(e => console.log('Impossible de jouer le son de succès:', e));
          } catch (soundError) {
            console.error('Erreur lors de la lecture du son:', soundError);
          }
        }
        
        // Même si déjà enregistré, on continue avec le flux standard
        setCurrentStep(CheckInStep.Success);
      } else {
        // Amélioration de la gestion des erreurs
        const errorMsg = data.message || "Erreur l&apos;enregistrement";
        console.error("Erreur d'enregistrement:", errorMsg);
        setCheckInError(errorMsg);
        setCurrentStep(CheckInStep.Error);
      }
    } catch (error) {
      console.error('Erreur détaillée lors du check-in:', error);
      setCheckInError("Une erreur technique est survenue lors de l&apos;enregistrement. Veuillez réessayer.");
      setCurrentStep(CheckInStep.Error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser le processus
  const resetCheckInProcess = () => {
    setSelectedParticipant(null);
    setTermsAccepted(false);
    setCheckInError(null);
    setCurrentStep(CheckInStep.Intro);
    setShowOptions(true);
    setShowManualForm(false);
  };

  // Fonction pour imprimer le badge du participant
  const handlePrintBadge = () => {
    if (!selectedParticipant || !eventId) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Impossible d\'ouvrir la fenêtre d\'impression, veuillez vérifier vos paramètres de navigateur');
      return;
    }
    
    // Récupérer les informations de l'événement pour obtenir la bannière
    fetch(`/api/events/${eventId}`)
      .then(response => response.json())
      .then(eventData => {
        // Utiliser uniquement le shortCode s'il est disponible, sinon utiliser les 9 premiers caractères de l'ID
        // Cela garantit un QR code beaucoup plus simple et plus facile à scanner
        const qrCodeValue = selectedParticipant.shortCode || selectedParticipant.id.substring(0, 9);
        console.log('QR code utilisé pour le badge:', qrCodeValue);
        
        const bannerUrl = eventData.banner || '';
        const eventName = eventData.name || currentEventName.current || eventSlug;
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Badge de ${selectedParticipant.firstName} ${selectedParticipant.lastName}</title>
              <style>
                @page {
                  size: 9.5cm 13cm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  width: 9.5cm;
                  height: 13cm;
                  position: relative;
                  background-color: white;
                }
                .badge-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  width: 100%;
                  height: 100%;
                  box-sizing: border-box;
                  padding: 0.5cm;
                }
                .event-banner {
                  width: 8.5cm;
                  height: 2.5cm;
                  margin-bottom: 1cm;
                  background-color: #f0f0f0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  overflow: hidden;
                }
                .event-banner img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                }
                .event-banner-fallback {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  color: #666;
                  text-align: center;
                  font-style: italic;
                  padding: 0.2cm;
                }
                .qr-container {
                  margin-bottom: 1cm;
                }
                .qr-code {
                  width: 3cm;
                  height: 3cm;
                }
                .participant-info {
                  text-align: center;
                  width: 100%;
                }
                .participant-name {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 0.4cm;
                  text-transform: uppercase;
                }
                .company-info {
                  font-size: 14px;
                  color: #444;
                  margin-bottom: 0.2cm;
                }
                .job-title {
                  font-size: 12px;
                  color: #666;
                  margin-bottom: 0.2cm;
                }
                .badge-footer {
                  position: absolute;
                  bottom: 0.5cm;
                  width: 8.5cm;
                  text-align: center;
                  font-size: 10px;
                  color: #999;
                  font-style: italic;
                }
              </style>
            </head>
            <body>
              <div class="badge-container">
                <div class="event-banner">
                  ${bannerUrl ? 
                    `<img src="${bannerUrl}" alt="${eventName}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'event-banner-fallback\\'>${eventName}</div>';" />` :
                    `<div class="event-banner-fallback">${eventName}</div>`
                  }
                </div>
                
                <div class="qr-container">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeValue)}" 
                    class="qr-code" 
                    alt="QR Code" 
                  />
                </div>
                
                <div class="participant-info">
                  <div class="participant-name">
                    ${selectedParticipant.firstName} ${selectedParticipant.lastName}
                  </div>
                  
                  ${selectedParticipant.company ? 
                    `<div class="company-info">${selectedParticipant.company}</div>` : 
                    ''}
                  
                  ${selectedParticipant.jobTitle ? 
                    `<div class="job-title">${selectedParticipant.jobTitle}</div>` : 
                    ''}
                </div>
                
                <div class="badge-footer">
                  powered by inevent
                </div>
              </div>
              
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des données de l'événement:", error);
        printWindow.close();
        toast.error("Erreur lors de l'impression du badge");
      });
  };

  // Fonction pour personnaliser l'UI du scanner
  const customizeQrScannerUI = () => {
    if (typeof document === 'undefined') return;
    
    console.log("Personnalisation de l'interface du scanner QR...");
    
    // Masquer les éléments d'UI inutiles
    const fileSelectionContainer = document.getElementById("html5-qrcode-anchor-scan-type-change");
    if (fileSelectionContainer) {
      fileSelectionContainer.style.display = "none";
    }
    
    // Personnaliser les messages et les rendre plus visibles
    const messages = document.querySelectorAll("span.dbrScanner-text, span");
    messages.forEach(msg => {
      if (msg.textContent?.includes("Unable to access video") || msg.textContent?.includes("Camera access denied")) {
        msg.textContent = "Impossible d'accéder à la caméra. Veuillez vérifier les permissions.";
        (msg as HTMLElement).style.color = "red";
        (msg as HTMLElement).style.fontWeight = "bold";
      }
      if (msg.textContent?.includes("Scanning")) {
        msg.textContent = "Scannez un QR code pour enregistrer un participant";
        (msg as HTMLElement).style.fontSize = "16px";
        (msg as HTMLElement).style.color = "#81B441";
      }
    });
    
    // Améliorer l'apparence du scanner
    const scanRegion = document.querySelector(".scan-region-highlight");
    if (scanRegion) {
      scanRegion.classList.add("custom-scan-region");
    }
    
    // Améliorer la visibilité du conteneur vidéo
    const videoContainer = document.querySelector("#html5-qrcode-scanner video");
    if (videoContainer) {
      (videoContainer as HTMLElement).style.borderRadius = "10px";
      (videoContainer as HTMLElement).style.border = "3px solid #81B441";
    }
    
    // Ajuster les dimensions du scanner pour le MacBook
    const scannerContainer = document.querySelector("#qr-reader");
    if (scannerContainer) {
      (scannerContainer as HTMLElement).style.maxWidth = "100%";
      (scannerContainer as HTMLElement).style.margin = "0 auto";
    }
    
    console.log("Personnalisation de l'interface du scanner QR terminée");
  };

  // If authentication is still loading, show a loading state
  if (status === 'loading' || (status === 'authenticated' && !session)) {
    return (
      <div className="checkin-page">
        <div className="flex justify-center items-center h-screen">
          <div className="checkin-spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        </div>
      </div>
    );
  }

  // If not authenticated or not an admin, show message (redirect should happen via useEffect)
  if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN')) {
    return (
      <div className="checkin-page">
      <div className="text-center py-12">
          <h1 className="text-xl font-bold text-white">Accès refusé</h1>
          <p className="mt-2 text-gray-300">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-page check-in-page">
      <div className="back-to-event-button">
        <a href={eventId ? `/dashboard/events/${eventId}` : "/dashboard/events"} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Retour à l&apos;événement</span>
        </a>
      </div>
      
      <div className="checkin-brand-logo">
        <Logo width={200} height={50} color="white" />
      </div>

      <div className="checkin-welcome">
        <h1 className="checkin-title">Check-in {currentEventName.current || eventSlug}</h1>
        <p className="checkin-subtitle">Choisissez une méthode d&apos;enregistrement ci-dessous</p>
                </div>
      
      {/* ÉTAPE 1: OPTIONS DE CHECK-IN */}
      {currentStep === CheckInStep.Intro && (
        <>
          {showOptions && (
            <div className="checkin-options-new">
              <div className="checkin-card" onClick={startQrScanner}>
                <div className="checkin-card-content">
                  <div className="checkin-card-icon">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" stroke="#81B441" strokeWidth="1.8" />
                      <rect x="14" y="3" width="7" height="7" stroke="#81B441" strokeWidth="1.8" />
                      <rect x="3" y="14" width="7" height="7" stroke="#81B441" strokeWidth="1.8" />
                      <rect x="14" y="14" width="7" height="7" stroke="#81B441" strokeWidth="1.8" />
                  </svg>
                </div>
                  <h3 className="checkin-card-title">Scanner un<br />QR code</h3>
                  <p className="checkin-card-description">Scannez le QR code pour enregistrer le participant rapidement</p>
                </div>
              </div>
              
              <div className="checkin-card" onClick={startManualSearch}>
                <div className="checkin-card-content">
                  <div className="checkin-card-icon">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="5" stroke="#81B441" strokeWidth="1.8" />
                      <path d="M3 21C3 16.5817 6.58172 13 11 13H13C17.4183 13 21 16.5817 21 21" stroke="#81B441" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <h3 className="checkin-card-title">Rechercher par<br />nom</h3>
                  <p className="checkin-card-description">Trouvez un participant par nom ou email</p>
                </div>
              </div>
            </div>
          )}
          
          {!showOptions && !showManualForm && (
            <div className="checkin-scanner-active">
              <div id="qr-reader" className="qr-reader-container"></div>
              <p className="text-center text-white mt-4 mb-6">Pointez votre caméra vers le QR code du participant</p>
              
              <div className="checkin-buttons-container">
                <button 
                  onClick={backToOptions}
                  className="checkin-button checkin-button-secondary"
                >
                  Retour aux options
                </button>
              </div>
            </div>
          )}
          
          {!showOptions && showManualForm && (
            <div className="checkin-scanner-active">
              <div className="checkin-result">
                <h2 className="checkin-option-title mb-4">Recherche de participant</h2>

                <div className="search-container">
                  <input
                    type="text"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="checkin-form-input mb-6"
                    autoFocus
                  />

                  {manualEmail.length > 0 && manualEmail.length < 2 && (
                    <div className="min-chars-notice">
                      Saisissez au moins 2 caractères pour lancer la recherche
                    </div>
                  )}

                  {manualEmail.length >= 2 && (
                    <div className="participants-list">
                      {loading ? (
                        <div className="loading-indicator">
                          <span className="checkin-spinner"></span>
                          <span>Recherche en cours...</span>
              </div>
            ) : (
                        <ParticipantList 
                          query={manualEmail} 
                          eventSlug={eventSlug} 
                          onSelectParticipant={handleParticipantSelect} 
                        />
                      )}
                </div>
                  )}
                </div>

                <div className="checkin-buttons-container">
                  <button 
                    type="button"
                    onClick={backToOptions}
                    className="checkin-button checkin-button-secondary"
                  >
                    Retour aux options
                  </button>
                </div>
                </div>
              </div>
            )}
        </>
      )}

      {/* ÉTAPE 2: CONDITIONS GÉNÉRALES D'UTILISATION */}
      {currentStep === CheckInStep.TermsConditions && selectedParticipant && (
        <div className="checkin-result">
          <h2 className="checkin-option-title mb-4">Conditions d&apos;utilisation</h2>
          
          <div className="participant-mini-card mb-4">
            <div className="participant-mini-avatar">
              <span>{selectedParticipant.firstName.charAt(0)}{selectedParticipant.lastName.charAt(0)}</span>
          </div>
            <div className="participant-mini-info">
              <h3 className="participant-mini-name">{selectedParticipant.firstName} {selectedParticipant.lastName}</h3>
              <p className="participant-mini-email">{selectedParticipant.email}</p>
              {selectedParticipant.checkedIn && (
                <div className="participant-mini-badge">Déjà enregistré</div>
              )}
            </div>
          </div>
          
          <div className="terms-content">
            <p className="terms-text mb-6">
              {eventSlug} ne peut être tenu responsable des dommages personnels ou matériels subis lors de l&apos;événement, ni des objets perdus ou volés.
            </p>
            <p className="terms-text mb-6">
              Une politique de tolérance zéro est appliquée concernant tout comportement inapproprié. Si vous êtes trouvé en possession d&apos;objets interdits ou si vous adoptez un comportement répréhensible, votre participation à l&apos;événement sera immédiatement interrompue.
            </p>

            <div className="terms-acceptance">
              <label className="acceptance-label flex items-center space-x-3 mb-6 cursor-pointer">
                <input
                  type="checkbox" 
                  checked={termsAccepted} 
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="terms-checkbox h-5 w-5"
                />
                <span className="text-white">J&apos;accepte les conditions</span>
              </label>
              </div>
          </div>

          <div className="checkin-buttons-container">
                  <button 
              type="button"
              onClick={resetCheckInProcess}
              className="checkin-button checkin-button-secondary"
            >
              Annuler
                </button>
                <button
                  type="button"
              onClick={handleAcceptTerms}
              className="checkin-button"
              disabled={!termsAccepted}
                >
              Continuer
                  </button>
                </div>
              </div>
            )}

      {/* ÉTAPE 3: CONFIRMATION DES INFORMATIONS */}
      {currentStep === CheckInStep.Confirmation && selectedParticipant && (
        <div className="checkin-result">
          <h2 className="checkin-option-title mb-4">Confirmez l&apos;enregistrement</h2>
          
          <div className="participant-details-card">
            <div className="participant-avatar">
              <div className="avatar-circle">
                <span>{selectedParticipant.firstName.charAt(0)}{selectedParticipant.lastName.charAt(0)}</span>
          </div>
              </div>
            
            <h3 className="participant-name">{selectedParticipant.firstName} {selectedParticipant.lastName}</h3>
            
            {selectedParticipant.company && (
              <div className="participant-company">{selectedParticipant.company}</div>
            )}
            
            {selectedParticipant.jobTitle && (
              <div className="participant-job">{selectedParticipant.jobTitle}</div>
            )}
            
            <div className="participant-email">{selectedParticipant.email}</div>
            
            <div className="participant-badges-container">
              <div className="participant-type-badge">
                {selectedParticipant.type}
              </div>
              
              {selectedParticipant.checkedIn && (
                <div className="already-checked-in-badge">
                  ✓ Déjà enregistré
                </div>
              )}
            </div>
            
            {selectedParticipant.checkedIn && (
              <div className="checkin-warning">
                <ExclamationTriangleIcon className="warning-icon" />
                <span>Attention: Ce participant est déjà enregistré!</span>
              </div>
            )}
          </div>
          
          <div className="checkin-buttons-container">
                <button
              type="button"
              onClick={() => {
                if (selectedParticipant.checkedIn) {
                  setCurrentStep(CheckInStep.AlreadyCheckedIn);
                } else {
                  setCurrentStep(CheckInStep.TermsConditions);
                }
              }}
              className="checkin-button checkin-button-secondary"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleConfirmCheckIn}
              className="checkin-button"
                  disabled={loading}
            >
              {loading ? (
                <>
                  <span className="checkin-spinner"></span>
                  <span>Traitement...</span>
                </>
              ) : selectedParticipant.checkedIn ? (
                "Confirmer l'enregistrement"
              ) : (
                "Confirmer l'enregistrement"
              )}
                </button>
          </div>
        </div>
      )}
      
      {/* ÉTAPE 4: CHECK-IN RÉUSSI */}
      {currentStep === CheckInStep.Success && selectedParticipant && (
        <div className="checkin-result success-result">
          <div className="checkin-success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#81B441" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 className="checkin-success-title mb-2">Enregistrement réussi</h2>
          <div className="participant-details-card">
            <div className="participant-avatar">
              <div className="avatar-circle">
                <span>{selectedParticipant.firstName.charAt(0)}{selectedParticipant.lastName.charAt(0)}</span>
              </div>
            </div>
            
            <h3 className="participant-name">{selectedParticipant.firstName} {selectedParticipant.lastName}</h3>
            
            {selectedParticipant.company && (
              <div className="participant-company">{selectedParticipant.company}</div>
            )}
            
            {selectedParticipant.jobTitle && (
              <div className="participant-job">{selectedParticipant.jobTitle}</div>
            )}
            
            <div className="participant-email">{selectedParticipant.email}</div>
            
            <div className="participant-badges-container">
              <div className="participant-type-badge">
                {selectedParticipant.type}
              </div>
              
              {selectedParticipant.checkedIn && (
                <div className="already-checked-in-badge">
                  ✓ Déjà enregistré
                </div>
              )}
            </div>
            
            {selectedParticipant.checkInTime && (
            <div className="checkin-timestamp">
              Enregistré le {new Date(selectedParticipant.checkInTime).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
              })} à {new Date(selectedParticipant.checkInTime).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            )}
          </div>

          <div className="checkin-buttons-container">
                <button
                  type="button"
              onClick={resetCheckInProcess}
              className="checkin-button checkin-button-secondary"
              >
              Nouvel enregistrement
              </button>
              <button
              type="button"
              onClick={handlePrintBadge}
              className="checkin-button"
              >
              Imprimer le badge
                </button>
              </div>
          </div>
        )}

      {/* ÉTAPE 5: ERREUR */}
      {currentStep === CheckInStep.Error && (
        <div className="checkin-result error-result">
          <div className="checkin-error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
      </div>
          <h2 className="checkin-error-title mb-2">Erreur d&apos;enregistrement</h2>
          <div className="checkin-error-message">
            <p>{checkInError || "Une erreur est survenue lors de l'enregistrement."}</p>
            <div className="checkin-error-help">
              <p>Suggestions:</p>
              <ul>
                <li>Vérifiez que le QR code est bien visible et lisible</li>
                <li>Assurez-vous que le participant est bien inscrit à cet événement</li>
                <li>Essayez de rechercher le participant par son nom</li>
              </ul>
            </div>
          </div>
          <div className="checkin-buttons-container">
              <button
              type="button"
              onClick={resetCheckInProcess}
              className="checkin-button"
              >
              Retour aux options
              </button>
          </div>
        </div>
      )}

      {currentStep === CheckInStep.AlreadyCheckedIn && selectedParticipant && (
        <div className="checkin-result already-checked-in-result">
          <div className="participant-details-card">
            <div className="participant-avatar">
              <div className="avatar-circle">
                <span>{selectedParticipant.firstName.charAt(0)}{selectedParticipant.lastName.charAt(0)}</span>
              </div>
            </div>
            
            <h3 className="participant-name">{selectedParticipant.firstName} {selectedParticipant.lastName}</h3>
            
            {selectedParticipant.company && (
              <div className="participant-company">{selectedParticipant.company}</div>
            )}
            
            {selectedParticipant.jobTitle && (
              <div className="participant-job">{selectedParticipant.jobTitle}</div>
            )}
            
            <div className="participant-email">{selectedParticipant.email}</div>
            
            <div className="participant-badges-container">
              <div className="participant-type-badge">
                {selectedParticipant.type}
              </div>
              
              {selectedParticipant.checkedIn && (
                <div className="already-checked-in-badge">
                  ✓ Déjà enregistré
                </div>
              )}
            </div>
            
            {selectedParticipant.checkInTime && (
            <div className="checkin-timestamp">
              Enregistré le {new Date(selectedParticipant.checkInTime).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
              })} à {new Date(selectedParticipant.checkInTime).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            )}
          </div>

          <div className="checkin-buttons-container">
              <button
              type="button"
              onClick={resetCheckInProcess}
              className="checkin-button"
              >
              Retour
              </button>
            </div>
          </div>
        )}
      
      <div className="checkin-footer">
        <div className="checkin-powered-by">
          Propulsé par InEvent
      </div>
    </div>

      <style jsx>{`
        .checkin-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 1rem;
          color: white;
          background-color: #111;
          background-image: radial-gradient(circle at top center, rgba(30, 40, 30, 0.5), rgba(10, 10, 10, 0.9));
          position: relative;
          overflow: hidden;
          animation: gradientAnimation 15s ease infinite;
        }
        
        .checkin-page::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='1.5' fill='rgba(129, 180, 65, 0.2)'/%3E%3C/svg%3E");
          background-size: 120px 120px;
          opacity: 0.3;
          z-index: -1;
          animation: particleAnimation 60s linear infinite;
        }
        
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        
        @keyframes particleAnimation {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: 1000px 1000px;
          }
        }

        .checkin-brand-logo {
          width: 200px;
          height: 50px;
          margin-bottom: 1rem;
          margin-top: 4rem;
        }

        .checkin-welcome {
          text-align: center;
          margin-bottom: 2rem;
        }

        .checkin-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .checkin-subtitle {
          color: #ccc;
          font-size: 1.1rem;
        }

        .checkin-options-new {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          width: 100%;
          max-width: 900px;
          justify-content: center;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .checkin-options-new {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }
        }

        .checkin-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background-color: rgba(20, 20, 20, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          width: 100%;
          max-width: 350px;
          height: 100%;
          box-shadow: 0 0 20px rgba(129, 180, 65, 0.05);
          position: relative;
          z-index: 1;
          backdrop-filter: blur(5px);
        }

        .checkin-card:hover {
          background-color: rgba(25, 25, 25, 0.95);
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(129, 180, 65, 0.5);
          box-shadow: 0 0 25px rgba(129, 180, 65, 0.15);
        }
        
        .checkin-card::after {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, rgba(129, 180, 65, 0.1), transparent);
          border-radius: 12px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .checkin-card:hover::after {
          opacity: 1;
        }

        .checkin-card-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .checkin-card-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
          background-color: rgba(129, 180, 65, 0.1);
          border-radius: 50%;
          padding: 1rem;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }
        
        .checkin-card:hover .checkin-card-icon {
          transform: scale(1.1);
          background-color: rgba(129, 180, 65, 0.2);
        }

        .checkin-card-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: white;
        }

        .checkin-card-description {
          font-size: 0.9rem;
          color: #ccc;
          line-height: 1.4;
        }

        .checkin-form-input {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          padding: 0.75rem 1rem;
          width: 100%;
          margin-bottom: 1rem;
        }

        .checkin-form-input:focus {
          outline: none;
          border-color: #81B441;
          box-shadow: 0 0 0 2px rgba(129, 180, 65, 0.3);
        }

        .checkin-button {
          background-color: #81B441;
          color: white;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-block;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .checkin-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          transition: 0.5s;
        }

        .checkin-button:hover::after {
          transform: translateX(100%);
        }

        .checkin-button:hover {
          background-color: #6fa234;
          transform: translateY(-2px);
        }

        .checkin-button:disabled {
          background-color: #4a5b35;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .checkin-button-secondary {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
        }

        .checkin-button-secondary:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .checkin-success-icon {
          animation: successPulse 2s ease infinite;
        }
        
        .checkin-spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top: 4px solid #81B441;
          width: 2rem;
          height: 2rem;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes successPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .back-to-event-button {
          position: absolute;
          top: 1rem;
          left: 1rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          color: white;
          font-size: 0.9rem;
          padding: 0.5rem 0.75rem;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .back-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .back-button svg {
          margin-right: 0.5rem;
        }
        
        /* QR Scanner Styles */
        .qr-reader-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 0 0 2px rgba(129, 180, 65, 0.5);
        }
        
        .qr-reader-container video {
          border-radius: 8px;
        }
        
        /* Styles pour la carte des détails du participant */
        .participant-details-card {
          background-color: rgba(30, 30, 30, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          position: relative;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .participant-details-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .participant-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #81B441;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 600;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .participant-name {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .participant-company {
          font-size: 1.1rem;
          color: #ccc;
          margin-bottom: 0.25rem;
        }
        
        .participant-job {
          font-size: 0.9rem;
          color: #aaa;
          margin-bottom: 1rem;
        }
        
        .participant-email {
          font-size: 0.9rem;
          color: #81B441;
          margin-bottom: 1rem;
        }
        
        .participant-badges-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .participant-type-badge {
          display: inline-block;
          background-color: rgba(129, 180, 65, 0.2);
          color: #81B441;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          border: 1px solid rgba(129, 180, 65, 0.3);
        }
        
        .already-checked-in-badge {
          display: inline-block;
          background-color: rgba(255, 165, 0, 0.2);
          color: #ffa500;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-left: 0.5rem;
          border: 1px solid rgba(255, 165, 0, 0.3);
        }
        
        .checkin-warning {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 173, 51, 0.2);
          color: #ffad33;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 173, 51, 0.3);
        }
        
        .warning-icon {
          width: 1.2rem;
          height: 1.2rem;
          margin-right: 0.5rem;
        }
        
        /* Customize the scanner UI */
        :global(#html5-qrcode-button-camera-start) {
          background-color: #81B441 !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-weight: bold !important;
        }
        
        :global(#html5-qrcode-button-camera-stop) {
          background-color: #555 !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
        }
        
        :global(.scan-region-highlight) {
          border: 2px solid #81B441 !important;
        }
        
        :global(#html5-qrcode-select-camera) {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          border-radius: 6px !important;
          padding: 8px !important;
        }
        
        /* Hide the file selection UI */
        :global(#html5-qrcode-anchor-scan-type-change) {
          display: none !important;
        }

        .participant-mini-card {
          display: flex;
          align-items: center;
          background-color: rgba(30, 30, 30, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease;
        }
        
        .participant-mini-card:hover {
          transform: translateY(-2px);
        }
        
        .participant-mini-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #81B441;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          margin-right: 1rem;
          flex-shrink: 0;
        }
        
        .participant-mini-info {
          flex-grow: 1;
        }
        
        .participant-mini-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.2rem;
        }
        
        .participant-mini-email {
          font-size: 0.85rem;
          color: #aaa;
        }
        
        .participant-mini-badge {
          display: inline-block;
          background-color: rgba(255, 173, 51, 0.2);
          color: #ffad33;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          margin-top: 0.5rem;
          border: 1px solid rgba(255, 173, 51, 0.3);
        }
        
        .checkin-timestamp {
          font-size: 0.85rem;
          color: #aaa;
          margin-top: 1rem;
        }

        .checkin-error-icon {
          margin-bottom: 1.5rem;
          animation: errorPulse 2s ease infinite;
        }
        
        @keyframes errorPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .checkin-error-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #e74c3c;
          margin-bottom: 1rem;
        }
        
        .checkin-error-message {
          background-color: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
          max-width: 500px;
          width: 100%;
        }
        
        .checkin-error-message p {
          color: white;
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        
        .checkin-error-help {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .checkin-error-help p {
          font-weight: 600;
          color: #e74c3c;
          margin-bottom: 0.5rem;
        }
        
        .checkin-error-help ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          color: #ccc;
        }
        
        .checkin-error-help li {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .min-chars-notice {
          text-align: center;
          padding: 0.75rem;
          margin-bottom: 1rem;
          background-color: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          color: #ffc107;
          font-size: 0.9rem;
        }

        .checkin-info-icon {
          margin-bottom: 1.5rem;
          animation: infoPulse 2s ease infinite;
        }
        
        @keyframes infoPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .checkin-info-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #ffa500;
          margin-bottom: 1rem;
        }
        
        .already-checked-in-badge {
          display: inline-block;
          background-color: rgba(255, 165, 0, 0.2);
          color: #ffa500;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 165, 0, 0.3);
        }
        
        .already-checked-in-result {
          text-align: center;
          max-width: 500px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .participant-badges-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

// Composant pour afficher la liste des participants filtrés
interface ParticipantListProps {
  query: string;
  eventSlug: string;
  onSelectParticipant: (participant: Participant) => void;
}

function ParticipantList({ query, eventSlug, onSelectParticipant }: ParticipantListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  // Récupère d'abord l'ID de l'événement à partir du slug
  useEffect(() => {
    const getEventId = async () => {
      try {
        console.log("Recherche de l'ID d'événement pour le slug:", eventSlug);
        const response = await fetch(`/api/events/slug/${eventSlug}`);
        
        if (!response.ok) {
          console.error(`Erreur lors de la récupération de l'ID d'événement: ${response.status} ${response.statusText}`);
          throw new Error(`Impossible de récupérer les informations de l'événement (${response.status})`);
        }
        
        const data = await response.json();
        console.log("ID d'événement récupéré:", data.id);
        
        if (!data.id) {
          console.error("L'API a renvoyé une réponse sans ID d'événement");
          throw new Error("ID d'événement non trouvé");
        }
        
        setEventId(data.id);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ID d'événement:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        setError(errorMessage);
      }
    };

    getEventId();
  }, [eventSlug]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Recherche de participants pour l'événement ${eventId} avec la requête "${query}"`);
        // Astuce: ajouter un timestamp pour éviter le cache du navigateur
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/events/${eventId}/participants/search?query=${encodeURIComponent(query)}&_=${timestamp}`);
        
        console.log("Statut de la réponse:", response.status, response.statusText);
        
        if (!response.ok) {
          console.error(`Erreur API (${response.status}): ${response.statusText}`);
          
          // Tentative de récupération du message d'erreur du serveur
          try {
            const errorData = await response.json();
            console.error("Détails de l'erreur:", errorData);
            throw new Error(errorData.message || `Erreur ${response.status} lors de la recherche`);
          } catch {
            throw new Error(`Erreur ${response.status} lors de la recherche`);
          }
        }
        
        const data = await response.json();
        console.log("Résultats de recherche reçus:", data);
        
        // Vérifier que data.results existe et est un tableau
        if (!data.results || !Array.isArray(data.results)) {
          console.error("Le format de réponse est incorrect:", data);
          throw new Error("Format de données incorrect");
        }
        
        // Transforme les données au format attendu par le composant
        const formattedParticipants: Participant[] = data.results.map((p: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          type: string;
          checkedIn: boolean;
          checkInTime?: string;
          shortCode?: string;
        }) => ({
          id: p.id,
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          email: p.email || "",
          type: p.type || "Participant",
          company: undefined, // Ces champs ne sont pas disponibles dans la base de données
          jobTitle: undefined, // Ces champs ne sont pas disponibles dans la base de données
          checkedIn: Boolean(p.checkedIn),
          checkInTime: p.checkInTime ? new Date(p.checkInTime) : undefined,
          shortCode: p.shortCode
        }));
        
        setParticipants(formattedParticipants);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
        setError(errorMessage);
        console.error("Erreur détaillée lors de la recherche:", e);
      } finally {
        setLoading(false);
      }
    };

    if (query.length >= 2 && eventId) {
      fetchParticipants();
    } else {
      setParticipants([]);
    }
  }, [query, eventId]);

  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="checkin-spinner"></div>
        <span>Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        Erreur lors de la recherche
        <span className="error-details">{error}</span>
      </div>
    );
  }

  if (participants.length === 0 && query.length >= 2) {
    return <div className="no-results">Aucun participant trouvé</div>;
  }

  return (
    <div className="participants-results">
      {participants.map((participant) => (
        <div className="participant-item" key={participant.id} onClick={() => onSelectParticipant(participant)}>
          <div className="participant-info">
            <span className="participant-name">
              {participant.firstName} {participant.lastName}
            </span>
            <span className="participant-email">{participant.email}</span>
          </div>
          <div className="participant-meta">
            <span className="participant-type">{participant.type}</span>
            {participant.checkedIn && (
              <span className="participant-checked-in">✓ Enregistré</span>
            )}
          </div>
        </div>
      ))}
      
      <style jsx>{`
        .participants-results {
          max-height: 300px;
          overflow-y: auto;
          margin-top: 1rem;
          border-radius: 8px;
          background-color: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .participant-item {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .participant-item:last-child {
          border-bottom: none;
        }
        
        .participant-item:hover {
          background-color: rgba(40, 40, 40, 0.8);
        }
        
        .participant-info {
          display: flex;
          flex-direction: column;
        }
        
        .participant-name {
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }
        
        .participant-email {
          font-size: 0.85rem;
          color: #aaa;
        }
        
        .participant-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .participant-type {
          font-size: 0.8rem;
          color: #81B441;
          background-color: rgba(129, 180, 65, 0.1);
          border: 1px solid rgba(129, 180, 65, 0.3);
          border-radius: 12px;
          padding: 0.15rem 0.5rem;
        }
        
        .participant-checked-in {
          font-size: 0.8rem;
          color: #e67e22;
          margin-top: 0.5rem;
        }
        
        .loading-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #aaa;
        }
        
        .loading-indicator .checkin-spinner {
          margin-right: 0.75rem;
          width: 1.5rem;
          height: 1.5rem;
        }
        
        .error-message {
          padding: 1rem;
          color: #e74c3c;
          text-align: center;
          background-color: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
          border-radius: 8px;
        }
        
        .error-details {
          display: block;
          font-size: 0.8rem;
          margin-top: 0.5rem;
          color: #aaa;
        }
        
        .no-results {
          padding: 1.5rem;
          text-align: center;
          color: #aaa;
          font-style: italic;
        }
      `}</style>
    </div>
  );
} 