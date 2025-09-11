import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/models';
import bcrypt from 'bcryptjs';

// GET /api/users/:id
// Récupère les détails d'un utilisateur par son ID (admin uniquement)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé. Action réservée aux administrateurs.' },
        { status: 403 }
      );
    }

    const userId = (await params).userId;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur :', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PUT /api/users/:id
// Met à jour un utilisateur existant (admin uniquement)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé. Action réservée aux administrateurs.' },
        { status: 403 }
      );
    }

    const userId = (await params).userId;
    const { name, email, role, plan, permissions, password } = await request.json();

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le rôle est valide
    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le plan est valide
    if (plan && !['STARTER', 'PRO', 'PREMIUM'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      );
    }

    // Empêcher la modification du propre compte admin
    if (userId === session.user.id && role && role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas changer votre propre rôle administrateur' },
        { status: 400 }
      );
    }

    // Préparer les données à mettre à jour
    const updateData: Record<string, unknown> = {
      name,
      email,
      role,
    };

    // Si le plan est fourni, l'ajouter aux données de mise à jour
    if (plan) {
      updateData.plan = plan;
    }

    // Si les permissions sont fournies, les mettre à jour
    if (permissions) {
      updateData.permissions = permissions;
    }

    // Si un mot de passe est fourni, le hacher
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });

    return NextResponse.json(
      { message: 'Utilisateur mis à jour avec succès', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id
// Supprime un utilisateur (admin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé. Action réservée aux administrateurs.' },
        { status: 403 }
      );
    }

    const userId = (await params).userId;

    // Empêcher la suppression de son propre compte
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json(
      { message: 'Utilisateur supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
} 