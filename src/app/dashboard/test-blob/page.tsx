"use client";

import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs de build
const BlobUploadTest = dynamic(
  () => import('@/components/test/BlobUploadTest'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  }
);

export default function TestBlobPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test Vercel Blob Storage
          </h1>
          <p className="text-gray-600">
            Page de test pour vérifier l'intégration avec Vercel Blob
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test d'upload */}
          <div>
            <BlobUploadTest />
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📋 Instructions</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-md">
                <h3 className="font-medium text-yellow-800 mb-2">
                  🔧 Configuration actuelle
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• BLOB_READ_WRITE_TOKEN: ✅ Configuré</li>
                  <li>• Package @vercel/blob: ✅ Installé</li>
                  <li>• API /api/blob/upload: ✅ Créée</li>
                  <li>• Hook useFileUpload: ✅ Créé</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">
                  🧪 Pour tester Vercel Blob:
                </h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Modifiez .env.local:</li>
                  <li className="ml-4">
                    <code className="bg-blue-100 px-1 rounded">
                      NEXT_PUBLIC_USE_BLOB_STORAGE=&quot;true&quot;
                    </code>
                  </li>
                  <li>Redémarrez le serveur: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
                  <li>Uploadez une image ci-contre</li>
                  <li>Vérifiez l&apos;URL générée (domaine Vercel Blob)</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">
                  ✅ Migration progressive:
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Phase 1: Test avec avatars uniquement</li>
                  <li>• Phase 2: Migration des sponsors</li>
                  <li>• Phase 3: Migration des images d&apos;articles</li>
                  <li>• Phase 4: Nettoyage de l&apos;ancien système</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">
                  🔄 Variables de contrôle:
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_USE_BLOB_STORAGE</code>: Active/désactive Blob</p>
                  <p><code className="bg-gray-200 px-1 rounded">BLOB_MIGRATION_TYPES</code>: Types de fichiers pour Blob</p>
                  <p className="mt-2 text-xs">
                    Rollback instantané possible en changeant ces variables !
                  </p>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-md">
                <h3 className="font-medium text-red-800 mb-2">
                  ⚠️ Variables Vercel manquantes:
                </h3>
                <div className="text-sm text-red-700 space-y-1">
                  <p>Pour que Vercel Blob fonctionne en production :</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Allez dans Vercel Dashboard &gt; Settings &gt; Environment Variables</li>
                    <li>Ajoutez : <code className="bg-red-100 px-1 rounded">BLOB_READ_WRITE_TOKEN</code></li>
                    <li>Ajoutez : <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_USE_BLOB_STORAGE=true</code></li>
                    <li>Ajoutez : <code className="bg-red-100 px-1 rounded">BLOB_MIGRATION_TYPES=avatar</code></li>
                    <li>Redéployez l&apos;application</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 