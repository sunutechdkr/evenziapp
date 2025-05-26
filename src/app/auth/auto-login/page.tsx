"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AutoLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleAutoLogin = async () => {
      try {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');

        if (!token || !userId) {
          setStatus('error');
          return;
        }

        // Vérifier le token et créer la session
        const response = await fetch('/api/auth/verify-auto-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, userId }),
        });

        if (!response.ok) {
          throw new Error('Token invalide');
        }

        const data = await response.json();

        // Connecter l'utilisateur avec NextAuth
        const result = await signIn('credentials', {
          email: data.user.email,
          autoLogin: 'true',
          token: token,
          redirect: false,
        });

        if (result?.ok) {
          setStatus('success');
          // Rediriger vers le dashboard après un court délai
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Erreur lors de la connexion automatique:', error);
        setStatus('error');
      }
    };

    handleAutoLogin();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 bg-green-500 mx-auto flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-4 text-green-600 font-medium">Connexion réussie !</p>
          <p className="text-gray-600">Redirection vers le dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="rounded-full h-12 w-12 bg-red-500 mx-auto flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="mt-4 text-red-600 font-medium">Erreur de connexion</p>
        <p className="text-gray-600">Veuillez réessayer.</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
} 