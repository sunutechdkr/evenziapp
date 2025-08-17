import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' | 'sponsor' | 'image'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Validation des types de fichiers selon le type d'upload
    const allowedTypesByCategory = {
      avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      sponsor: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg', 
        'image/png'
      ]
    };

    const category = type || 'image';
    const allowedTypes = allowedTypesByCategory[category as keyof typeof allowedTypesByCategory] || allowedTypesByCategory.image;
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Type de fichier non supporté pour ${category}. Types acceptés: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Taille max selon le type
    const maxSizes = {
      avatar: 5 * 1024 * 1024,  // 5MB pour avatars
      sponsor: 10 * 1024 * 1024, // 10MB pour logos sponsors  
      image: 10 * 1024 * 1024,   // 10MB pour images articles
      document: 5 * 1024 * 1024, // 5MB pour documents
    };

    const maxSize = maxSizes[type as keyof typeof maxSizes] || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Maximum ${Math.round(maxSize / (1024 * 1024))}MB pour ${type}.` 
      }, { status: 400 });
    }

    // Générer un nom de fichier avec timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${type}_${timestamp}.${extension}`;
    
    // Organiser par dossiers selon le type
    const pathname = `${type}s/${filename}`;

    console.log('📁 Upload vers Blob:', pathname);

    // Upload vers Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true, // Évite les conflits
    });

    console.log('✅ Upload Blob réussi:', blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
      type: file.type,
      originalName: file.name,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('❌ Erreur upload Blob:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload vers Vercel Blob' },
      { status: 500 }
    );
  }
} 