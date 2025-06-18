import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Validation du fichier
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'Le fichier est trop volumineux (max 5MB)'
      }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Type de fichier non autorisé (JPEG, PNG, WebP uniquement)'
      }, { status: 400 });
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Le dossier existe déjà, c'est OK
    }

    // Générer un nom de fichier unique
    const fileName = `${randomUUID()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Écrire le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL publique du fichier
    const imageUrl = `/uploads/avatars/${fileName}`;

    // Mettre à jour l'utilisateur avec la nouvelle image
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: 'Avatar mis à jour avec succès',
      user: updatedUser,
      imageUrl
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    return NextResponse.json({
      error: 'Erreur lors de l\'upload de l\'avatar'
    }, { status: 500 });
  }
}

// DELETE - Supprimer l'avatar
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Remettre l'image à null (utilisera les initiales par défaut)
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { image: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: 'Avatar supprimé avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avatar:', error);
    return NextResponse.json({
      error: 'Erreur lors de la suppression de l\'avatar'
    }, { status: 500 });
  }
} 