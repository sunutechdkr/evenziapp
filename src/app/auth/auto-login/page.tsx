"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function AutoLoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    const handleAutoLogin = async () => {
      try {
        const email = searchParams.get('email');
        const token = searchParams.get('token');

        if (!email || !token) {
          setMessage('Paramètres de connexion manquants');
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        }

        const result = await signIn('credentials', {
          email,
          token,
          autoLogin: 'true',
          redirect: false,
        });

        if (result?.error) {
          setMessage('Erreur de connexion: ' + result.error);
          setTimeout(() => router.push('/auth/signin'), 2000);
          return;
        }

        if (result?.ok) {
          setMessage('Connexion réussie! Redirection...');
          setTimeout(() => router.push('/dashboard'), 1000);
        } else {
          setMessage('Échec de la connexion');
          setTimeout(() => router.push('/auth/signin'), 2000);
        }
      } catch (error) {
        console.error('Auto-login error:', error);
        setMessage('Erreur de connexion');
        setTimeout(() => router.push('/auth/signin'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAutoLogin();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {isLoading && (
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          )}
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function AutoLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-sm text-gray-600">Initialisation...</p>
        </div>
      </div>
    }>
      <AutoLoginComponent />
    </Suspense>
  );
} 