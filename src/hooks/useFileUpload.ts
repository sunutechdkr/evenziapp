import { useState } from 'react';
import { toast } from 'react-hot-toast';

export type FileUploadType = 'avatar' | 'sponsor' | 'image';

interface UploadResult {
  url: string;
  pathname?: string;
  size: number;
  type: string;
  originalName: string;
}

interface UseFileUploadOptions {
  type: FileUploadType;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useFileUpload({ type, onSuccess, onError }: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Détermine s'il faut utiliser Vercel Blob ou l'ancien système
  const shouldUseBlob = () => {
    // Vérifier les variables d'environnement
    const useBlobStorage = process.env.NEXT_PUBLIC_USE_BLOB_STORAGE === 'true';
    const migrationTypes = process.env.BLOB_MIGRATION_TYPES?.split(',') || [];
    
    return useBlobStorage && migrationTypes.includes(type);
  };

  const uploadFile = async (file: File) => {
    if (!file) {
      const error = 'Aucun fichier sélectionné';
      onError?.(error);
      toast.error(error);
      return null;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Choisir l'endpoint selon la configuration
      const useBlob = shouldUseBlob();
      const endpoint = useBlob ? '/api/blob/upload' : getClassicEndpoint(type);
      
      console.log(`📤 Upload ${type} via ${useBlob ? 'Vercel Blob' : 'système classique'}`);

      // Simuler le progrès pour les petits fichiers
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      
      const uploadResult: UploadResult = {
        url: result.url,
        pathname: result.pathname,
        size: file.size,
        type: file.type,
        originalName: file.name,
      };

      onSuccess?.(uploadResult);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploadé${useBlob ? ' vers Blob' : ''} avec succès !`);
      
      return uploadResult;

    } catch (error) {
      console.error(`❌ Erreur upload ${type}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
      
      onError?.(errorMessage);
      toast.error(errorMessage);
      
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  // Mappage des types vers les anciens endpoints
  const getClassicEndpoint = (uploadType: FileUploadType): string => {
    switch (uploadType) {
      case 'avatar':
        return '/api/user/upload-avatar';
      case 'sponsor':
        return '/api/events/upload/sponsor'; // À créer si nécessaire
      case 'image':
        return '/api/upload/image';
      default:
        return '/api/upload/image';
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    usingBlob: shouldUseBlob(),
  };
} 