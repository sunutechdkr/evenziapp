import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/models';
import bcrypt from 'bcryptjs';

// POST /api/users
// Crée un nouvel utilisateur (admin uniquement)
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

    const { name, email, password: userPassword, role, permissions } = await request.json();

    // Valider les données
    if (!name || !email || !userPassword) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Vérifier que le rôle est valide
    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || UserRole.USER,
        permissions: permissions || [],
      }
    });

    // Omettre le mot de passe dans la réponse
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pwd, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// GET /api/users
// Récupère la liste des utilisateurs (temporairement accessible sans être admin)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Extraire les paramètres de pagination et de recherche
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    
    // Calculer l'offset pour la pagination
    const offset = (page - 1) * limit;
    
    // Construire la requête
    const whereCondition = search
      ? { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};
    
    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
      where: whereCondition,
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
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });
    
    // Compter le nombre total d'utilisateurs pour la pagination
    const totalUsers = await prisma.user.count({
      where: whereCondition
    });
    
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalUsers / limit);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalPages,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
} 