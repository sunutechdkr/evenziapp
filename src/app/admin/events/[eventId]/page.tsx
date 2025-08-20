'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminEventIdPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEventIdPage({ params }: AdminEventIdPageProps) {
  const router = useRouter();

  useEffect(() => {
    async function redirectToSlug() {
      try {
        const { id } = await params;
        
        // Récupérer le slug via l'API
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          router.push('/admin/events');
          return;
        }
        
        const event = await response.json();
        
        // Rediriger vers la nouvelle URL avec slug
        router.replace(`/admin/events/${event.slug}`);
      } catch (error) {
        console.error('Erreur lors de la redirection:', error);
        router.push('/admin/events');
      }
    }

    redirectToSlug();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection vers la nouvelle URL...</p>
      </div>
    </div>
  );
} 