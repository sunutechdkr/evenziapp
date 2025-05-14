import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Vérification de l\'existence de l\'utilisateur...');
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'bouba@ineventapp.com',
      },
    });

    if (existingUser) {
      console.log('L\'utilisateur avec cet email existe déjà.');
      return;
    }

    console.log('Hachage du mot de passe...');
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash('Passer@1ok', 10);

    console.log('Création de l\'utilisateur admin...');
    // Créer l'utilisateur admin
    const user = await prisma.user.create({
      data: {
        name: 'Admin Principal',
        email: 'bouba@ineventapp.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log(`✅ Utilisateur admin créé avec l'ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 