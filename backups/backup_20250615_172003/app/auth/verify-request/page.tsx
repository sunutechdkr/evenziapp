"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CheckCircleIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function VerifyRequestPage() {
  const [email, setEmail] = useState<string | null>(null);
  
  useEffect(() => {
    // Récupérer l'email depuis le stockage de session si disponible
    const storedEmail = sessionStorage.getItem('verifyEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#81B441]/30 to-[#81B441]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-md"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-[#81B441]/20 to-[#81B441]/5 rounded-full translate-x-1/4 translate-y-1/4 blur-md"></div>
      <div className="absolute top-1/4 right-1/5 w-16 h-16 bg-gradient-to-br from-[#81B441]/15 to-[#81B441]/5 rounded-full blur-md"></div>
      
      {/* Animated stars background */}
      <div className="stars-container absolute inset-0 overflow-hidden opacity-60">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="star absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 5 + 5}s`,
            }}
          />
        ))}
      </div>
      
      <div className="w-full max-w-md px-8 py-10 bg-gray-800 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm relative z-10 border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 animate-fadeIn">
            <h1 className="text-3xl font-bold flex items-center text-white">
              <span className="text-[#81B441] font-extrabold">In</span>
              <span>event</span>
              <svg
                className="w-10 h-10 ml-2 animate-pulse"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="20" r="18" fill="#81B441" />
                <path
                  d="M14 19.5L18 23.5L26 15.5"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-gray-700 rounded-full p-4 mb-4">
            <EnvelopeIcon className="h-10 w-10 text-[#81B441]" />
          </div>
          
          <h2 className="text-xl font-semibold text-white">Vérifiez votre boîte mail</h2>
          
          <p className="text-gray-300 text-sm">
            {email ? (
              <>Un lien de connexion a été envoyé à <span className="text-white font-medium">{email}</span>.</>
            ) : (
              <>Un lien de connexion a été envoyé à votre adresse email.</>
            )}
          </p>
          
          <p className="text-gray-400 text-sm px-4">
            Cliquez sur le lien dans l'email pour vous connecter à votre compte. Le lien est valable pendant 10 minutes.
          </p>
          
          <div className="mt-8 flex flex-col space-y-3 w-full">
            <Link 
              href="/login" 
              className="w-full py-2 px-4 border border-[#81B441] text-[#81B441] rounded-md text-center hover:bg-[#81B441]/10 transition-colors font-medium"
            >
              Retour à la page de connexion
            </Link>
          </div>
          
          <div className="mt-4 text-gray-500 text-xs">
            Vous n'avez pas reçu d'email ? Vérifiez votre dossier spam ou réessayez de vous connecter.
          </div>
        </div>
      </div>
      
      {/* Add CSS for animated stars */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        .star {
          animation: twinkle infinite;
        }
      `}</style>
    </div>
  );
} 