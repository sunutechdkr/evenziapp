"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function AutoLoginParticipantComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    const handleAutoLogin = async () => {
      try {
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');

        if (!userId || !email) {
          setStatus('error');
          setMessage('Paramètres de connexion manquants');
          return;
        }

        console.log('Tentative de connexion automatique pour:', email);

        // Utiliser NextAuth avec le provider credentials en mode auto-login
        const result = await signIn('credentials', {
          email: email,
          autoLogin: 'true',
          token: 'participant-otp-verified',
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          setStatus('success');
          setMessage('Connexion réussie ! Redirection...');
          
          // Rediriger vers le dashboard après un court délai
          setTimeout(() => {
            router.push('/dashboard/user');
          }, 1500);
        } else {
          throw new Error('Échec de la connexion');
        }

      } catch (error) {
        console.error('Erreur lors de la connexion automatique:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur lors de la connexion. Veuillez réessayer.');
      }
    };

    handleAutoLogin();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81B441] mx-auto mb-4"></div>
          <p className="text-white font-medium">{message}</p>
          <p className="text-gray-400 text-sm mt-2">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <div className="rounded-full h-12 w-12 bg-[#81B441] mx-auto flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[#81B441] font-medium text-lg mb-2">Connexion réussie !</p>
          <p className="text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
        <div className="rounded-full h-12 w-12 bg-red-500 mx-auto flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-400 font-medium text-lg mb-2">Erreur de connexion</p>
        <p className="text-gray-400 mb-4">{message}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-[#81B441] text-white rounded-lg hover:bg-[#6da136] transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}

export default function AutoLoginParticipantPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81B441] mx-auto mb-4"></div>
          <p className="text-white font-medium">Initialisation...</p>
        </div>
      </div>
    }>
      <AutoLoginParticipantComponent />
    </Suspense>
  );
} 