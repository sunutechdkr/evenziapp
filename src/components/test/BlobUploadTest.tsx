"use client";

import { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function BlobUploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const { uploadFile, isUploading, progress, usingBlob } = useFileUpload({
    type: 'avatar',
    onSuccess: (uploadResult) => {
      setResult(uploadResult);
    },
    onError: (error) => {
      console.error('Erreur test:', error);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadFile(selectedFile);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🧪 Test Vercel Blob</h2>
      
      {/* Indicateur du système utilisé */}
      <div className="mb-4 p-3 rounded-md bg-gray-50">
        <p className="text-sm">
          <span className="font-medium">Système actuel:</span>{' '}
          <span className={usingBlob ? 'text-green-600' : 'text-blue-600'}>
            {usingBlob ? '🌟 Vercel Blob' : '📁 Stockage local'}
          </span>
        </p>
      </div>

      {/* Sélection de fichier */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choisir une image de test
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            📎 {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </p>
        )}
      </div>

      {/* Bouton d'upload */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full py-2 px-4 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-[#81B441] hover:bg-[#6ea836] transition-colors"
      >
        {isUploading ? `Upload... ${progress}%` : 'Tester l\'upload'}
      </button>

      {/* Barre de progression */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#81B441] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <h3 className="font-medium text-green-800 mb-2">✅ Upload réussi !</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{result.url}</a></p>
            {result.pathname && <p><strong>Chemin:</strong> {result.pathname}</p>}
            <p><strong>Taille:</strong> {Math.round(result.size / 1024)} KB</p>
            <p><strong>Type:</strong> {result.type}</p>
          </div>
          
          {/* Prévisualisation de l'image */}
          {result.url && (
            <div className="mt-3">
              <img 
                src={result.url} 
                alt="Preview" 
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
        <p className="font-medium mb-1">💡 Pour tester Vercel Blob:</p>
        <p>1. Changez <code>NEXT_PUBLIC_USE_BLOB_STORAGE="true"</code> dans .env.local</p>
        <p>2. Redémarrez le serveur de développement</p>
        <p>3. Testez l'upload ci-dessus</p>
      </div>
    </div>
  );
} 