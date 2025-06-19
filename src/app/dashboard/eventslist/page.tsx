"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { QrCodeIcon, UserIcon } from "@heroicons/react/24/outline";
import { Html5Qrcode } from "html5-qrcode";

// Simuler une base de données des participants
const participants = [
  { id: "1", firstName: "Amadou", lastName: "Diallo", email: "amadou.diallo@example.com", eventId: "event-1", qrCode: "PART-001" },
  { id: "2", firstName: "Fatou", lastName: "Sow", email: "fatou.sow@example.com", eventId: "event-1", qrCode: "PART-002" },
  { id: "3", firstName: "Omar", lastName: "Ndiaye", email: "omar.ndiaye@example.com", eventId: "event-2", qrCode: "PART-003" },
  { id: "4", firstName: "Aïda", lastName: "Ba", email: "aida.ba@example.com", eventId: "event-2", qrCode: "PART-004" },
  { id: "5", firstName: "Moussa", lastName: "Fall", email: "moussa.fall@example.com", eventId: "event-3", qrCode: "PART-005" },
  { id: "6", firstName: "Ndeye", lastName: "Sarr", email: "ndeye.sarr@example.com", eventId: "event-3", qrCode: "PART-006" },
  { id: "7", firstName: "Ibrahim", lastName: "Cissé", email: "ibrahim.cisse@example.com", eventId: "event-4", qrCode: "PART-007" },
  { id: "8", firstName: "Mariama", lastName: "Gueye", email: "mariama.gueye@example.com", eventId: "event-5", qrCode: "PART-008" }
];

// Composant principal qui utilise useSearchParams
function EventsListComponent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [activeTab, setActiveTab] = useState<'qr' | 'name'>('qr');
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<typeof participants>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<(typeof participants)[0] | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'loading' | 'active' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [cameraId, setCameraId] = useState<string>("");
  const [availableCameras, setAvailableCameras] = useState<{id: string, label: string}[]>([]);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);

  // Filtrer les participants en fonction de l'événement sélectionné
  const eventParticipants = eventId 
    ? participants.filter(p => p.eventId === eventId)
    : participants;

  // Initialiser le scanner QR
  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const initializeScanner = async () => {
      if (activeTab === 'qr' && !scannerInitialized) {
        setScannerStatus('loading');
        setScanMessage('Initialisation de la caméra...');
        
        try {
          // Initialisation du scanner
          html5QrCode = new Html5Qrcode("qr-reader");
          qrCodeScannerRef.current = html5QrCode;
          
          // Obtenir la liste des caméras disponibles
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length) {
            const formattedDevices = devices.map(device => ({
              id: device.id,
              label: device.label || `Caméra ${device.id}`
            }));
            setAvailableCameras(formattedDevices);
            setCameraId(devices[0].id); // Sélectionner la première caméra par défaut
            
            // Démarrer le scanner avec la caméra sélectionnée
            await startScanner(devices[0].id);
          } else {
            setScannerStatus('error');
            setScanMessage('Aucune caméra détectée. Veuillez autoriser l\'accès à la caméra.');
          }
        } catch (error) {
          console.error("Erreur lors de l'initialisation du scanner:", error);
          setScannerStatus('error');
          setScanMessage("Erreur lors de l'initialisation de la caméra. Veuillez vérifier les permissions.");
        }
      }
    };

    const startScanner = async (selectedCameraId: string) => {
      if (!qrCodeScannerRef.current) return;
      
      try {
        const html5QrCode = qrCodeScannerRef.current;
        // Configuration optimisée pour les QR codes carrés et plus grand
        const config = { 
          fps: 10,
          qrbox: { width: 300, height: 300 }, // Augmentation taille de la boîte de scan
          aspectRatio: 1, // Rapport d'aspect 1:1 pour QR carrés
          formatsToScan: ['qr_code'], // Uniquement scanner les QR codes
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: false // Désactiver le détecteur de code-barres
          } 
        };
        
        await html5QrCode.start(
          selectedCameraId, 
          config,
          (decodedText) => {
            console.log(`Code scanned: ${decodedText}`);
            setScannerStatus('success');
            setScanMessage(`Code détecté: ${decodedText}`);
            
            const participant = participants.find(p => p.qrCode === decodedText);
            if (participant) {
              setSelectedParticipant(participant);
              html5QrCode.stop();
            } else {
              // Si le code est détecté mais aucun participant correspondant
              setScannerStatus('error');
              setScanMessage('Code QR invalide. Aucun participant trouvé.');
              // On continue le scanning après 3 secondes
              setTimeout(() => {
                setScannerStatus('active');
                setScanMessage('Recherche de QR code...');
              }, 3000);
            }
          },
          (errorMessage) => {
            // Ignorer les erreurs de décodage standard qui se produisent lors du scan
            if (errorMessage.includes("QR code parse error")) return;
            
            console.log(`QR scan error: ${errorMessage}`);
          }
        );
        
        setScannerInitialized(true);
        setScannerStatus('active');
        setScanMessage('Recherche de QR code...');
      } catch (error) {
        console.error("Erreur lors du démarrage du scanner:", error);
        setScannerStatus('error');
        setScanMessage("Erreur lors du démarrage de la caméra. Veuillez réessayer.");
      }
    };

    if (activeTab === 'qr' && !scannerInitialized) {
      initializeScanner();
    }

    return () => {
      if (qrCodeScannerRef.current && scannerInitialized) {
        qrCodeScannerRef.current.stop()
          .then(() => console.log('Scanner stopped'))
          .catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [activeTab, scannerInitialized, participants]);

  // Fonction pour changer de caméra
  const switchCamera = async (newCameraId: string) => {
    if (qrCodeScannerRef.current && scannerInitialized) {
      try {
        await qrCodeScannerRef.current.stop();
        setScannerInitialized(false);
        setCameraId(newCameraId);
        // Le scanner redémarrera automatiquement avec useEffect
      } catch (error) {
        console.error("Erreur lors du changement de caméra:", error);
      }
    }
  };

  // Fonction pour redémarrer le scanner
  const restartScanner = () => {
    if (qrCodeScannerRef.current && scannerInitialized) {
      qrCodeScannerRef.current.stop()
        .then(() => {
          setScannerInitialized(false);
          setSelectedParticipant(null);
          setScannerStatus('idle');
        })
        .catch(err => console.error('Error stopping scanner:', err));
    } else {
      setScannerInitialized(false);
      setSelectedParticipant(null);
      setScannerStatus('idle');
    }
  };

  // Gérer la recherche par nom ou email
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results = eventParticipants.filter(p => 
      p.firstName.toLowerCase().includes(term) || 
      p.lastName.toLowerCase().includes(term) || 
      p.email.toLowerCase().includes(term)
    );
    
    setSearchResults(results);
  };

  // Effectuer la recherche lors de la saisie
  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  return (
    <div className="check-in-container">
      <header className="check-in-header">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            <span className="text-[#81B441]">In</span>event
          </Link>
          <div>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-md bg-black/20 hover:bg-black/40 transition flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Retour au Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="check-in-title">Bienvenue à InEvent!</h1>
          <p className="check-in-subtitle">Veuillez vous enregistrer pour imprimer votre badge d&apos;événement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          <button
            onClick={() => {
              setActiveTab('qr');
              setScannerInitialized(false);
              setSelectedParticipant(null);
            }}
            className={`check-in-option p-8 rounded-lg flex flex-col items-center ${
              activeTab === 'qr' ? 'active' : ''
            }`}
          >
            <div className="h-32 w-32 flex items-center justify-center mb-6">
              <QrCodeIcon className="h-24 w-24 check-in-icon" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Check-in avec QR code</h2>
          </button>

          <button
            onClick={() => {
              setActiveTab('name');
              setSelectedParticipant(null);
            }}
            className={`check-in-option p-8 rounded-lg flex flex-col items-center ${
              activeTab === 'name' ? 'active' : ''
            }`}
          >
            <div className="h-32 w-32 flex items-center justify-center mb-6">
              <UserIcon className="h-24 w-24 check-in-icon" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Rechercher par nom</h2>
          </button>
        </div>

        <div className="mt-12 w-full max-w-2xl">
          {selectedParticipant ? (
            <div className="check-in-participant">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#81B441]/10 flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-[#81B441]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {selectedParticipant.firstName} {selectedParticipant.lastName}
              </h3>
              <p className="text-gray-600 mb-4 text-center">{selectedParticipant.email}</p>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>
              <div className="flex justify-center mt-6">
                <button 
                  onClick={() => setSelectedParticipant(null)}
                  className="check-in-button py-2 px-4 rounded-md mr-4 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmer check-in
                </button>
                <button 
                  onClick={() => setSelectedParticipant(null)}
                  className="cancel-button py-2 px-4 rounded-md flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
              </div>
            </div>
          ) : activeTab === 'qr' ? (
            <div className="bg-black/30 p-8 rounded-lg text-center text-white backdrop-blur-sm border border-white/5">
              <h3 className="text-xl mb-6 font-medium">Scannez votre QR code</h3>
              {scannerStatus === 'loading' && (
                <div className="mb-4 py-2 px-4 bg-yellow-500/20 text-yellow-300 rounded-lg">
                  <p>{scanMessage}</p>
                </div>
              )}
              {scannerStatus === 'error' && (
                <div className="mb-4 py-2 px-4 bg-red-500/20 text-red-300 rounded-lg">
                  <p>{scanMessage}</p>
                </div>
              )}
              {scannerStatus === 'success' && (
                <div className="mb-4 py-2 px-4 bg-green-500/20 text-green-300 rounded-lg">
                  <p>{scanMessage}</p>
                </div>
              )}
              {scannerStatus === 'active' && (
                <div className="mb-4 py-2 px-4 bg-blue-500/20 text-blue-300 rounded-lg">
                  <p>{scanMessage}</p>
                </div>
              )}
              
              <div 
                id="qr-reader" 
                ref={scannerRef} 
                className="check-in-scanner aspect-square rounded-lg relative"
                style={{ width: '100%', height: '400px', maxWidth: '400px', margin: '0 auto' }}
              >
                {scannerStatus === 'active' && (
                  <div className="scanning-animation"></div>
                )}
              </div>
              
              {availableCameras.length > 1 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-white mb-2">Changer de caméra:</label>
                  <select
                    value={cameraId}
                    onChange={(e) => switchCamera(e.target.value)}
                    className="camera-selector"
                  >
                    {availableCameras.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mt-4 flex justify-center">
                {scannerStatus === 'error' && (
                  <button 
                    onClick={restartScanner}
                    className="py-3 px-6 bg-red-600/70 hover:bg-red-600 text-white rounded-lg transition-colors mr-2"
                  >
                    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Redémarrer
                  </button>
                )}
                {scannerStatus === 'active' && (
                  <button 
                    onClick={restartScanner}
                    className="py-3 px-6 bg-yellow-600/70 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    Arrêter
                  </button>
                )}
              </div>
              
              <p className="text-white/50 text-sm mt-4">
                Si vous rencontrez des problèmes, assurez-vous d&apos;avoir autorisé l&apos;accès à la caméra dans les paramètres de votre navigateur.
              </p>
            </div>
          ) : (
            <div className="bg-black/30 p-8 rounded-lg text-white backdrop-blur-sm border border-white/5">
              <h3 className="text-xl mb-6 text-center font-medium">Rechercher un participant</h3>
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Entrez le nom ou l'email du participant"
                    className="participant-search-input w-full pl-10 rounded-lg focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 max-h-60 overflow-y-auto bg-black/20 rounded-lg border border-white/10">
                  {searchResults.map((participant) => (
                    <div 
                      key={participant.id}
                      className="participant-result p-3 cursor-pointer"
                      onClick={() => setSelectedParticipant(participant)}
                    >
                      <div className="font-medium text-white">{participant.firstName} {participant.lastName}</div>
                      <div className="text-sm text-white/70">{participant.email}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchTerm && searchResults.length === 0 && (
                <div className="text-center mt-8 py-6 bg-black/20 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-white/70">Aucun résultat trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="p-4 bg-gradient-to-r from-[#6a9636]/90 to-[#81B441]/90 text-white text-center backdrop-blur-sm relative z-10">
        <div className="container mx-auto">
          <p>Propulsé par DIMENSIONS-GROUP</p>
        </div>
      </footer>
    </div>
  );
}

// Composant principal qui utilise Suspense
export default function EventsListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsListComponent />
    </Suspense>
  );
} 