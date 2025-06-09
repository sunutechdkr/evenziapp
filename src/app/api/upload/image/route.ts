import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.' 
      }, { status: 400 });
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Le fichier est trop volumineux. Maximum 5MB.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `image_${timestamp}_${randomString}.${extension}`;

    // Créer le dossier uploads/images s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Le dossier existe déjà
    }

    // Optimiser l'image avec Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize({
        width: 800,  // Largeur max 800px
        height: 600, // Hauteur max 600px
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Enregistrer le fichier optimisé
    const finalFileName = fileName.replace(/\.[^/.]+$/, '.jpg'); // Convertir en JPG
    const filePath = join(uploadsDir, finalFileName);
    await writeFile(filePath, optimizedBuffer);

    // Retourner l'URL de l'image
    const imageUrl = `/uploads/images/${finalFileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      originalSize: file.size,
      optimizedSize: optimizedBuffer.length,
      compression: `${Math.round((1 - optimizedBuffer.length / file.size) * 100)}%`
    });

  } catch (error) {
    console.error('Erreur upload image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    );
  }
} 