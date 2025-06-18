import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, Permission } from '@/types/models';

// POST /api/users/roles
// Met à jour le rôle d'un utilisateur (admin uniquement)
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé. Action réservée aux administrateurs.' },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const { userId, role, permissions } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'ID utilisateur et rôle requis' },
        { status: 400 }
      );
    }

    // Vérifier que le rôle est valide
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que les permissions sont valides
    if (permissions) {
      const allPermissions = Object.values(Permission);
      const invalidPermissions = permissions.filter((p: string) => !allPermissions.includes(p as Permission));
      
      if (invalidPermissions.length > 0) {
        return NextResponse.json(
          { error: `Permissions invalides: ${invalidPermissions.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        permissions: permissions || []
      }
    });

    return NextResponse.json(
      { 
        message: 'Rôle et permissions mis à jour avec succès',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          permissions: updatedUser.permissions
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle :', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du rôle' },
      { status: 500 }
    );
  }
}

// GET /api/users/roles
// Récupère la liste des rôles et permissions disponibles
export async function GET() {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Non autorisé. Action réservée aux administrateurs.' },
        { status: 403 }
      );
    }

    // Renvoyer la liste des rôles et permissions
    return NextResponse.json({
      roles: Object.values(UserRole),
      permissions: Object.values(Permission)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles :', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des rôles' },
      { status: 500 }
    );
  }
} 